import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import fs from "fs";

chromium.use(stealth());

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Fetching products.json...");
  await page.goto("https://delisogapakistan.com/products.json?limit=250");

  const content = await page.content();
  // Strip HTML wrap if any
  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync("products_test.json", text);
  console.log("Saved products_test.json. Length:", text.length);

  await browser.close();
}

run().catch(console.error);
