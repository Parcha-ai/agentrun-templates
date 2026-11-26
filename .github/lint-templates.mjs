// Two strings that must not come back into a template, checked as text, with no judgment:
// - `# Learned`, anywhere under templates/. AgentRun serves the owner's corrections under that heading itself and says
//   what they are; a template that names it was written for the notes beta.45 removed (agent-written state there).
// - a Markdown heading saying "What you remember" or "What to keep": the end-of-run turn that asked for notes is gone.
// And one file that must match what it lists:
// - a skill's kit/manifest.json gives the sha256 of every other file in that skill's folder (dot-folders and
//   node_modules aside). A kit script trusts a file in the run's copy of the folder only when its hash is the one listed
//   (the run can write there), so a manifest that differs from the files is an error. `--write-manifests` rewrites each.
// Usage: node .github/lint-templates.mjs [--write-manifests]. Prints each hit as file:line and the totals; exit 1 on any hit.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const repo = join(import.meta.dirname, "..");
const files = (at) =>
  readdirSync(at, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(at, e.name)) : [join(at, e.name)]));
const heading = /^#{1,6}\s.*(what you remember|what to keep)/i;
const hits = { learned: 0, heading: 0, templates: new Set() };
for (const file of files(join(repo, "templates")).sort()) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    const kinds = [line.includes("# Learned") && "learned", heading.test(line) && "heading"].filter(Boolean);
    for (const kind of kinds) {
      hits[kind]++;
      hits.templates.add(relative(repo, file).split("/")[1]);
      console.log(`${relative(repo, file)}:${i + 1}: ${kind === "learned" ? "`# Learned`" : "a what-you-remember heading"}: ${line.trim().slice(0, 120)}`);
    }
  });
}
const skillFiles = (at) =>
  readdirSync(at, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? (e.name.startsWith(".") || e.name === "node_modules" ? [] : skillFiles(join(at, e.name))) : [join(at, e.name)],
  );
const manifestOf = (skill) =>
  Object.fromEntries(
    skillFiles(skill)
      .map((f) => relative(skill, f).split("\\").join("/"))
      .filter((rel) => rel !== "kit/manifest.json")
      .sort()
      .map((rel) => [rel, createHash("sha256").update(readFileSync(join(skill, rel))).digest("hex")]),
  );
const write = process.argv.includes("--write-manifests");
let stale = 0;
const manifests = files(join(repo, "templates")).filter((f) => /\/skills\/[^/]+\/kit\/manifest\.json$/.test(f)).sort();
for (const file of manifests) {
  const skill = dirname(dirname(file));
  const want = { note: "sha256 of each file in this skill folder, written by node .github/lint-templates.mjs --write-manifests", sha256: manifestOf(skill) };
  const text = JSON.stringify(want, null, 1) + "\n";
  if (readFileSync(file, "utf8") === text) continue;
  if (write) writeFileSync(file, text);
  else {
    stale++;
    console.log(`${relative(repo, file)}: does not match the files of ${relative(repo, skill)}: run node .github/lint-templates.mjs --write-manifests`);
  }
}
console.log(`lint-templates: ${hits.learned} "# Learned" lines, ${hits.heading} what-you-remember headings, in ${hits.templates.size} templates; ${manifests.length} kit manifests, ${stale} stale`);
process.exit(hits.learned + hits.heading + stale ? 1 : 0);
