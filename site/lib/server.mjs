// The site's one server, for a local look and in production: /x -> /x/, /x/ -> /x/index.html, unknown -> 404.html,
// every answer with the security headers below. The pages need nothing more than this: no inline script or style, and
// nothing from another origin (check.mjs holds them to that).

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self'",
  "base-uri 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

export const SECURITY_HEADERS = {
  "content-security-policy": CSP,
  "strict-transport-security": "max-age=63072000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
  "x-frame-options": "DENY",
};

const TYPES = {
  ".html": "text/html; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".json": "application/json", ".xml": "application/xml", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2",
};

/** How long a browser may keep a file: assets a day (css and js carry a ?v= of their content), pages five minutes. */
function cacheFor(urlPath, { dev }) {
  if (dev) return "no-store";
  return urlPath.startsWith("/assets/") ? "public, max-age=86400" : "public, max-age=300";
}

/** A request handler serving `root`. `dev` turns caching off for a local look. */
export function siteHandler({ root, dev = false }) {
  root = resolve(root);
  async function find(urlPath) {
    let clean;
    try { clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, ""); } catch { return null; }
    if (clean.includes("\0")) return null;
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
  return async (req, res) => {
    const send = (status, headers, body) => {
      res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
      res.end(req.method === "HEAD" ? undefined : body);
    };
    if (req.method !== "GET" && req.method !== "HEAD") return send(405, { allow: "GET, HEAD", "content-type": "text/plain; charset=utf-8" }, "method not allowed\n");
    const url = new URL(req.url ?? "/", "http://localhost");
    if (!url.pathname.endsWith("/") && !extname(url.pathname) && (await find(`${url.pathname}/`))) {
      return send(301, { location: `${url.pathname}/${url.search}` });
    }
    const file = await find(url.pathname);
    const target = file ?? join(root, "404.html");
    try {
      const body = await readFile(target);
      send(file ? 200 : 404, { "content-type": TYPES[extname(target)] ?? "application/octet-stream", "cache-control": cacheFor(url.pathname, { dev }) }, body);
    } catch {
      send(404, { "content-type": "text/plain; charset=utf-8" }, "not found\n");
    }
  };
}

export function siteServer(options) {
  return createServer(siteHandler(options));
}
