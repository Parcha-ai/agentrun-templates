// A grader rubric that quotes a fixture word for word keeps that quote equal to the fixture, so the two cannot drift.
// A quote is marked in the rubric as
//   <!-- quote fixtures/web.json fetch.answers.0.text.body -->
//   ````text
//   ...the value, verbatim...
//   ````
//   <!-- /quote -->
// The path after the file walks its JSON; a string met before the path ends is parsed as JSON and the walk goes on
// inside it (a fetch answer's text is the page's own JSON). The fence lines (three or more backticks or tildes) are
// not part of the quote. The file is relative to the case folder (the grader's ../).
// Usage: node .github/lint-rubric-quotes.mjs [--write]. Prints each quote checked; exit 1 on a quote that differs or
// cannot be read. --write rewrites each quote from its fixture instead.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const repo = join(import.meta.dirname, "..");
const write = process.argv.includes("--write");
const files = (at) =>
  readdirSync(at, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(at, e.name)) : [join(at, e.name)]));
const QUOTE = /<!-- quote (\S+) (\S+) -->\n((`{3,}|~{3,})[^\n]*)\n(?:([\s\S]*?)\n)?\4\n<!-- \/quote -->/g;

const valueAt = (file, path) => {
  let v = JSON.parse(readFileSync(file, "utf8"));
  for (const key of path.split(".")) {
    if (typeof v === "string") v = JSON.parse(v);
    if (v === null || typeof v !== "object" || !(key in v)) throw new Error(`no ${key} on the path ${path}`);
    v = v[key];
  }
  if (typeof v !== "string") throw new Error(`${path} is not a string`);
  return v;
};

let checked = 0, bad = 0;
for (const file of files(join(repo, "templates")).filter((f) => /\/evals\/[^/]+\/graders\/[^/]+\.md$/.test(f)).sort()) {
  const text = readFileSync(file, "utf8");
  if (!text.includes("<!-- quote ")) continue;
  const caseDir = dirname(dirname(file));
  let out = text;
  for (const m of text.matchAll(QUOTE)) {
    const [whole, source, path, opening, fence, quoted = ""] = m;
    const where = `${relative(repo, file)}: ${source} ${path}`;
    checked++;
    let value;
    try {
      value = valueAt(join(caseDir, source), path);
    } catch (err) {
      bad++;
      console.log(`${where}: cannot read: ${err.message}`);
      continue;
    }
    if (value.includes(fence)) {
      bad++;
      console.log(`${where}: the value holds the fence ${fence}; use a longer one`);
      continue;
    }
    if (quoted === value) {
      console.log(`${where}: equal (${value.length} characters)`);
    } else if (write) {
      out = out.replace(whole, () => `<!-- quote ${source} ${path} -->\n${opening}\n${value}\n${fence}\n<!-- /quote -->`);
      console.log(`${where}: rewritten from the fixture (${value.length} characters)`);
    } else {
      bad++;
      let i = 0;
      while (i < quoted.length && quoted[i] === value[i]) i++;
      console.log(`${where}: differs from the fixture at character ${i}; run with --write to regenerate it`);
    }
  }
  const opened = text.split("<!-- quote ").length - 1;
  const read = [...text.matchAll(QUOTE)].length;
  if (opened !== read) {
    bad++;
    console.log(`${relative(repo, file)}: ${opened - read} quote marker(s) without a fenced body and a closing <!-- /quote -->`);
  }
  if (write && out !== text) writeFileSync(file, out);
}
console.log(`lint-rubric-quotes: ${checked} quotes checked, ${bad} wrong`);
process.exit(bad ? 1 : 0);
