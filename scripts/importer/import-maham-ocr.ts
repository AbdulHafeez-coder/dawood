import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import fs from "fs";
import https from "https";
import path from "path";

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

function fetchOcr(url: string): Promise<string> {
  return new Promise((resolve) => {
    https
      .get(`https://api.ocr.space/parse/imageurl?apikey=helloworld&url=${url}`, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve(data));
      })
      .on("error", () => resolve(""));
  });
}

async function run() {
  console.log("Starting Phase 2: OCR Discovery...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const allImages = [];

  for (const brand of BRANDS) {
    console.log(`Checking ${brand.name}...`);
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

      for (const img of uniqueImages) {
        allImages.push({ brand: brand.name, url: img });
      }
    } catch (e: unknown) {
      console.log(`Failed to load ${brand.name}:`, e instanceof Error ? e.message : String(e));
    }
  }

  await browser.close();
  console.log(`Found ${allImages.length} images. Starting OCR (this may take a few minutes)...`);

  const results = [];
  // Process in chunks of 3 to avoid rate limits
  for (let i = 0; i < allImages.length; i += 3) {
    const chunk = allImages.slice(i, i + 3);
    const chunkResults = await Promise.all(
      chunk.map(async (item) => {
        let text = "";
        try {
          const rawOcr = await fetchOcr(item.url);
          const parsed = JSON.parse(rawOcr);
          if (parsed.ParsedResults && parsed.ParsedResults[0]) {
            text = parsed.ParsedResults[0].ParsedText || "";
          }
        } catch (e) {
          console.log(`OCR failed for ${item.url}`);
        }
        return { ...item, text: text.trim().replace(/\n/g, " ") };
      }),
    );
    results.push(...chunkResults);
    console.log(`Processed ${results.length}/${allImages.length}...`);
    // sleep 2 seconds
    await new Promise((r) => setTimeout(r, 2000));
  }

  fs.writeFileSync(
    path.resolve(__dirname, "../../scratch/maham-ocr.json"),
    JSON.stringify(results, null, 2),
  );
  console.log("Saved OCR results to scratch/maham-ocr.json");
}

run().catch(console.error);
