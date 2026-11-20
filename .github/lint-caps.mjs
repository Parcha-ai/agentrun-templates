// Every template's own cap (budget.per_run_usd) checked against what one step and an answer cost on each harness it
// lists, as the AgentRun server warns when an agent is saved (cap-short.js capShortOf). A cap below that makes every run
// wrap up, or pause, at its first tool call. Nothing runs: no model, no key, no spend.
// The model priced is the one the template was measured on (measured.json `model`), by the route it was measured on and
// by its provider's own route (openrouter/openai/x is also priced as openai/x), since an install may serve either, and the
// harnesses differ: a CLI harness sends a much larger first request than pi.
// Usage: node .github/lint-caps.mjs <folder @parcha/agentrun-serve is installed in>. Exit 1 on any cap below its need.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

if (!process.argv[2]) throw new Error("usage: node .github/lint-caps.mjs <folder @parcha/agentrun-serve is installed in>");
const pkgJson = createRequire(join(process.argv[2], "x.js")).resolve("@parcha/agentrun-serve/package.json");
const { version } = (await import(pathToFileURL(pkgJson), { with: { type: "json" } })).default;
const dist = join(dirname(pkgJson), "dist");
const { readPackage } = await import(pathToFileURL(join(dist, "templates.js")));
const { capShortOf } = await import(pathToFileURL(join(dist, "cap-short.js")));

// Placeholder keys name each provider so its route resolves; nothing is sent anywhere.
const env = { ...process.env, OPENAI_API_KEY: "placeholder", ANTHROPIC_API_KEY: "placeholder", OPENROUTER_API_KEY: "placeholder" };
const routes = (model) => {
  const direct = model.replace(/^openrouter\//, "");
  return [...new Set([model, direct])];
};
const root = join(import.meta.dirname, "..", "templates");
const names = readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
const count = { templates: 0, checked: 0, short: 0 };
for (const name of names) {
  count.templates++;
  const dir = join(root, name);
  const measuredAt = join(dir, "measured.json");
  if (!existsSync(measuredAt)) continue;
  const model = JSON.parse(readFileSync(measuredAt, "utf8")).model;
  const p = readPackage(dir, { evalFixtures: false });
  const cap = p.budget?.per_run_usd;
  if (typeof cap !== "number" || typeof model !== "string" || /:free$/.test(model)) continue;
  const harnesses = Array.isArray(p.harness) ? p.harness : p.harness ? [p.harness] : ["pi"];
  for (const harness of harnesses) {
    for (const route of routes(model)) {
      count.checked++;
      const warning = await capShortOf(env, harness, { model: route, instructions: p.instructions, thinking: p.effort }, cap);
      if (warning) {
        count.short++;
        console.log(`SHORT ${name} (${harness}, ${route}): ${warning}`);
      }
    }
  }
}
console.log(`@parcha/agentrun-serve ${version}: checked ${count.checked} harness and model pairs in ${count.templates} templates; ${count.short} caps below one step and an answer`);
process.exit(count.short ? 1 : 0);
