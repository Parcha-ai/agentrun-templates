#!/usr/bin/env node
// Serves site/dist for a local look, the way GitHub Pages does: /x/ -> /x/index.html, unknown -> 404.html.
// Usage: node site/serve.mjs [--dir site/dist] [--port 7420]. Binds 127.0.0.1 only.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const here = dirname(fileURLToPath(import.meta.url));
const { values } = parseArgs({ options: { dir: { type: "string" }, port: { type: "string" } } });
const root = resolve(values.dir ?? join(here, "dist"));
const port = Number(values.port ?? 7420);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".json": "application/json", ".xml": "application/xml", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2",
};

async function find(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "");
  const file = resolve(root, clean);
  if (file !== root && !file.startsWith(root + sep)) return null;
  try {
    const s = await stat(file);
    if (s.isFile()) return file;
    if (s.isDirectory()) {
      const index = join(file, "index.html");
      if ((await stat(index)).isFile()) return index;
    }
  } catch {}
  return null;
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (!url.pathname.endsWith("/") && !extname(url.pathname) && (await find(`${url.pathname}/`))) {
    res.writeHead(301, { location: `${url.pathname}/${url.search}` }).end();
    return;
  }
  const file = await find(url.pathname);
  const target = file ?? join(root, "404.html");
  try {
    const body = await readFile(target);
    res.writeHead(file ? 200 : 404, { "content-type": TYPES[extname(target)] ?? "application/octet-stream", "cache-control": "no-store" });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain" }).end("not found\n");
  }
}).listen(port, "127.0.0.1", () => process.stdout.write(`serving ${root} on http://127.0.0.1:${port}/\n`));
