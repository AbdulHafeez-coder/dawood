import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  const { data: allProducts, error } = await supabase.from("products").select("*");
  if (error) throw error;

  const imported = allProducts.filter((p) => p.id.startsWith("p-"));
  const original = allProducts.filter((p) => !p.id.startsWith("p-"));

  const report = {
    totalImported: imported.length,
    totalOriginal: original.length,
    missingImages: 0,
    brokenImages: 0,
    duplicateImages: 0,
    missingPrices: 0,
    emptyDescriptions: 0,
    missingSEO: 0,
    duplicateSlugs: 0,
    categoryIssues: 0,
    issues: [] as string[],
  };

  const slugs = new Set<string>();

  for (const p of imported) {
    // Check SEO
    if (!p.slug || !p.seo_title || !p.seo_description) {
      report.missingSEO++;
      report.issues.push(`Missing SEO: ${p.name}`);
    }

    // Check Duplicate slugs
    if (p.slug) {
      if (slugs.has(p.slug)) {
        report.duplicateSlugs++;
        report.issues.push(`Duplicate slug: ${p.slug} on ${p.name}`);
      } else {
        slugs.has(p.slug);
      }
    }

    // Missing prices
    if (p.price === null || p.price === undefined || p.price <= 0) {
      report.missingPrices++;
      report.issues.push(`Missing/zero price: ${p.name}`);
    }

    // Empty descriptions
    if (!p.description || p.description.trim() === "") {
      report.emptyDescriptions++;
      report.issues.push(`Empty description: ${p.name}`);
    }

    // Images
    if (!p.img || !p.gallery || p.gallery.length === 0) {
      report.missingImages++;
      report.issues.push(`Missing images: ${p.name}`);
    } else {
      if (!p.img.startsWith("http")) {
        report.brokenImages++;
        report.issues.push(`Broken image URL: ${p.name}`);
      }
    }

    // Categories
    const validCategories = [
      "Serving & Dining",
      "Decoration & Gift Items",
      "Cups & Drinkware",
      "Kitchen Items",
    ];
    if (!validCategories.includes(p.category)) {
      report.categoryIssues++;
      report.issues.push(`Unknown category: ${p.category} on ${p.name}`);
    }
  }

  console.log(JSON.stringify(report, null, 2));
}

runAudit().catch(console.error);
