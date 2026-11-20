// A scheduled template's answer is its next run's only memory: agentrun packages/serve/src/trigger-targets.ts hands
// a schedule's run its last completed answer, serialized with JSON.stringify(output, null, 2), whole while that is at
// most PREVIOUS_RESULT_MAX_BYTES = 32 * 1024. Over it (since agentrun #3310), the next run is handed only the fields
// the answer's output schema names in `x-carried`; when those are over the limit too, the oldest entries of its
// carried arrays (the front: a template keeps each carried array oldest first) are dropped, from the largest array
// first, until they fit. A carried scalar or object is never cut, nor anything inside an entry: when those alone are
// over the limit the next run is handed nothing of the answer.
//
// A schema names the top-level fields its skill reads back from the last answer in `x-carried` (an annotation; JSON
// Schema validators ignore it). For each such schema this lint builds the largest value those fields allow and measures
// it the way previousResultOf does (2-space indent):
// - every array at maxItems, every number 24 characters, every object with all its properties, the widest branch of a
//   type list, anyOf or oneOf, the longest enum value;
// - every string at the most UTF-8 bytes JSON.stringify can write for it. AgentRun's submit check (typebox 1.3.27)
//   counts maxLength in grapheme clusters, and one cluster takes any number of combining marks, so maxLength alone
//   bounds nothing: such a string is counted at 6 B a character and reported. A carried string is bounded by its
//   `pattern`, which runs with the `u` flag and so counts code points: an anchored sequence of classes, escapes and
//   literals with bounded quantifiers ({n}, {m,n}, ?), any `|` inside a group. Each code point is counted at the most
//   it can take: 6 for a control character or a lone surrogate (written \u00XX, \uDXXX), 4 for any other in a negated
//   class or `.`, and in a listed class or literal its own size (a quote or backslash 2, ASCII 1). `format: date` is 10
//   ASCII characters, and `format: date-time` (ASCII by its own rule) is its maxLength;
// - the carried fields that are not arrays, never cut, must fit CARRIED_BUDGET_BYTES together, well under the limit; a
//   carried array may be over it at maxItems (the runtime trims it), but it must have a maxItems and one entry of it
//   a largest size. A field that may be an array or something else counts its largest other value as never cut;
// - inside a carried field, a string with no such bound, an array with no maxItems, or an object open to more keys (no
//   `additionalProperties: false`, or a key schema without maxProperties and a bounded key) has no largest size and
//   fails.
// A template with a `kind: schedule` trigger (the one source with previousResult: true, agentrun trigger-schedule.ts)
// whose schema has no `x-carried` is listed as "not declared", and not checked.
// Usage: node .github/lint-handoff-size.mjs. Prints each scheduled template's never-cut worst case and, per carried
// array, one entry's and maxItems' worst case, or "not declared"; then each problem. Exit 1 on any problem.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const PREVIOUS_RESULT_MAX_BYTES = 32 * 1024;
export const CARRIED_BUDGET_BYTES = 12_000;
const WIDEST_NUMBER = -1.7976931348623157e308; // JSON.stringify gives "-1.7976931348623157e+308", 24 characters

const repo = join(import.meta.dirname, "..");
const templatesDir = join(repo, "templates");

/** The largest value `schema` allows, or problems naming why it has none. */
const largest = (schema, root, path, problems) => widest(alternatives(schema, root, path, problems));

/** The largest value of each alternative `schema` allows at its top: each branch of an anyOf or oneOf, each type of a
 *  type list, each enum value. A carried field may be an array in one and not in another (checkCarried). */
