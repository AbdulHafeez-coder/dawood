// Local GET/HEAD preview of the actual Vercel build for browser verification.
import { createServer } from "node:http";
import { Readable } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import app from "../.vercel/output/functions/__server.func/index.mjs";
const root = path.resolve(".vercel/output/static");
const types = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    const url = new URL(req.url, "http://localhost:5186");
    const file = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if (file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, {
        "content-type": types[path.extname(file)] ?? "application/octet-stream",
      });
      if (req.method === "HEAD") res.end();
      else fs.createReadStream(file).pipe(res);
      return;
    }
    const response = await app.fetch(
      new Request(url, { method: req.method, headers: req.headers }),
    );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body && req.method !== "HEAD") Readable.fromWeb(response.body).pipe(res);
    else res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end("Preview error");
  }
}).listen(5186, "127.0.0.1", () => console.log("Vercel build preview: http://localhost:5186"));
