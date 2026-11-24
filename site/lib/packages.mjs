// Reads the index (.agentrun/marketplace.json) and each package it lists, local (from disk) or github: (from GitHub at
// the resolved sha), into the one model the pages render. It reads only the index and those packages.

import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";
import { frontMatter, parseYaml } from "./yaml.mjs";
import { MEDIA_NAME, MEDIA_TYPES, mediaSize } from "./media.mjs";
import { validRepo } from "./github.mjs";

export const CATEGORIES = ["engineering", "security", "sales", "marketing", "research", "finance", "operations", "compliance", "personal"];
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TAG = /^[a-z0-9-]{1,32}$/;
const INPUT_KEY = /^[a-z][a-z0-9_]{0,63}$/;
const MAX_FILE_BYTES = 256 << 10;

export class SiteError extends Error {}

/** A source string as {owner, repo, path, ref}: github:<owner>/<repo>[/<path>][@<ref>] or the github.com tree URL. */
export function parseGithubSource(source) {
  let owner, repo, path = "", ref;
  const tree = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+)(?:\/(.+?))?)?\/?$/.exec(source);
  if (tree) [, owner, repo, ref, path = ""] = tree;
  else {
    const m = /^github:([^/@]+)\/([^/@]+)((?:\/[^@]+)?)(?:@([^@]+))?$/.exec(source);
    if (!m) return null;
    [, owner, repo, path, ref] = m;
    path = path.replace(/^\//, "");
  }
  path = path.replace(/\/+$/, "");
  if (!validRepo(owner, repo)) return null;
  if (path && (path.split("/").some((part) => part === "" || part === "." || part === "..") || !/^[A-Za-z0-9._/-]+$/.test(path))) return null;
  if (ref !== undefined && !/^[A-Za-z0-9._/-]{1,255}$/.test(ref)) return null;
  return { owner, repo, path, ref };
}

export function readIndex(root) {
  const file = join(root, ".agentrun", "marketplace.json");
  let index;
  try { index = JSON.parse(readFileSync(file, "utf8")); } catch (err) { throw new SiteError(`${file}: ${err.message}`); }
  const problems = [];
  if (!index || typeof index !== "object" || !Array.isArray(index.templates)) throw new SiteError(`${file}: expected {name, owner, templates: [...]}`);
  const seen = new Set();
  // Each package once: one package under two names is two cards for one template, on this site and in an AgentRun
  // console that lists this index. A package is its repository and folder: its pin, or how its owner and repository
  // are capitalized, don't make it another. A folder's path is case-sensitive on GitHub: templates/watch and
  // templates/Watch are two.
  const packages = new Map();
  for (const [k, t] of index.templates.entries()) {
    const at = `templates[${k}]`;
    if (!t || typeof t.name !== "string" || !NAME.test(t.name)) problems.push(`${at}.name must match ${NAME}`);
    else if (seen.has(t.name)) problems.push(`${at}.name "${t.name}" is listed twice`);
    else seen.add(t.name);
    if (typeof t.source !== "string") problems.push(`${at}.source is required`);
    else if (!t.source.startsWith("./") && !parseGithubSource(t.source)) problems.push(`${at}.source "${t.source}" is neither ./<path> nor github:<owner>/<repo>[/<path>][@<ref>]`);
    else {
      const g = t.source.startsWith("./") ? null : parseGithubSource(t.source);
      const pkg = g ? `github:${g.owner.toLowerCase()}/${g.repo.toLowerCase()}/${g.path}` : `./${t.source.slice(2).replace(/\/+$/, "")}`;
      const first = packages.get(pkg);
      if (first) problems.push(`${at}.source "${t.source}" is the package ${first.at} (${first.name}) lists: list each package once`);
      else packages.set(pkg, { at, name: t?.name });
    }
    if (t.category !== undefined && !CATEGORIES.includes(t.category)) problems.push(`${at}.category "${t.category}" is not one of ${CATEGORIES.join(", ")}`);
    // summary: the one line on the card and under the page title, what it does. setup: what to do before installing,
    // said once in the Install section.
    if (typeof t.summary !== "string" || t.summary.length < 20 || t.summary.length > 140 || /\n/.test(t.summary)) problems.push(`${at}.summary is required: one line of 20 to 140 characters saying what it does`);
    if (t.setup !== undefined && (typeof t.setup !== "string" || !t.setup.trim() || t.setup.length > 400)) problems.push(`${at}.setup, when given, is up to 400 characters`);
    // guide: a step-by-step setup page, linked under the setup line. https only, and nothing that would end a Markdown link.
    if (t.guide !== undefined && !(typeof t.guide === "string" && t.guide.length <= 300 && /^https:\/\/[^\s()<>"'`]+$/.test(t.guide))) problems.push(`${at}.guide, when given, is one https URL`);
    if (t.tags !== undefined && !(Array.isArray(t.tags) && t.tags.length <= 8 && t.tags.every((tag) => typeof tag === "string" && TAG.test(tag)))) problems.push(`${at}.tags: at most 8, each ${TAG}`);
  }
  if (problems.length) throw new SiteError(`${file}:\n  ${problems.join("\n  ")}`);
  return index;
}

function localReader(root, rel) {
  const dir = resolve(root, rel);
  const back = relative(resolve(root), dir);
  if (back === "" || back.startsWith("..") || back.split(sep).includes("..")) throw new SiteError(`source ${rel} is outside the repository`);
  try { if (!lstatSync(dir).isDirectory()) throw new Error("not a folder"); } catch (err) { throw new SiteError(`source ${rel}: ${err.message}`); }
  const files = new Map();
  const walk = (d) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile()) files.set(relative(dir, p).split(sep).join("/"), lstatSync(p).size);
      // Links and special files are left out, as the platform's own import refuses them.
    }
  };
  walk(dir);
  return {
    list: () => [...files.keys()].sort(),
    size: (f) => files.get(f),
    read: (f) => (files.has(f) ? readFileSync(join(dir, f), "utf8") : undefined),
    path: (f) => (files.has(f) ? join(dir, f) : undefined),
  };
}

