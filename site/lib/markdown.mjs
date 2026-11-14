// Markdown to HTML for text that comes from template packages (instructions, skills, sample reports). A package is
// third-party text, so raw HTML in it is shown as text, never rendered, and links and images keep only http(s),
// mailto and in-page targets. Headings shift down so a page keeps one h1.

import { Marked } from "marked";
import { escapeHtml } from "./util.mjs";

const SAFE_URL = /^(https?:\/\/|mailto:|#)/i;

function safeUrl(href) {
  const url = String(href ?? "").trim();
  return SAFE_URL.test(url) ? url : null;
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
        const url = safeUrl(href);
        if (!url) return text;
        const external = /^https?:/i.test(url);
        return `<a href="${escapeHtml(url)}"${title ? ` title="${escapeHtml(title)}"` : ""}${external ? ' rel="nofollow noopener" target="_blank"' : ""}>${text}</a>`;
      },
      image({ href, title, text }) {
        const url = safeUrl(href);
        if (!url || url.startsWith("mailto:")) return escapeHtml(text);
        return `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ""} loading="lazy" referrerpolicy="no-referrer">`;
      },
    },
  });
  cache.set(shift, md);
  return md;
}

/** Markdown as HTML; `shift` pushes headings down (a "#" becomes h(1+shift)). */
export function markdownToHtml(text, { shift = 2 } = {}) {
  return instance(shift).parse(String(text ?? ""));
}
