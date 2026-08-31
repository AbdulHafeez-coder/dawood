import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.resolve(__dirname, "public");
const destVercel = path.resolve(__dirname, ".vercel/output/static");
const destOutput = path.resolve(__dirname, ".output/public");

function copyRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  fs.readdirSync(src).forEach((childItemName) => {
    const srcPath = path.join(src, childItemName);
    const destPath = path.join(dest, childItemName);
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

// Ensure we copy to Vercel's static output
console.log("Copying public assets to .vercel/output/static...");
copyRecursiveSync(src, destVercel);

// Ensure we copy to Nitro's standard output
console.log("Copying public assets to .output/public...");
copyRecursiveSync(src, destOutput);

console.log("Public assets copied successfully.");
