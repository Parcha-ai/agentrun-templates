// Markdown to HTML for text that comes from template packages (instructions, skills, sample reports). A package is
// third-party text, so raw HTML in it is shown as text, never rendered, links keep only http(s), mailto and in-page
// targets, and images become links. Headings shift down so a page keeps one h1.
// The one exception is a sample's own media: an image or link to media/<file> that names a file in that sample's
// media/ folder plays from this site (mediaPlayer), because the build copied the file here.

import { Marked } from "marked";
import { escapeHtml } from "./util.mjs";

const SAFE_URL = /^(https?:\/\/|mailto:|#)/i;

function safeUrl(href) {
  const url = String(href ?? "").trim();
  return SAFE_URL.test(url) ? url : null;
}

/** The file in `media` a Markdown target names (media/<file> or ./media/<file>), or undefined. A link may name
 *  captions or a document; a player (`player: true`) is never either. */
function mediaTarget(href, media, { player = false } = {}) {
  let url = String(href ?? "").trim();
  try { url = decodeURI(url); } catch {}
  const m = /^(?:\.\/)?media\/([^/?#]+)$/.exec(url);
  return m ? media.find((x) => x.file === m[1] && !(player && (x.kind === "captions" || x.kind === "document"))) : undefined;
}

// The sample media of the call in progress. marked is synchronous, so one parse runs at a time.
let current = null;

function mediaFor(href, options) {
  if (!current) return undefined;
  const item = mediaTarget(href, current.media, options);
  if (item) current.used.add(item.file);
  return item;
}

/** The player for one sample media file: an img, a video (with its captions) or an audio element, no inline style. */
export function mediaPlayer(item, alt = "") {
  const src = escapeHtml(item.url);
  const label = escapeHtml(alt);
  const dims = item.width && item.height ? ` width="${item.width}" height="${item.height}"` : "";
  const fallback = `<a href="${src}">${label || escapeHtml(item.file)}</a>`;
  if (item.kind === "image") return `<img src="${src}" alt="${label}" loading="lazy"${dims}>`;
  if (item.kind === "video") {
    const track = item.captions ? `<track kind="captions" src="${escapeHtml(item.captions.url)}" label="Captions" default>` : "";
    return `<video controls preload="metadata" playsinline${dims} src="${src}"${label ? ` aria-label="${label}"` : ""}>${track}${fallback}</video>`;
  }
  if (item.kind === "audio") return `<audio controls preload="metadata" src="${src}"${label ? ` aria-label="${label}"` : ""}>${fallback}</audio>`;
  return fallback;
}

const cache = new Map();

function instance(shift) {
  if (cache.has(shift)) return cache.get(shift);
  const md = new Marked({ gfm: true, breaks: false, async: false });
  md.use({
    renderer: {
      html({ text }) {
        return escapeHtml(text);
      },
      heading({ tokens, depth }) {
        const level = Math.min(depth + shift, 6);
        return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const item = mediaFor(href);
        if (item) return `<a href="${escapeHtml(item.url)}">${text}</a>`;
        const url = safeUrl(href);
        if (!url) return text;
        const external = /^https?:/i.test(url);
        return `<a href="${escapeHtml(url)}"${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' rel="nofollow noopener" target="_blank"' : ""}>${text}</a>`;
      },
      // A page loads nothing from a third party, so an image in a package is a link to it, never fetched.
      image({ href, text }) {
        const item = mediaFor(href, { player: true });
        if (item) return mediaPlayer(item, text);
        const url = safeUrl(href);
        const label = escapeHtml(text || "image");
        if (!url || !/^https?:/i.test(url)) return label;
        return `<a href="${escapeHtml(url)}" rel="nofollow noopener" target="_blank">${label}</a>`;
      },
    },
  });
  cache.set(shift, md);
  return md;
}

const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const TITLE = `(?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\\((?:[^()\\\\]|\\\\.)*\\))`;

/** `text` with every link, image and reference definition that names one of `media` pointing at `urlOf(item)`
 *  instead, for a Markdown page that isn't beside the files. It reads the tokens of marked's lexer, the same ones
 *  markdownToHtml renders, and changes only each one's destination, where it stands in the text: a reference use
 *  keeps its label (its definition changes), and code is left as written. */
export function absoluteMediaLinks(text, media, urlOf) {
  const src = String(text ?? "").replace(/\r\n?/g, "\n");
  if (!media.length) return src;
  const edits = [];
  // Where the next token can start. A token is found from here; its children are found inside it, and the token
  // after it is found past its end, so the same text twice is two places, and code is skipped whole.
  let cursor = 0;
  const visit = (t) => {
    const at = typeof t.raw === "string" ? src.indexOf(t.raw, cursor) : -1;
    if (at >= 0) {
      cursor = at;
      edit(t, at);
    }
    // marked's own walkTokens order: a table's cells, a list's items, else the token's inline or block children.
    const children = t.type === "table" ? [...t.header, ...t.rows.flat()] : t.type === "list" ? t.items : t.tokens ?? [];
    for (const child of children) visit(child);
    if (at >= 0) cursor = Math.max(cursor, at + t.raw.length);
  };
  const edit = (t, at) => {
    if (t.type !== "link" && t.type !== "image" && t.type !== "def") return;
    const item = mediaTarget(t.href, media);
    if (!item) return;
    const dest = `(?:\\./)?media/${reEscape(item.file)}`;
    // A definition's destination follows its "label:"; an inline one sits in the "(...)" that ends the token.
    const m = t.type === "def"
      ? new RegExp(`^( {0,3}\\[(?:[^\\]\\\\]|\\\\.)+\\]:[ \\t]*\\n?[ \\t]*<?)(${dest})`).exec(t.raw)
      : new RegExp(`(\\([ \\t]*\\n?[ \\t]*<?)(${dest})>?(?:\\s+${TITLE})?\\s*\\)$`).exec(t.raw);
    if (m) edits.push({ at: at + m.index + m[1].length, length: m[2].length, url: urlOf(item) });
  };
  for (const t of instance(2).lexer(src)) visit(t);
  let out = src;
  for (const e of edits.sort((a, b) => b.at - a.at)) out = out.slice(0, e.at) + e.url + out.slice(e.at + e.length);
  return out;
}

/** Markdown as HTML; `shift` pushes headings down (a "#" becomes h(1+shift)). `media` is a sample's media files
 *  (from packages.mjs); the names the text used are added to `used` when given. */
export function markdownToHtml(text, { shift = 2, media = [], used = new Set() } = {}) {
  current = { media, used };
  try {
    return instance(shift).parse(String(text ?? ""));
  } finally {
    current = null;
  }
}
