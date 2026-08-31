import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import { normalizeTitle, generateSlug, mapCategory, cleanDescription, generateSEOTitle, generateSEODescription } from "./normalizer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY; // Service role key

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

chromium.use(stealth());

async function run() {
  console.log("Launching headless browser...");
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log("Fetching products from DeliSoga...");
  const limit = 250;
  
  await page.goto(`https://delisogapakistan.com/products.json?limit=${limit}`);
  
  let productsJson: any = { products: [] };
  
  try {
    const text = await page.evaluate(() => document.body.innerText);
    productsJson = JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse products.json. The site might not expose it.", err);
    await browser.close();
    return;
  }
  
  await browser.close();

  const sourceProducts = productsJson.products || [];
  console.log(`Found ${sourceProducts.length} products.`);

  const report = {
    totalFound: sourceProducts.length,
    imported: 0,
    skippedDuplicates: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Fetch existing slugs to avoid duplicates
  const { data: existingProducts, error: dbError } = await supabase
    .from('products')
    .select('slug, id');
    
  if (dbError) {
    console.error("Failed to fetch existing products:", dbError);
    process.exit(1);
  }
  
  const existingSlugs = new Set(existingProducts.map(p => p.slug).filter(Boolean));

  for (const sp of sourceProducts) {
    const rawTitle = sp.title || "";
    const title = normalizeTitle(rawTitle);
    
    const slug = generateSlug(title);
    
    if (existingSlugs.has(slug)) {
      console.log(`Skipping duplicate: ${title}`);
      report.skippedDuplicates++;
      continue;
    }
    
    const category = mapCategory(sp.product_type || "", rawTitle);
    const price = parseFloat(sp.variants?.[0]?.price || "0");
    const images = (sp.images || []).map((img: any) => img.src);
    const description = cleanDescription(sp.body_html || "");
    const seoTitle = generateSEOTitle(title);
    const seoDesc = generateSEODescription(title, category);
    
    // Generate a short tagline
    const tagline = description.split('\n')[0].substring(0, 100) || title;

    const newProduct = {
      id: `p-${sp.id}`,
      name: title,
      price: price,
      rating: 5.0,
      tag: "NEW",
      tagline: tagline,
      bg: "bg-gray-100",
      category: category,
      description: description,
      details: sp.tags || [],
      gallery: images,
      img: images[0] || "",
      slug: slug,
      seo_title: seoTitle,
      seo_description: seoDesc,
    };

    try {
      const { error } = await supabase.from('products').insert(newProduct);
      if (error) throw error;
      
      console.log(`Imported: ${title}`);
      existingSlugs.add(slug);
      report.imported++;
    } catch (err: any) {
      console.error(`Failed to import ${title}:`, err.message);
      report.failed++;
      report.errors.push(`[${title}] ${err.message}`);
    }
  }

  console.log("===============================");
  console.log("FINAL REPORT");
  console.log("Products found:", report.totalFound);
  console.log("Products imported:", report.imported);
  console.log("Duplicates skipped:", report.skippedDuplicates);
  console.log("Failed products:", report.failed);
  if (report.errors.length > 0) {
    console.log("Errors:");
    report.errors.forEach(e => console.log(e));
  }
  console.log("===============================");
}

run().catch(console.error);