/** Loads one index entry. `ctx` = {root, repo: {owner, name}, localSha, github, log}. */
export async function loadPackage(entry, ctx) {
  let reader, source, sha, owner, repo, path, local;
  if (entry.source.startsWith("./")) {
    local = true;
    path = entry.source.slice(2).replace(/\/+$/, "");
    reader = localReader(ctx.root, path);
    ({ owner, name: repo } = ctx.repo);
    sha = ctx.localSha;
    source = `github:${owner}/${repo}/${path}`;
  } else {
    local = false;
    const g = parseGithubSource(entry.source);
    ({ owner, repo, path } = g);
    sha = ctx.github.resolve(owner, repo, g.ref);
    reader = ctx.github.reader(owner, repo, sha, path);
    source = `github:${owner}/${repo}${path ? `/${path}` : ""}`;
  }
  const where = `${entry.name} (${entry.source})`;
  const read = (f, { optional = false } = {}) => {
    const size = reader.size(f);
    if (size === undefined) {
      if (optional) return undefined;
      throw new SiteError(`${where}: ${f} is missing`);
    }
    if (size > MAX_FILE_BYTES) throw new SiteError(`${where}: ${f} is over 256 KiB`);
    return reader.read(f);
  };
  const readJson = (f, opts) => {
    const text = read(f, opts);
    if (text === undefined) return undefined;
    try { return JSON.parse(text); } catch (err) { throw new SiteError(`${where}: ${f}: ${err.message}`); }
  };

  let fm;
  try { fm = frontMatter(read("agent.md")); } catch (err) { throw new SiteError(`${where}: agent.md: ${err.message}`); }
  const m = fm.data;
  if (!m || typeof m !== "object" || Array.isArray(m)) throw new SiteError(`${where}: agent.md has no front matter`);
  if (m.name !== undefined && m.name !== entry.name) ctx.log(`warn: ${where}: the index names it ${entry.name}, its agent.md ${m.name}`);
  const files = reader.list();

  const params = isObj(m.parameters) ? m.parameters : {};
  const fill = (text) => fillParameters(text, params);

  const inputs = [];
  if (isObj(m.inputs)) {
    for (const [key, spec] of Object.entries(m.inputs)) {
      if (!INPUT_KEY.test(key)) throw new SiteError(`${where}: input "${key}" must match ${INPUT_KEY}`);
      if (!isObj(spec)) throw new SiteError(`${where}: input "${key}" is not a mapping`);
      inputs.push({ key, ...spec, required: spec.required !== false });
    }
  }
  const parameters = Object.entries(params).map(([key, spec]) => ({ key, ...(isObj(spec) ? spec : {}), required: isObj(spec) && spec.required !== false }));

  let outputSchema, outputSchemaPath;
  if (isObj(m.output) && typeof m.output.schema === "string") {
    outputSchemaPath = m.output.schema;
    outputSchema = readJson(outputSchemaPath);
  }
  const markdownField = outputSchema ? markdownProperty(outputSchema) : undefined;

  const skills = [];
  for (const f of files.filter((f) => /^skills\/[^/]+\/SKILL\.md$/.test(f))) {
    let sk;
    try { sk = frontMatter(read(f)); } catch (err) { throw new SiteError(`${where}: ${f}: ${err.message}`); }
    skills.push({ name: sk.data?.name ?? f.split("/")[1], folder: f.split("/")[1], description: typeof sk.data?.description === "string" ? sk.data.description : "", body: sk.body, files: files.filter((g) => g.startsWith(`skills/${f.split("/")[1]}/`)).map((g) => g.split("/").slice(2).join("/")) });
  }
  const rules = files.filter((f) => /^rules\/[^/]+$/.test(f)).map((f) => f.slice(6));
  const evalNames = [...new Set(files.filter((f) => /^evals\/[^/]+\/prompt\.md$/.test(f)).map((f) => f.split("/")[1]))].sort();

  // Sample runs aren't part of a package: they live in this repo's samples/<template>/<name>/, for the site only.
  const examples = [];
  const samplesDir = join(ctx.root, "samples", entry.name);
  const samples = existsSync(samplesDir) ? localReader(ctx.root, `samples/${entry.name}`) : undefined;
  const sampleJson = (f) => {
    const text = samples?.read(f);
    if (text === undefined) return undefined;
    try { return JSON.parse(text); } catch (err) { throw new SiteError(`samples/${entry.name}/${f}: ${err.message}`); }
  };
  for (const name of [...new Set((samples?.list() ?? []).filter((f) => f.includes("/")).map((f) => f.split("/")[0]))].sort()) {
    const ex = {
      name, input: sampleJson(`${name}/input.json`), output: sampleJson(`${name}/output.json`), outputMd: samples.read(`${name}/output.md`),
      media: sampleMedia(entry.name, name, samples),
    };
    if (ex.input !== undefined || ex.output !== undefined || ex.outputMd !== undefined || ex.media.length) examples.push(ex);
  }

  let measured = readJson("measured.json", { optional: true });
  if (measured !== undefined && !(isObj(measured) && isObj(measured.passed))) {
    ctx.log(`warn: ${where}: measured.json has no passed: {<harness>: "<passed>/<cases>"}; ignored`);
    measured = undefined;
  }

  const category = entry.category ?? (CATEGORIES.includes(m.category) ? m.category : undefined);
  if (!category) throw new SiteError(`${where}: no category in the index or the manifest`);
  if (entry.category && m.category && m.category !== entry.category) ctx.log(`warn: ${where}: category ${entry.category} in the index, ${m.category} in agent.md; the index wins`);
  const tags = [...new Set([...(entry.tags ?? []), ...(Array.isArray(m.tags) ? m.tags.filter((t) => typeof t === "string" && TAG.test(t)) : [])])].slice(0, 8);

  const displayName = siteName(typeof m.display_name === "string" ? m.display_name : entry.name);
  if (!displayName) throw new SiteError(`${where}: display_name ${JSON.stringify(m.display_name)} starts with a parameter; write "Name: \${parameters.x}" or "Name (\${parameters.x} ...)"`);
  const description = fill(typeof m.description === "string" ? m.description.trim() : "");
  if (!description) throw new SiteError(`${where}: agent.md has no description`);

  return {
    name: entry.name,
    local,
    owner,
    repo,
    path,
    sha,
    source,
    installSource: `${source}@${sha}`,
    treeUrl: `https://github.com/${owner}/${repo}/tree/${sha}${path ? `/${path}` : ""}`,
    repoUrl: `https://github.com/${owner}/${repo}`,
    displayName,
    description,
    summary: entry.summary,
    setup: entry.setup,
    guide: entry.guide,
    version: str(m.version),
    license: str(m.license),
    author: isObj(m.author) ? { name: str(m.author.name), url: str(m.author.url) } : typeof m.author === "string" ? { name: m.author } : undefined,
    repository: str(m.repository),
    category,
    tags,
    instructions: fm.body,
    inputs,
    parameters,
    harness: Array.isArray(m.harness) ? m.harness.map(String) : [],
    model: isObj(m.model) ? m.model : undefined,
    effort: str(m.effort),
    tools: Array.isArray(m.tools) ? m.tools.map(String) : [],
    toolPolicy: isObj(m.tool_policy) ? m.tool_policy : undefined,
    mcp: (Array.isArray(m.mcp) ? m.mcp : []).filter(isObj).map((need) => ({
      source: str(need.source),
      toolkit: str(need.toolkit),
      server: str(need.server),
      tools: Array.isArray(need.tools) ? need.tools.map(String) : [],
      allow: Array.isArray(need.allow) ? need.allow.map(String) : [],
      required: need.required === true,
      reason: str(need.reason) ? fill(need.reason) : undefined,
    })),
    computer: Array.isArray(m.computer) ? m.computer.map(String) : m.computer === "default" ? ["default"] : undefined,
    checkout: str(m.checkout),
    secrets: Array.isArray(m.secrets) ? m.secrets.map(String) : [],
    budget: isObj(m.budget) ? m.budget : undefined,
    // true, or an object (on, with the loop's settings: agree_on, compile_after), as AgentRun beta.46 takes it.
    learning: m.learning === true || isObj(m.learning),
    approvals: str(m.approvals),
    triggers: (Array.isArray(m.triggers) ? m.triggers : []).filter(isObj),
    outputSchema,
    outputSchemaPath,
    markdownField,
    skills,
    rules,
    evals: evalNames,
    examples,
    measured,
    fill,
  };
}

