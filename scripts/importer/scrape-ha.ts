import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
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
chromium.use(stealth());

async function run() {
  console.log("Starting Home Attire scraper...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allUrls = new Set<string>();
  let currentPage = 1;
  let hasNext = true;

  while (hasNext) {
    const url =
      currentPage === 1
        ? "https://homeattire.pk/product-category/dining-table-covers/"
        : `https://homeattire.pk/product-category/dining-table-covers/page/${currentPage}/`;

    console.log(`Crawling page ${currentPage}...`);
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    if (res && res.status() === 404) {
      console.log("Reached 404 page, stopping pagination.");
      break;
    }

    const links = await page.$$eval("a.product-image-link", (anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).href),
    );

    if (links.length === 0) {
      console.log("No products found on page, stopping.");
      break;
    }

    links.forEach((l) => allUrls.add(l));
    console.log(`Found ${links.length} products on page ${currentPage}.`);

    const nextBtn = await page.$(".next.page-numbers");
    if (nextBtn) {
      currentPage++;
    } else {
      hasNext = false;
    }
  }

  console.log(`Total unique products found: ${allUrls.size}`);

  const products = Array.from(allUrls);
  const scrapedData = [];

  for (let i = 0; i < products.length; i++) {
    const url = products[i];
    console.log(`[${i + 1}/${products.length}] Scraping ${url}`);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      const title = await page.$eval("h1.product_title", (el) => el.textContent?.trim() || "");
      const description = await page
        .$eval("#tab-description", (el) => el.textContent?.trim() || "")
        .catch(() => "");
      const images = await page.$$eval(".woocommerce-product-gallery__image img", (imgs) =>
        imgs.map((i) => (i as HTMLImageElement).src),
      );

      // Look for variations
      const variationsRaw = await page
        .$eval("form.variations_form", (el) => el.getAttribute("data-product_variations"))
        .catch(() => null);

      let variations = [];
      if (variationsRaw) {
        variations = JSON.parse(variationsRaw);
      } else {
        // simple product
        const price = await page
          .$eval("p.price .amount bdi", (el) => el.textContent?.replace(/[^0-9.]/g, "") || "0")
          .catch(() => "0");
        variations = [
          { attributes: { attribute_size: "Standard" }, display_price: parseFloat(price) },
        ];
      }

      scrapedData.push({ url, title, description, images, variations });
    } catch (e: unknown) {
      console.error(`Failed to scrape ${url}:`, e instanceof Error ? e.message : String(e));
    }
  }

  fs.writeFileSync(
    path.resolve(__dirname, "../../scratch/ha_data.json"),
    JSON.stringify(scrapedData, null, 2),
  );
  console.log("Saved to ha_data.json");

  await browser.close();
}

run().catch(console.error);
