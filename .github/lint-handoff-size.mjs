// A scheduled template's answer is its next run's only memory, and AgentRun hands it over only while it is small enough:
// agentrun packages/serve/src/trigger-targets.ts, PREVIOUS_RESULT_MAX_BYTES = 32 * 1024. previousResultOf serializes the
// last completed run's answer with JSON.stringify(output, null, 2), and when that is over the limit the next run is
// handed none of it (one line saying so), not a cut copy: every carried list, window and date is lost at once.
//
// A schema names the top-level fields its skill reads back from the last answer in `x-carried` (an annotation; JSON
// Schema validators ignore it). For each such schema this lint builds the largest value those fields allow and measures
// it the way previousResultOf does (2-space indent):
// - every array at maxItems, every string at maxLength (ASCII; `format: date` is 10), every number 24 characters,
//   every object with all its properties, the widest branch of a type list, anyOf or oneOf, the longest enum value;
// - the carried fields must fit CARRIED_BUDGET_BYTES: under half the limit, so the run's own output (its report, its
//   items) keeps the larger part, about 20 KB;
// - inside a carried field, a string with no maxLength, an array with no maxItems, or an object open to more keys (no
//   `additionalProperties: false`, or a key schema without maxProperties and a key maxLength) has no largest size and
//   fails.
// A template with a `kind: schedule` trigger (the one source with previousResult: true, agentrun trigger-schedule.ts)
// whose schema has no `x-carried` is listed as "not declared", and not checked.
// Usage: node .github/lint-handoff-size.mjs. Prints each scheduled template's carried worst case or "not declared", then
// each problem; exit 1 on any problem.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export const PREVIOUS_RESULT_MAX_BYTES = 32 * 1024;
export const CARRIED_BUDGET_BYTES = 12_000;
const WIDEST_NUMBER = -1.7976931348623157e308; // JSON.stringify gives "-1.7976931348623157e+308", 24 characters
const FORMAT_WIDTH = { date: 10 };

const repo = join(import.meta.dirname, "..");
const templatesDir = join(repo, "templates");

/** The largest value `schema` allows, or problems naming why it has none. */
function largest(schema, root, path, problems) {
  if (schema === true || schema === undefined) {
    problems.push(`${path}: any value is allowed`);
    return null;
  }
  if (schema.$ref) {
    const target = schema.$ref.replace(/^#\//, "").split("/").reduce((at, key) => at?.[key], root);
    if (!target) problems.push(`${path}: $ref ${schema.$ref} not found`);
    return target ? largest(target, root, path, problems) : null;
  }
  const branches = schema.anyOf ?? schema.oneOf;
  if (branches) return widest(branches.map((branch, i) => largest({ ...schema, anyOf: undefined, oneOf: undefined, ...branch }, root, `${path}|${i}`, problems)));
  if ("const" in schema) return schema.const;
  if (schema.enum) return widest(schema.enum);
  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : inferred(schema);
  if (types.length === 0) {
    problems.push(`${path}: no type`);
    return null;
  }
  return widest(types.map((type) => largestOf(type, schema, root, path, problems)));
}

const inferred = (schema) => (schema.properties ? ["object"] : schema.items ? ["array"] : []);
const size = (value) => JSON.stringify(value)?.length ?? 0;
const widest = (values) => values.reduce((best, value) => (size(value) > size(best) ? value : best), null);

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
      const width = schema.maxLength ?? FORMAT_WIDTH[schema.format];
      if (width === undefined) {
        problems.push(`${path}: string with no maxLength`);
        return "";
      }
      return "x".repeat(width);
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
      const keyWidth = schema.propertyNames?.maxLength;
      if (schema.maxProperties === undefined || keyWidth === undefined)
        problems.push(`${path}: map with no maxProperties or no propertyNames.maxLength`);
      const value = largest(extra, root, `${path}{}`, problems);
      for (let i = 0; i < (schema.maxProperties ?? 1); i++) out[String(i).padStart(keyWidth ?? 1, "k")] = value;
      return out;
    }
    default:
      problems.push(`${path}: type ${type}`);
      return null;
  }
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
    const { bytes, problems } = measureCarried(schema);
    if (bytes > CARRIED_BUDGET_BYTES) problems.unshift(`carried worst case ${bytes} B is over the ${CARRIED_BUDGET_BYTES} B budget`);
    console.log(`${problems.length ? "not ok" : "ok"} ${name}/${file}: carried ${carried.join(", ")}: worst case ${bytes} B`);
    for (const problem of problems) console.log(`  ${problem}`);
    if (problems.length) failed++;
  }
  console.log(
    `lint-handoff-size: ${checked} declared, ${failed} over the ${CARRIED_BUDGET_BYTES} B budget or unbounded (limit ${PREVIOUS_RESULT_MAX_BYTES} B); ${undeclared.length} scheduled templates not declared`,
  );
  return failed ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main());