/** The files in samples/<template>/<sample>/media/, each with the URL the build copies it to, beside the template's
 *  page. Captions (.vtt) go on the .mp4 with the same base name. Any other file there fails the build. */
function sampleMedia(template, sample, samples) {
  const prefix = `${sample}/media/`;
  const names = samples.list().filter((f) => f.startsWith(prefix)).map((f) => f.slice(prefix.length));
  if (!names.length) return [];
  const where = (f) => `samples/${template}/${prefix}${f}`;
  if (!MEDIA_NAME.test(sample)) throw new SiteError(`samples/${template}/${sample}: a sample with media needs a plain folder name (letters, digits, ".", "_", "-")`);
  const items = [];
  for (const f of names) {
    if (f.includes("/")) throw new SiteError(`${where(f)}: media/ is flat; move the file up out of its folder`);
    if (!MEDIA_NAME.test(f)) throw new SiteError(`${where(f)}: name media files with letters, digits, ".", "_" and "-" only`);
    const known = MEDIA_TYPES[extname(f).toLowerCase()];
    if (!known) throw new SiteError(`${where(f)}: ${extname(f) || "no extension"} isn't a media type the site plays (${Object.keys(MEDIA_TYPES).join(" ")})`);
    const path = samples.path(prefix + f);
    const dims = known.kind === "image" || known.kind === "video" ? mediaSize(readFileSync(path), f) : null;
    items.push({ file: f, kind: known.kind, type: known.type, path, bytes: samples.size(prefix + f), url: `/templates/${template}/samples/${sample}/${f}`, ...dims });
  }
  const base = (f) => f.slice(0, f.length - extname(f).length);
  for (const vtt of items.filter((m) => m.kind === "captions")) {
    const video = items.find((m) => m.kind === "video" && base(m.file) === base(vtt.file));
    if (!video) throw new SiteError(`${where(vtt.file)}: captions need the .mp4 with the same name, ${base(vtt.file)}.mp4`);
    video.captions = vtt;
  }
  return items.sort((a, b) => a.file.localeCompare(b.file));
}

