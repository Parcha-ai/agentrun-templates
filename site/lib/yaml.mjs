// A small YAML reader for template front matter (agent.md, SKILL.md, case.yaml). It reads the subset templates are
// written in: block mappings and sequences, flow mappings and sequences (also across lines), plain, single- and
// double-quoted scalars (also across lines), literal and folded block scalars, comments, and YAML 1.2 core scalars
// (null, booleans, numbers). Anchors, aliases, tags and complex keys are refused with the line they are on, so a
// template that needs them fails the build loudly instead of rendering something different from what AgentRun reads.

export class YamlError extends Error {
  constructor(message, line) {
    super(line ? `line ${line}: ${message}` : message);
    this.line = line;
  }
}

/** Splits `---` front matter from a Markdown file. No front matter: data is {}. */
export function frontMatter(text) {
  const src = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  if (!src.startsWith("---\n")) return { data: {}, body: src };
  const end = src.indexOf("\n---", 3);
  if (end === -1) throw new YamlError("front matter opens with --- and never closes");
  const after = src.indexOf("\n", end + 4);
  const closing = src.slice(end + 1, after === -1 ? undefined : after);
  if (closing.trim() !== "---") throw new YamlError("front matter's closing line must be --- alone");
  const yaml = src.slice(4, end + 1);
  const data = parseYaml(yaml);
  return { data: data ?? {}, body: after === -1 ? "" : src.slice(after + 1) };
}

export function parseYaml(text) {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (lines.some((l) => /^\t/.test(l))) throw new YamlError("tabs are not allowed for indentation", lines.findIndex((l) => /^\t/.test(l)) + 1);
  const p = new Parser(lines);
  p.skipBlank();
  if (p.i >= lines.length) return null;
  const first = p.peek();
  const value = p.block(first.indent);
  p.skipBlank();
  if (p.i < lines.length) throw new YamlError("unexpected content (check its indentation)", p.i + 1);
  return value;
}

