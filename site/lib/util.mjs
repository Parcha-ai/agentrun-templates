const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

/** Tagged template that escapes every interpolated value unless it is raw() (already-safe HTML). */
export function html(strings, ...values) {
  let out = strings[0];
  for (let k = 0; k < values.length; k++) out += render(values[k]) + strings[k + 1];
  return raw(out);
}

class Raw {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

export function raw(value) {
  return value instanceof Raw ? value : new Raw(String(value ?? ""));
}

function render(v) {
  if (v === undefined || v === null || v === false) return "";
  if (Array.isArray(v)) return v.map(render).join("");
  if (v instanceof Raw) return v.value;
  return escapeHtml(v);
}

/** Cuts text at a word boundary to at most `max` characters, adding an ellipsis when cut. */
export function clip(text, max) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,.;:]+$/, "")}…`;
}

export function plural(n, one, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

/** Markdown inline code, safe for any content. */
export function mdCode(text) {
  const s = String(text ?? "");
  const ticks = "`".repeat(Math.max(1, ...[...s.matchAll(/`+/g)].map((m) => m[0].length + 1)));
  const pad = s.startsWith("`") || s.endsWith("`") ? " " : "";
  return `${ticks}${pad}${s}${pad}${ticks}`;
}

/** Escapes text for a Markdown table cell or a line of prose. */
export function mdText(text) {
  return String(text ?? "").replace(/\s+/g, " ").replace(/([\\`*_[\]<>|])/g, "\\$1");
}

export function upperFirst(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
