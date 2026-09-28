import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function cleanDescription(html: string): string {
  return html.replace(/<[^>]*>?/gm, "").trim();
}

async function run() {
  console.log("Starting Home Attire Importer...");

  const dataPath = path.resolve(__dirname, "../../scratch/ha_data.json");
  if (!fs.existsSync(dataPath)) {
    console.error("No scraped data found. Run scrape-ha.ts first.");
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  console.log(`Loaded ${products.length} source products.`);

  const { data: existingProducts, error: dbError } = await supabase
    .from("products")
    .select("slug, id");

  if (dbError) {
    console.error("Failed to fetch existing products:", dbError);
    process.exit(1);
  }

  const existingSlugs = new Set(existingProducts.map((p) => p.slug).filter(Boolean));
  const existingTitles = new Set(
    existingProducts.map((p) => p.name?.toLowerCase()).filter(Boolean),
  );

  const report = {
    totalProcessed: 0,
    imported: 0,
    skippedDuplicates: 0,
    failed: 0,
    errors: [] as string[],
  };

  const colorPatternCounters: Record<string, number> = {};

  function getCustomSku(title: string): string {
    const t = title.toLowerCase();
    let color = "MIX";
    if (t.includes("grey") || t.includes("gray")) color = "GREY";
    else if (t.includes("gold")) color = "GOLD";
    else if (t.includes("blue")) color = "BLUE";
    else if (t.includes("red")) color = "RED";
    else if (t.includes("green")) color = "GREEN";
    else if (t.includes("white")) color = "WHITE";
    else if (t.includes("black")) color = "BLACK";
    else if (t.includes("brown")) color = "BROWN";
    else if (t.includes("transparent") || t.includes("clear")) color = "CLEAR";

    let pattern = "STD";
    if (t.includes("floral") || t.includes("flower")) pattern = "FLORAL";
    else if (t.includes("geometric")) pattern = "GEOMETRIC";
    else if (t.includes("leaf")) pattern = "LEAF";
    else if (t.includes("herringbone")) pattern = "HERRINGBONE";
    else if (t.includes("marble")) pattern = "MARBLE";
    else if (t.includes("fancy")) pattern = "FANCY";

    const prefix = `TS-${color}-${pattern}`;
    colorPatternCounters[prefix] = (colorPatternCounters[prefix] || 0) + 1;
    const num = colorPatternCounters[prefix].toString().padStart(2, "0");
    return `${prefix}-${num}`;
  }

  for (const p of products) {
    report.totalProcessed++;
    const baseTitle = p.title.replace(/\s*for.*?seater.*?table/i, "").trim();
    const baseSku = getCustomSku(baseTitle);

    // Process variations
    let variantsToProcess = p.variations || [];
    if (variantsToProcess.length === 0) {
      // fallback if no variations array
      variantsToProcess = [
        {
          attributes: { attribute_size: "Standard" },
          display_price: 1500, // fallback
        },
      ];
    }

    for (const v of variantsToProcess) {
      const sizeRaw = (
        v.attributes?.attribute_pa_size ||
        v.attributes?.attribute_size ||
        ""
      ).replace(/-/g, " ");
      const sizeLabel = sizeRaw ? sizeRaw.charAt(0).toUpperCase() + sizeRaw.slice(1) : "Standard";

      const finalTitle = `${baseTitle} - ${sizeLabel}`;
      const slug = generateSlug(finalTitle);

      if (existingSlugs.has(slug) || existingTitles.has(finalTitle.toLowerCase())) {
        console.log(`Skipping duplicate: ${finalTitle}`);
        report.skippedDuplicates++;
        continue;
      }

      const price = v.display_price || 0;
      if (price === 0) {
        console.log(`Skipping ${finalTitle} - No price found.`);
        report.failed++;
        continue;
      }

      const description = cleanDescription(p.description || "");
      const tagline = description.split("\n")[0].substring(0, 100) || finalTitle;
      const sku = `${baseSku}-${sizeLabel
        .replace(/[^A-Za-z0-9]/g, "")
        .substring(0, 2)
        .toUpperCase()}`;

      let detailsArr = p.description
        .split("\n")
        .filter((d: string) => d.trim().length > 0)
        .map(cleanDescription);
      if (detailsArr.length === 0) detailsArr = ["Premium Dining Table Cover"];

      // Append custom SKU to details
      detailsArr.push(`Product Code: ${sku}`);

      const newProduct = {
        id: `ha-${slug}`,
        name: finalTitle,
        price: price,
        rating: 5.0,
        tag: "Dining Table Sheet",
        tagline: tagline,
        bg: "bg-gray-100",
        category: "Sheets",
        description: description,
        details: detailsArr,
        gallery: p.images || [],
        img: p.images?.[0] || "",
        slug: slug,
        seo_title: `${finalTitle} | Dawood Mart`,
        seo_description: tagline,
      };

      try {
        const { error } = await supabase.from("products").insert(newProduct);
        if (error) throw error;

        console.log(`Imported: ${finalTitle} (Price: ${price})`);
        existingSlugs.add(slug);
        existingTitles.add(finalTitle.toLowerCase());
        report.imported++;
      } catch (err: unknown) {
        console.error(
          `Failed to import ${finalTitle}:`,
          err instanceof Error ? err.message : String(err),
        );
        report.failed++;
        report.errors.push(`[${finalTitle}] ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  console.log("===============================");
  console.log("FINAL REPORT");
  console.log("Variations processed:", report.totalProcessed);
  console.log("Products imported:", report.imported);
  console.log("Duplicates skipped:", report.skippedDuplicates);
  console.log("Failed products:", report.failed);
  if (report.errors.length > 0) {
    console.log("Errors:");
    report.errors.forEach((e) => console.log(e));
  }
  console.log("===============================");
}

run().catch(console.error);
