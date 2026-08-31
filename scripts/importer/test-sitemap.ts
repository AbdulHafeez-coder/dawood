import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

chromium.use(stealth());

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log("Fetching sitemap...");
  await page.goto("https://delisogapakistan.com/sitemap_products_1.xml");
  
  const content = await page.content();
  console.log(content.substring(0, 1000));
  
  await browser.close();
}

run().catch(console.error);