const SPECIAL = /^[&*!%@`]/;

class Parser {
  constructor(lines) {
    this.lines = lines;
    this.i = 0;
  }

  skipBlank() {
    while (this.i < this.lines.length) {
      const t = this.lines[this.i].trim();
      if (t === "" || t.startsWith("#") || t === "---" || t === "...") this.i++;
      else break;
    }
  }

  peek() {
    const raw = this.lines[this.i];
    const indent = raw.length - raw.trimStart().length;
    return { indent, text: stripComment(raw.slice(indent)), line: this.i + 1 };
  }

  block(indent) {
    this.skipBlank();
    const { text } = this.peek();
    return isSeqItem(text) ? this.sequence(indent) : this.mapping(indent);
  }

  mapping(indent) {
    const out = {};
    for (;;) {
      this.skipBlank();
      if (this.i >= this.lines.length) break;
      const { indent: at, text, line } = this.peek();
      if (at < indent) break;
      if (at > indent) throw new YamlError("unexpected indentation", line);
      if (isSeqItem(text)) break;
      const colon = mapColon(text);
      if (colon === -1) throw new YamlError(`expected "key: value", found "${text.slice(0, 40)}"`, line);
      const key = scalarKey(text.slice(0, colon).trim(), line);
      if (Object.hasOwn(out, key)) throw new YamlError(`duplicate key "${key}"`, line);
      const rest = text.slice(colon + 1).trim();
      this.i++;
      out[key] = this.value(rest, indent, line, true);
    }
    return out;
  }

  sequence(indent) {
    const out = [];
    for (;;) {
      this.skipBlank();
      if (this.i >= this.lines.length) break;
      const { indent: at, text, line } = this.peek();
      if (at < indent || !isSeqItem(text)) break;
      if (at > indent) throw new YamlError("unexpected indentation", line);
      const rest = text.slice(1).trimStart();
      const inner = at + (text.length - rest.length);
      if (rest !== "" && (isSeqItem(rest) || (mapColon(rest) !== -1 && !/^[[{]/.test(rest)))) {
        // "- key: value" opens a mapping (or "- - x" a sequence) whose column is the item's content.
        this.lines[this.i] = " ".repeat(inner) + this.lines[this.i].slice(inner);
        out.push(this.block(inner));
      } else {
        this.i++;
        out.push(this.value(rest, indent, line, false));
      }
    }
    return out;
  }

  /** The value after "key:" or "- ". `owner` is the indent of the line that holds it. */
  value(rest, owner, line, inMapping) {
    if (rest === "") {
      this.skipBlank();
      if (this.i >= this.lines.length) return null;
      const next = this.peek();
      if (next.indent > owner) return this.block(next.indent);
      // A mapping's value may be a sequence at the mapping's own column.
      if (inMapping && next.indent === owner && isSeqItem(next.text)) return this.sequence(owner);
      return null;
    }
    if (SPECIAL.test(rest)) throw new YamlError(`anchors, aliases, tags and reserved indicators are not supported ("${rest.slice(0, 20)}")`, line);
    if (/^[|>]/.test(rest)) return this.blockScalar(rest, owner, line);
    if (rest.startsWith("{") || rest.startsWith("[")) {
      let src = rest;
      while (!flowClosed(src)) {
        if (this.i >= this.lines.length) throw new YamlError("flow collection never closes", line);
        src += " " + stripComment(this.lines[this.i].trim());
        this.i++;
      }
      const f = new Flow(src, line);
      const v = f.value();
      f.ws();
      if (f.pos < src.length) throw new YamlError(`unexpected "${src.slice(f.pos, f.pos + 20)}" after a flow collection`, line);
      return v;
    }
    if (rest.startsWith('"') || rest.startsWith("'")) {
      let src = rest;
      while (!quoteClosed(src)) {
        if (this.i >= this.lines.length) throw new YamlError("quoted string never closes", line);
        const t = this.lines[this.i].trim();
        src += t === "" ? "\n" : (src.endsWith("\n") ? "" : " ") + t;
        this.i++;
      }
      const { value, end } = readQuoted(src, 0, line);
      const tail = stripComment(src.slice(end)).trim();
      if (tail !== "") throw new YamlError(`unexpected "${tail.slice(0, 20)}" after a quoted string`, line);
      return value;
    }
    // A plain scalar, continued by more-indented lines.
    let text = rest;
    while (this.i < this.lines.length) {
      const raw = this.lines[this.i];
      const t = raw.trim();
      const ind = raw.length - raw.trimStart().length;
      if (t === "" || ind <= owner || t.startsWith("#")) break;
      text += " " + stripComment(t);
      this.i++;
    }
    return plain(text.trim());
  }

  blockScalar(header, owner, line) {
    const m = /^([|>])([+-]?)([1-9]?)([+-]?)\s*(#.*)?$/.exec(header);
    if (!m) throw new YamlError(`bad block scalar header "${header}"`, line);
    const folded = m[1] === ">";
    const chomp = m[2] || m[4];
    let indent = m[3] ? owner + Number(m[3]) : -1;
    const body = [];
    while (this.i < this.lines.length) {
      const raw = this.lines[this.i];
      if (raw.trim() === "") { body.push(""); this.i++; continue; }
      const ind = raw.length - raw.trimStart().length;
      if (indent === -1) indent = ind;
      if (ind < indent || ind <= owner) break;
      body.push(raw.slice(indent));
      this.i++;
    }
    let trailing = 0;
    while (body.length && body[body.length - 1] === "") { body.pop(); trailing++; }
    let text;
    if (!folded) text = body.join("\n");
    else {
      text = "";
      for (let k = 0; k < body.length; k++) {
        const cur = body[k];
        if (k === 0) { text = cur; continue; }
        const prev = body[k - 1];
        if (cur === "") text += "\n";
        else if (prev === "" || /^\s/.test(cur) || /^\s/.test(prev)) text += (prev === "" ? "" : "\n") + cur;
        else text += " " + cur;
      }
    }
    if (chomp === "-") return text;
    if (chomp === "+") return text + "\n".repeat(trailing + (body.length ? 1 : 0));
    return body.length ? text + "\n" : "";
  }
}

function isSeqItem(text) {
  return text === "-" || text.startsWith("- ");
}

/** The index of the ":" that ends a block mapping key, or -1. Skips quoted keys. */
function mapColon(text) {
  let k = 0;
  if (text[0] === '"' || text[0] === "'") {
    const q = text[0];
    k = 1;
    while (k < text.length) {
      if (q === '"' && text[k] === "\\") { k += 2; continue; }
      if (text[k] === q) {
        if (q === "'" && text[k + 1] === "'") { k += 2; continue; }
        break;
      }
      k++;
    }
    k++;
    while (text[k] === " ") k++;
    return text[k] === ":" && (k + 1 === text.length || text[k + 1] === " ") ? k : -1;
  }
  if (/^[[{]/.test(text)) return -1;
  for (; k < text.length; k++) {
    if (text[k] === ":" && (k + 1 === text.length || text[k + 1] === " ")) return k;
    if (text[k] === "#" && k > 0 && text[k - 1] === " ") return -1;
  }
  return -1;
}

function scalarKey(raw, line) {
  if (raw === "") throw new YamlError("empty key", line);
  if (raw.startsWith('"') || raw.startsWith("'")) return readQuoted(raw, 0, line).value;
  if (SPECIAL.test(raw) || raw.startsWith("?")) throw new YamlError(`unsupported key "${raw}"`, line);
  return raw;
}

/** Drops a trailing "# comment" that sits outside quotes and flow strings. */
function stripComment(text) {
  let q = null;
  for (let k = 0; k < text.length; k++) {
    const c = text[k];
    if (q) {
      if (q === '"' && c === "\\") { k++; continue; }
      if (c === q) q = null;
      continue;
    }
    if ((c === '"' || c === "'") && (k === 0 || /[\s[{,:]/.test(text[k - 1]))) { q = c; continue; }
    if (c === "#" && (k === 0 || /\s/.test(text[k - 1]))) return text.slice(0, k).trimEnd();
  }
  return text;
}

function flowClosed(src) {
  let depth = 0;
  let q = null;
  for (let k = 0; k < src.length; k++) {
    const c = src[k];
    if (q) {
      if (q === '"' && c === "\\") { k++; continue; }
      if (c === q) {
        if (q === "'" && src[k + 1] === "'") { k++; continue; }
        q = null;
      }
      continue;
    }
    if ((c === '"' || c === "'") && (k === 0 || /[\s[{,:]/.test(src[k - 1]))) q = c;
    else if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") depth--;
  }
  return depth <= 0 && q === null;
}

function quoteClosed(src) {
  const q = src[0];
  for (let k = 1; k < src.length; k++) {
    if (q === '"' && src[k] === "\\") { k++; continue; }
    if (src[k] === q) {
      if (q === "'" && src[k + 1] === "'") { k++; continue; }
      return true;
    }
  }
  return false;
}

const ESCAPES = { 0: "\0", a: "\x07", b: "\b", t: "\t", "\t": "\t", n: "\n", v: "\v", f: "\f", r: "\r", e: "\x1b", " ": " ", '"': '"', "/": "/", "\\": "\\", N: "\x85", _: "\xa0", L: " ", P: " " };

function readQuoted(src, start, line) {
  const q = src[start];
  let out = "";
  let k = start + 1;
  while (k < src.length) {
    const c = src[k];
    if (q === '"' && c === "\\") {
      const e = src[k + 1];
      if (e === "x" || e === "u" || e === "U") {
        const n = e === "x" ? 2 : e === "u" ? 4 : 8;
        const hex = src.slice(k + 2, k + 2 + n);
        if (!new RegExp(`^[0-9a-fA-F]{${n}}$`).test(hex)) throw new YamlError(`bad escape \\${e}${hex}`, line);
        out += String.fromCodePoint(parseInt(hex, 16));
        k += 2 + n;
        continue;
      }
      if (e === "\n") { k += 2; while (src[k] === " ") k++; continue; }
      if (!Object.hasOwn(ESCAPES, e)) throw new YamlError(`unknown escape \\${e} in a double-quoted string (write \\\\ for a backslash)`, line);
      out += ESCAPES[e];
      k += 2;
      continue;
    }
    if (c === q) {
      if (q === "'" && src[k + 1] === "'") { out += "'"; k += 2; continue; }
      return { value: out, end: k + 1 };
    }
    out += c;
    k++;
  }
  throw new YamlError("quoted string never closes", line);
}

/** YAML 1.2 core schema for a plain scalar. */
export function plain(text) {
  if (text === "" || text === "~" || /^(null|Null|NULL)$/.test(text)) return null;
  if (/^(true|True|TRUE)$/.test(text)) return true;
  if (/^(false|False|FALSE)$/.test(text)) return false;
  if (/^[-+]?[0-9]+$/.test(text)) return Number(text);
  if (/^0o[0-7]+$/.test(text)) return parseInt(text.slice(2), 8);
  if (/^0x[0-9a-fA-F]+$/.test(text)) return parseInt(text.slice(2), 16);
  if (/^[-+]?(\.[0-9]+|[0-9]+(\.[0-9]*)?)([eE][-+]?[0-9]+)?$/.test(text)) return Number(text);
  if (/^[-+]?\.(inf|Inf|INF)$/.test(text)) return text.startsWith("-") ? -Infinity : Infinity;
  if (/^\.(nan|NaN|NAN)$/.test(text)) return NaN;
  return text;
}

class Flow {
  constructor(src, line) {
    this.src = src;
    this.pos = 0;
    this.line = line;
  }

  ws() {
    while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) this.pos++;
  }

  fail(msg) {
    throw new YamlError(`${msg} at "${this.src.slice(this.pos, this.pos + 24)}"`, this.line);
  }

  value() {
    this.ws();
    const c = this.src[this.pos];
    if (c === "{") return this.map();
    if (c === "[") return this.seq();
    if (c === '"' || c === "'") {
      const { value, end } = readQuoted(this.src, this.pos, this.line);
      this.pos = end;
      return value;
    }
    if (c !== undefined && SPECIAL.test(c)) this.fail("anchors, aliases and tags are not supported");
    return plain(this.plainText());
  }

  plainText() {
    const startAt = this.pos;
    while (this.pos < this.src.length) {
      const c = this.src[this.pos];
      if (c === "," || c === "]" || c === "}" || c === "[" || c === "{") break;
      // ": " ends a key; "a:b" and "https://x" stay one scalar.
      if (c === ":" && /[\s,\]}]/.test(this.src[this.pos + 1] ?? " ")) break;
      this.pos++;
    }
    return this.src.slice(startAt, this.pos).trim();
  }

  map() {
    this.pos++;
    const out = {};
    for (;;) {
      this.ws();
      if (this.src[this.pos] === "}") { this.pos++; return out; }
      let key;
      const c = this.src[this.pos];
      if (c === '"' || c === "'") {
        const r = readQuoted(this.src, this.pos, this.line);
        key = r.value;
        this.pos = r.end;
      } else {
        key = this.plainText();
        if (key === "") this.fail("expected a key");
        if (SPECIAL.test(key)) this.fail("unsupported key");
      }
      if (Object.hasOwn(out, key)) this.fail(`duplicate key "${key}"`);
      this.ws();
      if (this.src[this.pos] === ":") {
        this.pos++;
        this.ws();
        const n = this.src[this.pos];
        out[key] = n === "," || n === "}" ? null : this.value();
      } else out[key] = null;
      this.ws();
      const sep = this.src[this.pos];
      if (sep === ",") { this.pos++; continue; }
      if (sep === "}") { this.pos++; return out; }
      this.fail("expected , or }");
    }
  }

  seq() {
    this.pos++;
    const out = [];
    for (;;) {
      this.ws();
      if (this.src[this.pos] === "]") { this.pos++; return out; }
      out.push(this.value());
      this.ws();
      const sep = this.src[this.pos];
      if (sep === ",") { this.pos++; continue; }
      if (sep === "]") { this.pos++; return out; }
      this.fail("expected , or ]");
    }
  }
}
