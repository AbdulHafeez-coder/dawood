import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { generateSlug } from "./normalizer";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
chromium.use(stealth());

const BRANDS = [
  { name: "Omega", url: "https://www.mahamenterprises.com/omega.html" },
  { name: "Glory", url: "https://www.mahamenterprises.com/glory.html" },
  { name: "Elite Royal", url: "https://www.mahamenterprises.com/eliteroyal.html" },
  { name: "JPI", url: "https://www.mahamenterprises.com/jpi.html" },
  { name: "Three Star", url: "https://www.mahamenterprises.com/threestar.html" },
  { name: "Classic", url: "https://www.mahamenterprises.com/classic.html" },
  { name: "Prince Ware", url: "https://www.mahamenterprises.com/princeware.html" },
  { name: "Rock Star", url: "https://www.mahamenterprises.com/rockstar.html" },
];

async function ensureCategory() {
  const catName = "Crockery";
  const { data } = await supabase.from("categories").select("name").eq("name", catName).single();
  if (!data) {
    await supabase.from("categories").insert({ name: catName });
  }
  return catName;
}

async function run() {
  console.log("Starting Maham Enterprises Data Import...");
  const category = await ensureCategory();

  const { data: existingProducts, error: dbError } = await supabase.from("products").select("slug");
  if (dbError) {
    console.error("Failed to fetch existing products:", dbError);
    process.exit(1);
  }
  const existingSlugs = new Set(existingProducts.map((p) => p.slug).filter(Boolean));

  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();

  const report = {
    totalFound: 0,
    imported: 0,
    skippedDuplicates: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const brand of BRANDS) {
    console.log(`\nProcessing brand: ${brand.name} (${brand.url})`);
    try {
      await page.goto(brand.url, { waitUntil: "domcontentloaded", timeout: 30000 });

      const images = await page.$$eval("img", (imgs) =>
        imgs
          .map((i) => i.src)
          .filter(
            (src) => src.includes("images/") && !src.includes("logo") && !src.includes("banner"),
          ),
      );

      const uniqueImages = Array.from(new Set(images));
      console.log(`Found ${uniqueImages.length} images for ${brand.name}`);
      report.totalFound += uniqueImages.length;

      let count = 1;
      for (const img of uniqueImages) {
        const title = `${brand.name} Collection Item ${count}`;
        const slug = generateSlug(title);

        if (existingSlugs.has(slug)) {
          console.log(`  Skipping duplicate: ${title}`);
          report.skippedDuplicates++;
          count++;
          continue;
        }

        const newProduct = {
          id: `maham-${slug}`,
          name: title,
          price: 0, // Fallback price
          rating: 5.0,
          tag: brand.name, // Use brand as tag
          tagline: `Official ${brand.name} product from Maham Enterprises`,
          bg: "bg-gray-50",
          category: category,
          description: `Premium quality ${brand.name} item. Browse the official Maham Enterprises catalog.`,
          details: [brand.name, "Maham Enterprises"],
          gallery: [img],
          img: img,
          slug: slug,
          seo_title: `${title} | Maham Enterprises`,
          seo_description: `Shop ${title} from Maham Enterprises. Discover quality ${brand.name} collections.`,
        };

        try {
          const { error } = await supabase.from("products").insert(newProduct);
          if (error) throw error;
          console.log(`  Imported: ${title}`);
          existingSlugs.add(slug);
          report.imported++;
        } catch (err: unknown) {
          console.error(
            `  Failed to import ${title}:`,
            err instanceof Error ? err.message : String(err),
          );
          report.failed++;
          report.errors.push(`[${title}] ${err instanceof Error ? err.message : String(err)}`);
        }
        count++;
      }
    } catch (err: unknown) {
      console.error(
        `Failed to process brand ${brand.name}:`,
        err instanceof Error ? err.message : String(err),
      );
      report.errors.push(
        `[Brand ${brand.name}] ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  await browser.close();

  console.log("\n===============================");
  console.log("FINAL REPORT");
  console.log("Products found:", report.totalFound);
  console.log("Products imported:", report.imported);
  console.log("Duplicates skipped:", report.skippedDuplicates);
  console.log("Failed products:", report.failed);
  if (report.errors.length > 0) {
    console.log("Errors:");
    report.errors.forEach((e) => console.log(e));
  }
  console.log("===============================");

  // Write report to JSON for the IDE
  fs.writeFileSync(
    path.resolve(__dirname, "../../scratch/maham-report.json"),
    JSON.stringify(report, null, 2),
  );
}

import fs from "fs";
run().catch(console.error);
