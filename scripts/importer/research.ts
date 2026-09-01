import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

chromium.use(stealth());

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto("https://www.mahamenterprises.com/omega.html", { waitUntil: "domcontentloaded", timeout: 60000 });
  
  const images = await page.$$eval(".row img, .portfolio-item img, .gallery img, img", imgs => imgs.map(i => {
    return {
      src: i.src,
      parentTag: i.parentElement?.tagName,
      parentHref: (i.parentElement as HTMLAnchorElement)?.href || null,
      alt: i.alt,
      title: i.title,
      textAround: i.parentElement?.innerText || ""
    };
  }));
  
  console.log("Found images on Omega page:");
  console.log(JSON.stringify(images.filter(i => i.src.includes('images/omega')), null, 2));

  await browser.close();
}

run().catch(console.error);
