import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

chromium.use(stealth());

async function run() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to https://www.mahamenterprises.com/...");
  await page.goto("https://www.mahamenterprises.com/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  console.log("Extracting links...");
  const links = await page.$$eval("a", (as) =>
    as
      .map((a) => ({ href: a.href, text: a.innerText.trim() }))
      .filter((a) => a.href && a.href.includes("mahamenterprises.com") && a.text.length > 0),
  );

  const uniqueLinks = Array.from(new Map(links.map((l) => [l.href, l])).values());
  console.log("Found links:");
  uniqueLinks.slice(0, 50).forEach((l) => console.log(`- ${l.text}: ${l.href}`));

  const text = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log("Body preview:");
  console.log(text);

  await browser.close();
}

run().catch(console.error);
