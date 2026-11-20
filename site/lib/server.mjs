// The site's one server, for a local look and in production: /x -> /x/, /x/ -> /x/index.html, unknown -> 404.html,
// every answer with the security headers below. The pages need nothing more than this: no inline script or style, and
// nothing from another origin (check.mjs holds them to that). Files stream from disk and answer a single byte range,
// which Safari needs before it plays a sample's video or audio.
// The server image copies this file alone (site/Dockerfile), so it imports nothing from the rest of lib/.

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";

export const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "media-src 'self'",
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
  "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  "cross-origin-opener-policy": "same-origin",
  "cross-origin-resource-policy": "same-origin",
  "x-frame-options": "DENY",
};

/** Sample media types; the same list as MEDIA_TYPES in lib/media.mjs (a test keeps them equal). */
export const MEDIA_CONTENT_TYPES = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif",
  ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".wav": "audio/wav", ".ogg": "audio/ogg",
  ".vtt": "text/vtt; charset=utf-8",
};

const TYPES = {
  ".html": "text/html; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".json": "application/json", ".xml": "application/xml", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2",
  ...MEDIA_CONTENT_TYPES,
};

/** How long a browser may keep a file: assets and sample media a day (css and js carry a ?v= of their content),
 *  pages five minutes. */
function cacheFor(urlPath, { dev }) {
  if (dev) return "no-store";
  const media = Object.hasOwn(MEDIA_CONTENT_TYPES, extname(urlPath).toLowerCase());
  return urlPath.startsWith("/assets/") || media ? "public, max-age=86400" : "public, max-age=300";
}

/** One `Range: bytes=...` against a file of `size` bytes: {start, end} (inclusive), "unsatisfiable", or null to send
 *  the whole file (no header, a unit other than bytes, several ranges, or a malformed one, as RFC 9110 allows). */
export function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(header ?? "").trim());
  if (!m || (m[1] === "" && m[2] === "")) return null;
  if (m[1] === "") {
    const n = Number(m[2]);
    if (n === 0 || size === 0) return "unsatisfiable";
    return { start: Math.max(0, size - n), end: size - 1 };
  }
  const start = Number(m[1]);
  if (m[2] !== "" && Number(m[2]) < start) return null;
  if (start >= size) return "unsatisfiable";
  const end = m[2] === "" ? size - 1 : Number(m[2]);
  return { start, end: Math.min(end, size - 1) };
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
    let size;
    try { size = (await stat(target)).size; } catch { return send(404, { "content-type": "text/plain; charset=utf-8" }, "not found\n"); }
    const headers = { "content-type": TYPES[extname(target)] ?? "application/octet-stream", "cache-control": cacheFor(file ? url.pathname : "/404.html", { dev }) };
    let status = file ? 200 : 404;
    let range = null;
    if (file) {
      headers["accept-ranges"] = "bytes";
      range = parseRange(req.headers.range, size);
      if (range === "unsatisfiable") return send(416, { ...headers, "content-range": `bytes */${size}`, "content-length": "0" });
      if (range) {
        status = 206;
        headers["content-range"] = `bytes ${range.start}-${range.end}/${size}`;
      }
    }
    headers["content-length"] = String(range ? range.end - range.start + 1 : size);
    res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
    if (req.method === "HEAD" || headers["content-length"] === "0") return res.end();
    try {
      await pipeline(createReadStream(target, range ?? {}), res);
    } catch {
      res.destroy();
    }
  };
}

export function siteServer(options) {
  return createServer(siteHandler(options));
}
