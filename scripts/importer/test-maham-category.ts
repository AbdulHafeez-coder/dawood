import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

chromium.use(stealth());

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto("https://www.mahamenterprises.com/omega.html", { waitUntil: "domcontentloaded", timeout: 60000 });
  
  const text = await page.evaluate(() => document.body.innerText.replace(/\n+/g, '\n').substring(0, 1000));
  console.log("BODY TEXT:", text);
  
  await browser.close();
}

run().catch(console.error);
