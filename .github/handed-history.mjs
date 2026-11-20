// The run history an eval case's prompt ends with, made by AgentRun's own code. eval-template can't seed a previous
// run, so a case hands its run history in the prompt; for a case with a fixtures/last-run.json ({agentrun, run_id,
// ended_at, output}), the prompt's tail is what agentrun's previousResultOf hands a scheduled run whose trigger's last
// completed run ended with that output, its schema's x-carried read from the template's *.schema.json: whole, carried
// fields only, or carried fields less the oldest entries. It runs agentrun's built trigger-targets.js over a real
// sqlite store, the way agentrun's packages/serve/test/trigger-targets.test.mjs (handedAfter) does.
// Usage: node .github/handed-history.mjs <agentrun worktree, built> [--write]. Without --write it checks: exit 1 when
// the worktree is not at the commit a last-run.json names, or a prompt's tail differs from what that commit hands.
// --write records the worktree's commit in each last-run.json and rewrites each prompt's tail.
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const [root, flag] = process.argv.slice(2);
if (!root || (flag && flag !== "--write")) throw new Error("usage: node .github/handed-history.mjs <agentrun worktree, built> [--write]");
const write = flag === "--write";
const sha = execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const dist = (p) => pathToFileURL(join(root, "packages/serve/dist", p)).href;
const { openSqliteStore } = await import(dist("store/index.js"));
const { triggerTargets } = await import(dist("trigger-targets.js"));
const { readLaunchBody } = await import(dist("run-launch.js"));

// The handed text starts with one of these: the whole result, or its carried fields.
const STARTS = ["The result of this trigger's last completed run (", "The carried fields ("];

export async function handed({ runId, endedAt, output, carried }) {
  const dir = mkdtempSync(join(tmpdir(), "handed-"));
  const store = await openSqliteStore({ file: join(dir, "store.sqlite"), role: "server" });
  try {
    await store.agents.create({ id: "a1", name: "Agent one" }, { id: "r1", kind: "agentic", body: { instructions: "Answer." } });
    const revision = { id: "r1", agentId: "a1", kind: "agentic", body: { instructions: "Answer.", tools: [], skills: {} }, createdAt: 0 };
    const entry = { agent: { id: "a1", name: "Agent one", description: null, currentRevision: "r1", createdAt: 0, archivedAt: null }, revision, version: 1, revisions: 1, sizes: new Map() };
    await store.runs.create({ id: runId, agentId: "a1", revisionId: "r1" });
    await store.triggers.create({ id: "t1", agentId: "a1", name: "schedule", enabled: true, source: { kind: "schedule" }, target: { kind: "message_run", run_id: "run-1", input: { content: "hi" } }, nextAt: null, catchupWindowS: 3600 });
    await store.triggers.record("t1", [{ key: "f0", by: "schedule", nominalAt: 0, status: "due" }]);
    await store.triggers.settle("t1", "f0", { status: "started", runId });
    const deps = {
      start: {
        runBodyIssues: () => [], pinnedOf: async () => ({ revision, version: 1 }), inputIssuesOf: async () => [], explainRun: async (i) => i,
        told: (e) => e, runnable: async () => {}, readyFiles: async () => [], fallbackPlace: () => ({ mode: "runner" }),
        workflowTitle: (n) => `Workflow of ${n}`, serverSecrets: () => [], toolSettings: () => ({}), planeEnv: () => ({}),
        modelOf: () => ({ provider: "anthropic", modelId: "claude" }),
      },
      getAgent: async () => entry, needAgent: async () => entry,
      momentOf: async () => ({ id: "run-1", agentId: "a1", kind: "agentic", cancelled: false, terminal: false, working: true, awaitingAnswer: false, steers: true, live: true, paused: false, waitsOnPerson: false, maxCostUsd: 5 }),
      runStatus: async () => "working",
      completedOutput: async (id) => (id === runId ? { output, endedAt, ...(carried ? { carried } : {}) } : undefined),
    };
    const from = { kind: "trigger", trigger_id: "t1", source: "schedule", owner: true };
    const { run_id } = await triggerTargets(store, deps).start({ kind: "start_run", agent_id: "a1", input: { content: "Go." }, max_cost_usd: 1 }, { content: "Go." }, { id: "t1", firing_key: "f1" }, from, undefined, true);
    const content = readLaunchBody((await store.runs.launch(run_id)).body).input.content;
    if (!content.startsWith("Go.\n\n")) throw new Error("the run's own message is not first");
    return content.slice("Go.\n\n".length);
  } finally {
    await store.close().catch(() => undefined);
    rmSync(dir, { recursive: true, force: true });
  }
}

const dirs = (at) => (existsSync(at) ? readdirSync(at, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : []);
const templates = join(import.meta.dirname, "..", "templates");
const problems = [];
let cases = 0;
for (const name of dirs(templates)) {
  for (const c of dirs(join(templates, name, "evals"))) {
    const at = join(templates, name, "evals", c);
    if (!existsSync(join(at, "fixtures", "last-run.json"))) continue;
    cases++;
    const last = JSON.parse(readFileSync(join(at, "fixtures", "last-run.json"), "utf8"));
    const schemas = readdirSync(join(templates, name)).filter((f) => f.endsWith(".schema.json")).map((f) => JSON.parse(readFileSync(join(templates, name, f), "utf8")));
    const carried = schemas.find((s) => s["x-carried"])?.["x-carried"];
    const text = await handed({ runId: last.run_id, endedAt: last.ended_at, output: last.output, carried });
    const prompt = readFileSync(join(at, "prompt.md"), "utf8");
    const from = Math.max(...STARTS.map((s) => prompt.lastIndexOf(s)));
    if (write) {
      if (from < 0) throw new Error(`${name}/${c}: prompt.md has no run history to replace; end it with a line that starts "${STARTS[0]}"`);
      writeFileSync(join(at, "prompt.md"), prompt.slice(0, from) + text + (text.endsWith("\n") ? "" : "\n"));
      writeFileSync(join(at, "fixtures", "last-run.json"), JSON.stringify({ ...last, agentrun: sha }, null, 2) + "\n");
      console.log(`wrote ${name}/${c}: ${Buffer.byteLength(text)} B handed`);
    } else if (last.agentrun !== sha) problems.push(`${name}/${c}: last-run.json was handed by agentrun ${last.agentrun}, and the worktree is at ${sha}`);
    else if (prompt.slice(from).trimEnd() !== text.trimEnd()) problems.push(`${name}/${c}: prompt.md's run history differs from what agentrun ${sha} hands for last-run.json`);
    else console.log(`ok ${name}/${c}: ${Buffer.byteLength(text)} B handed`);
  }
}
for (const p of problems) console.log(`FAIL ${p}`);
console.log(`handed-history: ${cases} cases with a fixtures/last-run.json, ${problems.length} differ (agentrun ${sha})`);
process.exit(problems.length ? 1 : 0);
