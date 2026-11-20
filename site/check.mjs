#!/usr/bin/env node
// Checks a built site/dist: every page has a title, a meta description, a canonical URL that points at a page that
// exists, OG and Twitter tags, one h1, and JSON-LD that parses; every internal link, asset and #fragment resolves;
// the sitemap, llms.txt and the .md twins line up with the pages; nothing inline breaks the CSP the server sends
// (lib/server.mjs), which allows no other origin; and nothing on a page (scripts, styles, fonts, images) loads from
// another origin. Each template's sample media is an allowed type, its videos are 720p at most, and the files add up
// to 8 MiB at most.
// Usage: node site/check.mjs [--dir site/dist] [--base-url https://marketplace.agentrun.ai]. Exits 1 on any problem.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { CSP } from "./lib/server.mjs";
import { MEDIA_BUDGET_BYTES, MEDIA_TYPES, mediaSize, VIDEO_MAX_SHORT_SIDE } from "./lib/media.mjs";

const here = dirname(fileURLToPath(import.meta.url));

export function check({ dir, baseUrl }) {
  const root = resolve(dir);
  const base = baseUrl.replace(/\/+$/, "");
  const problems = [];
  const bad = (file, msg) => problems.push(`${file}: ${msg}`);
  if (/https?:/.test(CSP.replace(/form-action[^;]*/, ""))) bad("lib/server.mjs", `the CSP allows another origin: ${CSP}`);
  if (!/(^|; )media-src 'self'(;|$)/.test(CSP)) bad("lib/server.mjs", "the CSP does not say media-src 'self'");
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
  const files = walk(root).map((f) => relative(root, f).split(sep).join("/"));
  const htmlFiles = files.filter((f) => f.endsWith(".html"));
  const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

  /** A site path ("/templates/kyb/", "/assets/site.css?v=1#x") as the file it serves, or null. */
  const fileFor = (path) => {
    const p = decodeURIComponent(path.split("#")[0].split("?")[0]);
    if (!p.startsWith("/")) return null;
    const rel = p.slice(1);
    if (rel === "" || rel.endsWith("/")) return files.includes(`${rel}index.html`) ? `${rel}index.html` : null;
    return files.includes(rel) ? rel : null;
  };
  const ids = new Map();
  const idsOf = (file) => {
    if (!ids.has(file)) ids.set(file, new Set([...readFileSync(join(root, file), "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
    return ids.get(file);
  };
  const pageOf = (url) => (url.startsWith(base) ? url.slice(base.length) || "/" : null);

  const canonicals = new Map();
  for (const file of htmlFiles) {
    const text = readFileSync(join(root, file), "utf8");
    const one = (re, what) => {
      const all = [...text.matchAll(re)];
      if (all.length !== 1) { bad(file, `${all.length} ${what} (want 1)`); return null; }
      return decode(all[0][1]);
    };
    if (!/^<!doctype html>/i.test(text)) bad(file, "no <!doctype html>");
    if (!/<html lang="[a-z-]+">/.test(text)) bad(file, "no <html lang>");
    const title = one(/<title>([^<]*)<\/title>/g, "<title>");
    if (title !== null && (title.trim().length < 10 || title.length > 70)) bad(file, `title is ${title.length} characters ("${title}"); keep it 10 to 70`);
    const desc = one(/<meta name="description" content="([^"]*)">/g, "meta description");
    if (desc !== null && (desc.trim().length < 50 || desc.length > 170)) bad(file, `meta description is ${desc.length} characters; keep it 50 to 170`);
    const noindex = /<meta name="robots" content="noindex">/.test(text);
    if (noindex && /rel="canonical"/.test(text)) bad(file, "a noindex page should not name a canonical");
    const canonical = noindex ? null : one(/<link rel="canonical" href="([^"]*)">/g, "canonical");
    if (canonical !== null) {
      const path = pageOf(canonical);
      if (path === null) bad(file, `canonical ${canonical} is not on ${base}`);
      else if (fileFor(path) !== file) bad(file, `canonical ${canonical} does not point at this page`);
      if (canonicals.has(canonical)) bad(file, `same canonical as ${canonicals.get(canonical)}`);
      canonicals.set(canonical, file);
      const ogUrl = one(/<meta property="og:url" content="([^"]*)">/g, "og:url");
      if (ogUrl !== null && ogUrl !== canonical) bad(file, "og:url differs from the canonical");
    }
    for (const prop of ["og:title", "og:description", "og:type", "og:site_name"]) one(new RegExp(`<meta property="${prop}" content="([^"]+)">`, "g"), prop);
    for (const name of ["twitter:card", "twitter:title", "twitter:description"]) one(new RegExp(`<meta name="${name}" content="([^"]+)">`, "g"), name);
    const h1 = [...text.matchAll(/<h1[\s>]/g)].length;
    if (h1 !== 1) bad(file, `${h1} <h1> (want 1)`);

    const scripts = [...text.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
    const ld = scripts.filter((m) => /type="application\/ld\+json"/.test(m[1]));
    if (file !== "404.html" && !ld.length) bad(file, "no JSON-LD");
    for (const m of ld) {
      try {
        const data = JSON.parse(m[2]);
        if (data["@context"] !== "https://schema.org") bad(file, "JSON-LD @context is not https://schema.org");
        const nodes = data["@graph"] ?? [data];
        if (!nodes.every((n) => typeof n["@type"] === "string")) bad(file, "a JSON-LD node has no @type");
      } catch (err) { bad(file, `JSON-LD does not parse: ${err.message}`); }
    }
    for (const m of scripts) if (!/type="application\/ld\+json"/.test(m[1]) && m[2].trim()) bad(file, "inline script (the CSP refuses it)");
    if (/\sstyle="/.test(text)) bad(file, "inline style attribute (the CSP refuses it)");
    // Nothing on a page loads from another origin: every src, every non-navigation <link>, every CSS url().
    for (const [, url] of text.matchAll(/\ssrc="([^"]*)"/g)) if (/^(https?:)?\/\//i.test(decode(url))) bad(file, `loads ${decode(url)} from another origin`);
    for (const [tag] of text.matchAll(/<link\s[^>]*>/g)) {
      const rel = /rel="([^"]*)"/.exec(tag)?.[1] ?? "";
      const href = decode(/href="([^"]*)"/.exec(tag)?.[1] ?? "");
      if (!/^(canonical|alternate)$/.test(rel) && /^(https?:)?\/\//i.test(href)) bad(file, `<link rel="${rel}"> loads ${href} from another origin`);
    }
    if (/\son[a-z]+="/.test(text)) bad(file, "inline event handler (the CSP refuses it)");

    const seen = new Set();
    for (const [, id] of text.matchAll(/\sid="([^"]+)"/g)) { if (seen.has(id)) bad(file, `duplicate id "${id}"`); seen.add(id); }
    for (const [, attr, raw] of text.matchAll(/\s(href|src)="([^"]*)"/g)) {
      const url = decode(raw);
      if (/^(https?:|mailto:)/.test(url)) {
        if (url.startsWith(base)) { const p = pageOf(url); if (!fileFor(p)) bad(file, `${attr} ${url} has no page`); }
        continue;
      }
      if (url.startsWith("#")) { if (url.length > 1 && !seen.has(url.slice(1)) && !idsOf(file).has(url.slice(1))) bad(file, `${attr} ${url}: no such id`); continue; }
      if (!url.startsWith("/")) { bad(file, `${attr} "${url}" is relative or uses another scheme`); continue; }
      const target = fileFor(url);
      if (!target) { bad(file, `${attr} ${url} does not resolve`); continue; }
      const frag = url.split("#")[1];
      if (frag && target.endsWith(".html") && !idsOf(target).has(frag)) bad(file, `${attr} ${url}: no id "${frag}" there`);
    }
    const alt = /<link rel="alternate" type="text\/markdown" href="([^"]+)"/.exec(text);
    if (file !== "404.html" && !alt) bad(file, "no Markdown twin linked");
    if (alt && !fileFor(alt[1])) bad(file, `Markdown twin ${alt[1]} is missing`);
    if (file === "404.html" && !/<meta name="robots" content="noindex">/.test(text)) bad(file, "the 404 page should be noindex");
  }

  // sitemap.xml: every indexable page, and nothing else
  if (!files.includes("sitemap.xml")) bad("sitemap.xml", "missing");
  else {
    const locs = [...readFileSync(join(root, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) if (!canonicals.has(loc)) bad("sitemap.xml", `${loc} is not a page's canonical`);
    for (const c of canonicals.keys()) if (!locs.includes(c) && canonicals.get(c) !== "404.html") bad("sitemap.xml", `${c} is missing`);
  }
  if (!files.includes("robots.txt") || !readFileSync(join(root, "robots.txt"), "utf8").includes(`Sitemap: ${base}/sitemap.xml`)) bad("robots.txt", "missing or has no Sitemap line");
  if (!files.includes("llms.txt")) bad("llms.txt", "missing");
  else {
    const llms = readFileSync(join(root, "llms.txt"), "utf8");
    if (!/^# /.test(llms)) bad("llms.txt", "does not start with a # title");
    for (const [, url] of llms.matchAll(/\]\((https?:[^)\s]+)\)/g)) {
      const p = pageOf(url);
      if (p !== null && !fileFor(p)) bad("llms.txt", `${url} does not resolve`);
    }
  }
  try { JSON.parse(readFileSync(join(root, "search.json"), "utf8")); } catch (err) { bad("search.json", err.message); }
  for (const css of files.filter((f) => f.endsWith(".css"))) {
    for (const [, url] of readFileSync(join(root, css), "utf8").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      if (/^(https?:)?\/\//i.test(url)) bad(css, `loads ${url} from another origin`);
      else if (url.startsWith("/") && !fileFor(url)) bad(css, `url(${url}) does not resolve`);
    }
    if (/@import/.test(readFileSync(join(root, css), "utf8"))) bad(css, "@import loads another stylesheet");
  }
  for (const md of files.filter((f) => f.endsWith(".md"))) if (!readFileSync(join(root, md), "utf8").startsWith("# ")) bad(md, "does not start with a # title");
  if (!existsSync(join(root, "404.html"))) bad("404.html", "missing");

  // Sample media (templates/<t>/samples/<case>/<file>): an allowed type, video at most 720p, 8 MiB a template.
  const mib = (n) => `${(n / 1048576).toFixed(2)} MiB`;
  const mediaBytes = new Map();
  for (const f of files) {
    const m = /^templates\/([^/]+)\/samples\/(.+)$/.exec(f);
    if (!m) continue;
    const [, template, rel] = m;
    const where = `templates/${template}`;
    const ext = /\.[^./]+$/.exec(rel)?.[0].toLowerCase() ?? "";
    const bytes = statSync(join(root, f)).size;
    const sum = mediaBytes.get(template) ?? { bytes: 0, largest: null };
    sum.bytes += bytes;
    if (!sum.largest || bytes > sum.largest.bytes) sum.largest = { rel, bytes };
    mediaBytes.set(template, sum);
    if (!/^[^/]+\/[^/]+$/.test(rel)) bad(where, `sample media ${rel} is not <sample>/<file>`);
    if (!MEDIA_TYPES[ext]) { bad(where, `sample media ${rel}: ${ext || "no extension"} isn't an allowed type (${Object.keys(MEDIA_TYPES).join(" ")})`); continue; }
    if (ext === ".mp4") {
      const dims = mediaSize(readFileSync(join(root, f)), f);
      if (!dims) bad(where, `sample media ${rel}: no video size in its tkhd box`);
      else if (Math.min(dims.width, dims.height) > VIDEO_MAX_SHORT_SIDE) bad(where, `sample media ${rel} is ${dims.width}x${dims.height}; a video's shorter side is ${VIDEO_MAX_SHORT_SIDE} px at most`);
    }
  }
  for (const [template, { bytes, largest }] of mediaBytes) {
    if (bytes > MEDIA_BUDGET_BYTES) bad(`templates/${template}`, `sample media total ${bytes} bytes (${mib(bytes)}), over the ${mib(MEDIA_BUDGET_BYTES)} a template may ship; the largest file is ${largest.rel} at ${largest.bytes} bytes`);
  }

  return { problems, pages: htmlFiles.length, files: files.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { dir: { type: "string" }, "base-url": { type: "string" } } });
  const { problems, pages, files } = check({ dir: values.dir ?? join(here, "dist"), baseUrl: values["base-url"] ?? process.env.SITE_BASE_URL ?? "https://marketplace.agentrun.ai" });
  for (const p of problems) process.stderr.write(`${p}\n`);
  process.stdout.write(`${problems.length ? "FAIL" : "ok"}: ${pages} pages, ${files} files, ${problems.length} problems\n`);
  process.exit(problems.length ? 1 : 0);
}
