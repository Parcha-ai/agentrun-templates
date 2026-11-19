// Every template's eval cases read and checked as `agentrun-serve eval-template` reads them before its first run
// (readCases: the package, each prompt, case.yaml, fixture, corrections file and grader), and nothing run: no model,
// no server, no spend. The CLI's validate-template checks a package's layout only, not its cases.
// Usage: node .github/parse-evals.mjs <folder @parcha/agentrun-serve is installed in>. Exit 1 on any refusal.
import { existsSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

if (!process.argv[2]) throw new Error("usage: node .github/parse-evals.mjs <folder @parcha/agentrun-serve is installed in>");
const pkgJson = createRequire(join(process.argv[2], "x.js")).resolve("@parcha/agentrun-serve/package.json");
const { version } = (await import(pathToFileURL(pkgJson), { with: { type: "json" } })).default;
const { readCases } = await import(pathToFileURL(join(dirname(pkgJson), "dist/template-eval.js")));
const dirs = (at) => (existsSync(at) ? readdirSync(at, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : []);
const root = join(import.meta.dirname, "..", "templates");
const count = { templates: 0, cases: 0, refusedTemplates: 0, refusedCases: 0 };
for (const name of dirs(root)) {
  count.templates++;
  count.cases += dirs(join(root, name, "evals")).length;
  try {
    readCases(join(root, name));
  } catch (error) {
    if (!["CaseError", "PackageError"].includes(error?.constructor?.name)) throw error;
    count.refusedTemplates++;
    count.refusedCases += new Set(error.message.match(/(?<=^- )evals\/[a-z0-9-]+/gm) ?? [name]).size;
    console.log(`REFUSED ${name}: ${error.message}\n`);
  }
}
console.log(`@parcha/agentrun-serve ${version}: parsed ${count.templates} templates, ${count.cases} cases; refused ${count.refusedTemplates} templates, ${count.refusedCases} cases`);
process.exit(count.refusedTemplates ? 1 : 0);
