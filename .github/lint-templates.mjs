// Two strings that must not come back into a template, checked as text, with no judgment:
// - `# Learned`, anywhere under templates/. AgentRun serves the owner's corrections under that heading itself and says
//   what they are; a template that names it was written for the notes beta.45 removed (agent-written state there).
// - a Markdown heading saying "What you remember" or "What to keep": the end-of-run turn that asked for notes is gone.
// Usage: node .github/lint-templates.mjs. Prints each hit as file:line and the totals; exit 1 on any hit.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

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
console.log(`lint-templates: ${hits.learned} "# Learned" lines, ${hits.heading} what-you-remember headings, in ${hits.templates.size} templates`);
process.exit(hits.learned + hits.heading ? 1 : 0);