function alternatives(schema, root, path, problems) {
  if (schema === true || schema === undefined) {
    problems.push(`${path}: any value is allowed`);
    return [null];
  }
  if (schema.$ref) {
    const target = schema.$ref.replace(/^#\//, "").split("/").reduce((at, key) => at?.[key], root);
    if (!target) problems.push(`${path}: $ref ${schema.$ref} not found`);
    return target ? alternatives(target, root, path, problems) : [null];
  }
  const branches = schema.anyOf ?? schema.oneOf;
  if (branches) return branches.flatMap((branch, i) => alternatives({ ...schema, anyOf: undefined, oneOf: undefined, ...branch }, root, `${path}|${i}`, problems));
  if ("const" in schema) return [schema.const];
  if (schema.enum) return schema.enum;
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : inferred(schema);
  if (types.length === 0) {
    problems.push(`${path}: no type`);
    return [null];
  }
  return types.map((type) => largestOf(type, schema, root, path, problems));
}

const inferred = (schema) => (schema.properties ? ["object"] : schema.items ? ["array"] : []);
const size = (value) => Buffer.byteLength(JSON.stringify(value) ?? "");
// No seed: a null seed (4 B) would beat a string of one or two bytes.
const widest = (values) => values.reduce((best, value) => (size(value) > size(best) ? value : best));

function largestOf(type, schema, root, path, problems) {
  switch (type) {
    case "null":
      return null;
    case "boolean":
      return false;
    case "integer":
    case "number":
      return WIDEST_NUMBER;
    case "string": {
      // "x" stands for one byte here: the filler has the bytes the string can take, not its characters.
      const bytes = stringBytes(schema, path, problems);
      return bytes === undefined ? "" : "x".repeat(bytes);
    }
    case "array": {
      if (schema.maxItems === undefined) problems.push(`${path}: array with no maxItems`);
      const item = largest(schema.items, root, `${path}[]`, problems);
      return Array.from({ length: schema.maxItems ?? 1 }, () => item);
    }
    case "object": {
      const out = {};
      for (const [key, sub] of Object.entries(schema.properties ?? {})) out[key] = largest(sub, root, `${path}.${key}`, problems);
      const extra = schema.additionalProperties;
      if (extra === false) return out;
      if (extra === undefined || extra === true) {
        problems.push(`${path}: object open to more keys (no additionalProperties: false)`);
        return out;
      }
      const keyWidth = schema.propertyNames ? stringBytes(schema.propertyNames, `${path}{key}`, problems) : undefined;
      if (schema.maxProperties === undefined || keyWidth === undefined)
        problems.push(`${path}: map with no maxProperties or no bounded propertyNames`);
      const value = largest(extra, root, `${path}{}`, problems);
      for (let i = 0; i < (schema.maxProperties ?? 1); i++) out[String(i).padStart(keyWidth ?? 1, "k")] = value;
      return out;
    }
    default:
      problems.push(`${path}: type ${type}`);
      return null;
  }
}

// The most bytes JSON.stringify writes for one code point, by range: [first, last, bytes].
const CODE_POINT_BYTES = [
  [0x00, 0x07, 6], [0x08, 0x0a, 2], [0x0b, 0x0b, 6], [0x0c, 0x0d, 2], [0x0e, 0x1f, 6], // \b \t \n \f \r, else \u00XX
  [0x20, 0x21, 1], [0x22, 0x22, 2], [0x23, 0x5b, 1], [0x5c, 0x5c, 2], [0x5d, 0x7f, 1], // " and \ are escaped
  [0x80, 0x7ff, 2], [0x800, 0xd7ff, 3], [0xd800, 0xdfff, 6], [0xe000, 0xffff, 3], [0x10000, 0x10ffff, 4], // lone surrogate: \uDXXX
];
const MAX_CODE_POINT = 0x10ffff;
const rangeBytes = (lo, hi) => Math.max(0, ...CODE_POINT_BYTES.filter(([a, b]) => a <= hi && b >= lo).map(([, , n]) => n));
const DIGIT = [[0x30, 0x39]];
const WORD = [[0x30, 0x39], [0x41, 0x5a], [0x5f, 0x5f], [0x61, 0x7a]];
const complement = (ranges) => {
  const out = [];
  let next = 0;
  for (const [lo, hi] of [...ranges].sort((a, b) => a[0] - b[0])) {
    if (lo > next) out.push([next, lo - 1]);
    next = Math.max(next, hi + 1);
  }
  if (next <= MAX_CODE_POINT) out.push([next, MAX_CODE_POINT]);
  return out;
};
const ESCAPED_SETS = { d: DIGIT, w: WORD, s: [[0x09, 0x0d], [0x20, 0x20], [0xa0, 0xa0], [0x1680, 0x1680], [0x2000, 0x200a], [0x2028, 0x2029], [0x202f, 0x202f], [0x205f, 0x205f], [0x3000, 0x3000], [0xfeff, 0xfeff]] };
const CONTROL_ESCAPES = { t: 0x09, n: 0x0a, r: 0x0d, f: 0x0c, v: 0x0b, 0: 0x00 };

/** Reads a `u`-flag pattern into the most bytes a match can take, or throws naming what it cannot bound. */
function patternBytes(pattern) {
  if (!pattern.startsWith("^") || !pattern.endsWith("$") || pattern.endsWith("\\$")) throw new Error("not anchored at both ends");
  const src = [...pattern.slice(1, -1)];
  let i = 0;
  const peek = () => src[i];
  // One escape after a backslash: a set of code point ranges.
  const escape = () => {
    const c = src[i++];
    if (c === undefined) throw new Error("ends in a backslash");
    if (ESCAPED_SETS[c]) return ESCAPED_SETS[c];
    if (ESCAPED_SETS[c.toLowerCase()]) return complement(ESCAPED_SETS[c.toLowerCase()]);
    if (c in CONTROL_ESCAPES) return [[CONTROL_ESCAPES[c], CONTROL_ESCAPES[c]]];
    if (c === "u" || c === "x") {
      let hex;
      if (c === "u" && peek() === "{") {
        const end = src.indexOf("}", i);
        hex = src.slice(i + 1, end).join("");
        i = end + 1;
      } else {
        hex = src.slice(i, i + (c === "u" ? 4 : 2)).join("");
        i += c === "u" ? 4 : 2;
      }
      if (!/^[0-9a-fA-F]+$/.test(hex)) throw new Error(`escape \\${c}${hex}`);
      const cp = parseInt(hex, 16);
      return [[cp, cp]];
    }
    if (c === "p" || c === "P" || c === "b" || c === "B" || /[1-9k]/.test(c)) throw new Error(`escape \\${c}`);
    const cp = c.codePointAt(0);
    return [[cp, cp]];
  };
  const classSet = () => {
    const negated = peek() === "^";
    if (negated) i++;
    const ranges = [];
    const single = () => {
      if (peek() === "\\") {
        i++;
        return escape();
      }
      const cp = src[i++].codePointAt(0);
      return [[cp, cp]];
    };
    while (peek() !== "]") {
      if (peek() === undefined) throw new Error("class with no ]");
      const first = single();
      if (peek() === "-" && src[i + 1] !== "]" && first.length === 1 && first[0][0] === first[0][1]) {
        i++;
        const last = single();
        if (last.length !== 1 || last[0][0] !== last[0][1]) throw new Error("class range ending in a set");
        ranges.push([first[0][0], last[0][0]]);
      } else ranges.push(...first);
    }
    i++;
    return negated ? complement(ranges) : ranges;
  };
  const setBytes = (ranges) => Math.max(0, ...ranges.map(([lo, hi]) => rangeBytes(lo, hi)));
  const quantified = (bytes) => {
    const q = peek();
    let count = 1;
    if (q === "?") {
      i++;
    } else if (q === "*" || q === "+") {
      throw new Error(`open quantifier ${q}`);
    } else if (q === "{") {
      const end = src.indexOf("}", i);
      const body = src.slice(i + 1, end).join("");
      const m = body.match(/^(\d+)(?:,(\d*))?$/);
      if (!m) throw new Error(`quantifier {${body}}`);
      if (m[2] === "") throw new Error(`open quantifier {${body}}`);
      count = Number(m[2] ?? m[1]);
      i = end + 1;
    }
    if (peek() === "?") i++; // lazy: the same most
    return bytes * count;
  };
  const sequence = () => {
    let total = 0;
    while (i < src.length && peek() !== "|" && peek() !== ")") {
      const c = src[i++];
      let bytes;
      if (c === "(") {
        if (peek() === "?") {
          if (src[i + 1] !== ":") throw new Error("group other than (?:...)");
          i += 2;
        }
        bytes = alternation();
        if (src[i++] !== ")") throw new Error("group with no )");
      } else if (c === "[") bytes = setBytes(classSet());
      else if (c === "\\") bytes = setBytes(escape());
      else if (c === ".") bytes = setBytes(complement([[0x0a, 0x0a], [0x0d, 0x0d], [0x2028, 0x2029]]));
      else if (c === "^" || c === "$") throw new Error(`anchor ${c} inside the pattern`);
      else if ("*+?{".includes(c)) throw new Error(`quantifier ${c} with nothing before it`);
      else bytes = rangeBytes(c.codePointAt(0), c.codePointAt(0));
      total += quantified(bytes);
    }
    return total;
  };
  const alternation = () => {
    let most = sequence();
    while (peek() === "|") {
      i++;
      most = Math.max(most, sequence());
    }
    return most;
  };
  // A `|` outside every group splits the anchors: `^a|b$` is `^a` or `b$`, and either half matches any tail or head.
  const bytes = sequence();
  if (peek() === "|") throw new Error("not anchored at both ends: | outside a group (write ^(?:a|b)$)");
  if (i !== src.length) throw new Error(`unmatched ${src[i]}`);
  return bytes;
}

/** The most bytes a string schema's value takes inside JSON.stringify's quotes, or undefined with a problem. */
function stringBytes(schema, path, problems) {
  if (typeof schema.pattern === "string") {
    try {
      return patternBytes(schema.pattern);
    } catch (error) {
      problems.push(`${path}: pattern ${schema.pattern} has no largest size the lint can read (${error.message})`);
      return undefined;
    }
  }
  if (schema.format === "date") return 10;
  if (schema.format === "date-time" && schema.maxLength !== undefined) return schema.maxLength;
  problems.push(
    `${path}: string with no bound in bytes: AgentRun's check counts maxLength in grapheme clusters, so give it a pattern such as ^[^\\u0000-\\u001f\\ud800-\\udfff]{0,N}$`,
  );
  // Still counted in the total, at 6 B a character (the most one code point takes), so the number shows what the field
  // would cost if maxLength counted code points.
  return schema.maxLength === undefined ? undefined : schema.maxLength * 6;
}

/** The template's output schema file, when its agent.md has a schedule trigger and an output schema. */
function scheduledSchema(name) {
  const agent = readFileSync(join(templatesDir, name, "agent.md"), "utf8");
  if (!/kind:\s*schedule\b/.test(agent)) return undefined;
  return agent.match(/^output:\s*\{\s*schema:\s*([^\s,}]+)/m)?.[1];
}

/** The largest value the `x-carried` fields of an output schema allow, its size as previousResultOf would hand it on, and
 *  the problems that leave it without one. */
export function measureCarried(schema) {
  const problems = [];
  const worst = {};
  for (const key of schema["x-carried"] ?? []) {
    if (!schema.properties?.[key]) problems.push(`x-carried names ${key}, which the schema has no property for`);
    else worst[key] = largest(schema.properties[key], schema, `$.${key}`, problems);
  }
  return { bytes: Buffer.byteLength(JSON.stringify(worst, null, 2)), problems };
}

/** The problems that fail a declared schema, and the sizes behind them. AgentRun (#3310) hands a result over the limit
 *  as its x-carried fields alone, and drops the oldest entries (the front) of its carried arrays until those fit; a scalar
 *  or an object is never cut, nor anything inside an entry. So the carried fields that are not arrays must fit
 *  CARRIED_BUDGET_BYTES together (`neverCut`), and each carried array must be bounded, its one entry too (`entries`: one
 *  entry's worst case and the array's at maxItems, which may be over the budget). */
export function checkCarried(schema) {
  const problems = [];
  const neverCut = {};
  const entries = [];
  for (const key of schema["x-carried"] ?? []) {
    const field = schema.properties?.[key];
    if (!field) {
      problems.push(`x-carried names ${key}, which the schema has no property for`);
      continue;
    }
    // An array is trimmed by the runtime; any other value the field may take instead is never cut, even when the array
    // is the larger of the two.
    const values = alternatives(field, schema, `$.${key}`, problems);
    const arrays = values.filter(Array.isArray);
    const others = values.filter((value) => !Array.isArray(value));
    if (arrays.length) {
      const value = widest(arrays);
      const one = Buffer.byteLength(JSON.stringify({ [key]: value.slice(0, 1) }, null, 2)) - Buffer.byteLength(JSON.stringify({ [key]: [] }, null, 2));
      entries.push({ key, entry: one, all: Buffer.byteLength(JSON.stringify({ [key]: value }, null, 2)) });
    }
    if (others.length) neverCut[key] = widest(others);
  }
  const bytes = Buffer.byteLength(JSON.stringify(neverCut, null, 2));
  if (bytes > CARRIED_BUDGET_BYTES) {
    problems.unshift(`carried fields that are never cut (${Object.keys(neverCut).join(", ")}): worst case ${bytes} B is over the ${CARRIED_BUDGET_BYTES} B budget`);
  }
  return { bytes, entries, problems };
}

function main() {
  let failed = 0;
  let checked = 0;
  const undeclared = [];
  for (const name of readdirSync(templatesDir).sort()) {
    let file;
    try {
      file = scheduledSchema(name);
    } catch {
      continue;
    }
    if (!file) continue;
    const schema = JSON.parse(readFileSync(join(templatesDir, name, file), "utf8"));
    const carried = schema["x-carried"];
    if (carried === undefined) {
      undeclared.push(name);
      console.log(`not declared ${name}/${file}`);
      continue;
    }
    checked++;
    const { bytes, entries, problems } = checkCarried(schema);
    const arrays = entries.map(({ key, entry, all }) => `; ${key} ${entry} B an entry, ${all} B at maxItems`).join("");
    console.log(`${problems.length ? "not ok" : "ok"} ${name}/${file}: carried ${carried.join(", ")}: never cut ${bytes} B${arrays}`);
    for (const problem of problems) console.log(`  ${problem}`);
    if (problems.length) failed++;
  }
  console.log(
    `lint-handoff-size: ${checked} declared, ${failed} unbounded or with fields never cut over the ${CARRIED_BUDGET_BYTES} B budget (limit ${PREVIOUS_RESULT_MAX_BYTES} B); ${undeclared.length} scheduled templates not declared`,
  );
  return failed ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main());
