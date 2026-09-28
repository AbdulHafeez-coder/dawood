import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { generateSlug } from "./normalizer";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BRANDS = [
  "Omega",
  "Glory",
  "Elite Royal",
  "JPI",
  "Three Star",
  "Classic",
  "Prince Ware",
  "Rock Star",
];

function extractName(text: string, brand: string): string | null {
  const t = text.toUpperCase().replace(/\n/g, " ");
  const types = [
    "JAR",
    "BASKET",
    "BOWL",
    "TRAY",
    "MUG",
    "JUG",
    "BOTTLE",
    "CONTAINER",
    "HOT POT",
    "COOLER",
    "SPICE RACK",
    "LUNCH BOX",
    "ORGANIZER",
    "STAND",
    "RACK",
    "BUCKET",
    "DUSTBIN",
  ];

  for (const type of types) {
    const idx = t.indexOf(" " + type);
    if (idx !== -1) {
      // Get the 30 characters before the type
      const before = t.substring(Math.max(0, idx - 30), idx).trim();
      const words = before.split(" ");
      // Take up to 3 words before the type
      const nameParts = words
        .slice(-3)
        .filter(
          (w) =>
            ![
              "PCS",
              "BUNDLE",
              "NEW",
              "PRODUCT",
              "COLLECTION",
              brand.toUpperCase(),
              "MAHAM",
              "ENTERPRISES",
              "SIZE",
              "LARGE",
              "SMALL",
              "MEDIUM",
            ].includes(w),
        );
      const cleanName = nameParts
        .join(" ")
        .replace(/[^A-Z0-9 ]/g, "")
        .trim();

      if (cleanName.length > 2) {
        // Capitalize words
        const formatted = (cleanName + " " + type)
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
        return brand + " " + formatted;
      }
    }
  }
  return null;
}

async function run() {
  console.log("Starting Phase 3 & 4: Grouping and DB Insertion...");

  // Brands remain product metadata; they must not create shop categories.
  for (const category of ["Crockery"]) {
    const { data } = await supabase.from("categories").select("name").eq("name", category).single();
    if (!data) {
      console.log(`Creating category: ${category}`);
      await supabase.from("categories").insert({ name: category });
    }
  }

  // 2. Read OCR data
  const rawData = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "../../scratch/maham-ocr.json"), "utf8"),
  );

  const groupedProducts: Record<string, { brand: string; name: string; images: string[] }> = {};
  let skipped = 0;

  // 3. Process & Group
  for (const item of rawData) {
    const name = extractName(item.text, item.brand);
    if (!name) {
      console.log(`Skipped (No reliable name found): ${item.url}`);
      skipped++;
      continue;
    }

    if (!groupedProducts[name]) {
      groupedProducts[name] = { brand: item.brand, name, images: [] };
    }
    groupedProducts[name].images.push(item.url);
  }

  const products = Object.values(groupedProducts);
  console.log(
    `\nFound ${products.length} reliable products with ${rawData.length - skipped} total images. Skipped ${skipped} unidentifiable images.\n`,
  );

  // 4. Insert into DB
  let imported = 0;
  for (const product of products) {
    const slug = generateSlug(product.name);

    // Check if exists
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();
    if (existing) {
      console.log(`Duplicate skipped: ${product.name}`);
      continue;
    }

    // Determine a reasonable price based on name (heuristic)
    let price = 500;
    if (product.name.toLowerCase().includes("jar") || product.name.toLowerCase().includes("basket"))
      price = 850;
    if (
      product.name.toLowerCase().includes("hot pot") ||
      product.name.toLowerCase().includes("cooler")
    )
      price = 2500;

    const newProduct = {
      id: `maham-${slug}`,
      name: product.name,
      price: price,
      rating: 5.0,
      tag: product.brand,
      tagline: `Official ${product.brand} plasticware`,
      bg: "bg-gray-50",
      category: "Crockery",
      description: `Premium quality ${product.name} from ${product.brand}. Perfect for organizing and everyday household use.`,
      details: [product.brand, "Maham Enterprises", "Plasticware"],
      gallery: product.images,
      img: product.images[0],
      slug: slug,
      seo_title: `${product.name} | ${product.brand}`,
      seo_description: `Shop ${product.name} by ${product.brand}. Quality plasticware for your home.`,
    };

    const { error } = await supabase.from("products").insert(newProduct);
    if (error) {
      console.error(`Error inserting ${product.name}:`, error.message);
    } else {
      console.log(`Imported: ${product.name} with ${product.images.length} images`);
      imported++;
    }
  }

  // Final Report
  console.log("\n===============================");
  console.log("FINAL REPORT");
  console.log("Total Maham brands processed:", BRANDS.length);
  console.log("Total images discovered:", rawData.length);
  console.log("Total products successfully imported:", imported);
  console.log("Total images skipped (unidentifiable):", skipped);
  console.log(
    "Number of multi-image products:",
    products.filter((p) => p.images.length > 1).length,
  );
  console.log("Existing Dawood Mart and DeliSoga products were not modified or deleted.");
  console.log("===============================");
}

run().catch(console.error);