/** The first top-level string property marked text/markdown (the report field), else report_markdown if present. */
export function markdownProperty(schema) {
  const props = isObj(schema?.properties) ? schema.properties : {};
  for (const [key, p] of Object.entries(props)) if (isObj(p) && p.contentMediaType === "text/markdown") return key;
  return Object.hasOwn(props, "report_markdown") ? "report_markdown" : undefined;
}

/** "${parameters.x}" as x's default when it has one; otherwise the placeholder goes, with the punctuation it leaves. */
// The site names a template by the words before its setup: "Inbox assistant: ${parameters.owner_name}" and
// "KYB due diligence (${parameters.risk_appetite} risk appetite)" are "Inbox assistant" and "KYB due diligence".
// A parameter with no "Name:" or "Name (" before it has no name to show: undefined.
export function siteName(displayName) {
  const at = displayName.indexOf("${");
  if (at < 0) return displayName.trim();
  return /^(.*?\S)\s*[:(]/.exec(displayName.slice(0, at))?.[1];
}

export function fillParameters(text, params) {
  if (typeof text !== "string") return "";
  let out = text.replace(/\$\{parameters\.([a-z][a-z0-9_]*)\}/g, (_, key) => {
    const d = params?.[key]?.default;
    return d === undefined || d === null || d === "" ? "\u0000" : String(d);
  });
  if (out.includes("\u0000")) {
    out = out
      .replace(/\s*\/\s*\u0000|\u0000\s*\/\s*/g, "\u0000")
      .replace(/\s*\(\s*\u0000[^)]*\)/g, "")
      .replace(/\s*[:\-–]\s*\u0000/g, "")
      .replace(/\u0000/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }
  return out;
}

function isObj(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function str(v) {
  return typeof v === "string" && v !== "" ? v : undefined;
}

export { parseYaml };
