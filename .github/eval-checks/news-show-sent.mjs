#!/usr/bin/env node
// node .github/eval-checks/news-show-sent.mjs <report.json> [<the run's work folder or the serve's data folder>]
// (also: --report <report.json> [--work <folder>])
//
// A repo check beside serve's grade, and a stopgap: it goes away when a serve grader can compare a call to what fal
// answered it, whole (agentrun #3824). README.md beside it says how to run it.
//
// A news-show eval run, against what fal answered it. A grader reads a run's calls cut to fit its prompt: fal's answers
// (each job's handles) and the contents of long writes are what a cut takes, so a rubric condition that compares a read
// to an answer, or says what no write holds, fails on content it never saw. This check holds those parts, from the
// report's whole call log and the run's own files:
// - writes: no `write` or `edit` holds fal's timestamp chunks (character_start_times_seconds or
//   character_end_times_seconds), names a `*-timestamps.json` or touches film/captions-source.json (only the build
//   writes it);
// - reads (the fake-fal cases whose rubric compared a read to its answer): every job a wait_for_jobs lists is one fal
//   answered the run with handles (a submit_job or a get_submission), listed after that answer, with its own
//   request_id, and its status_url and response_url, when given, exactly as answered; no submission_key is sent again
//   once fal holds its job (an earlier send answered handles, or fal's get_submission finds it);
// - show-from-feed's grouped read: the first ten submit_jobs are the nine voices in segment order then the still, with
//   no other call of the run's between them (a get_pricing with a single endpoint_id just before an endpoint's first
//   submit_job is the server's spend meter, not counted); then one wait_for_jobs, the only one that reads any of the
//   ten, lists the ten at indexes 0-9 in that order, each with its own request_id, status_url and response_url;
// - captions: film/captions-source.json, read whole from the run's folder, has one entry per voice the run sent, and
//   each entry's request_id is the request fal answered that segment's eleven-v3 voice with, a request that completed.
// fal's answers come from the case's own fake in this repo (templates/news-show/evals/<case>/fixtures/fal-mcp.json),
// whole; the calls the fake got are the report's mcp_calls. A live case has no fake: its fal calls are the report's
// calls, its answers their results (a submit_job's answer is short and reaches the report whole; one that doesn't read
// as JSON gave no handles), and a request completed when the run filed it at evidence/fal/<request_id>.json.
// Prints one line: `SENT PASS n=<calls checked> (...)` (exit 0), `SENT FAIL <the first reason> [(and N more)] (...)`
// (exit 1), or `SENT VOID <why>` when it can't find its inputs or holds nothing for the case (exit 2: no verdict).
// Node built-ins only.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

const VOICE = "fal-ai/elevenlabs/tts/eleven-v3";
const STILL = "fal-ai/nano-banana-pro";
const SEGMENTS = ["cold-open", "headlines", "lead-a", "story-a", "lead-b", "story-b", "lead-c", "story-c", "closing"];
// What each case's rubric held before it moved here. writes and captions: captions-from-fal.md (each case); reads:
// the handles of pipeline.md (show-from-feed, owner-anchor-processing) and lost-reply.md; grouped: show-from-feed's
// pipeline.md condition 3.
const CASES = {
  "show-from-feed": { writes: true, captions: true, reads: true, grouped: true },
  "owner-anchor-processing": { writes: true, captions: true, reads: true },
  "lost-reply-same-key": { writes: true, captions: true, reads: true },
  "live-language-releases": { writes: true, captions: true },
};
const EVALS = new URL("../../templates/news-show/evals/", import.meta.url).pathname;

function voided(why) {
  console.log(`SENT VOID ${why}`);
  process.exit(2);
}
const USAGE = "usage: node .github/eval-checks/news-show-sent.mjs <report.json> [<the run's work folder or the serve's data folder>]";
const LABEL = "(repo check; serve's grade is separate; stopgap for agentrun #3824)";
const argv = process.argv.slice(2);
const named = {};
const plain = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--report" || argv[i] === "--work") {
    if (argv[i + 1] === undefined) voided(USAGE);
    named[argv[i].slice(2)] = argv[++i];
  } else if (argv[i].startsWith("--")) voided(`${USAGE} (unknown option ${argv[i]})`);
  else plain.push(argv[i]);
}
const reportPath = named.report ?? plain.shift();
let where = named.work ?? plain.shift();
if (!reportPath || plain.length) voided(USAGE);
if (!existsSync(reportPath)) voided(`no report at ${reportPath}`);
let report;
try {
  report = JSON.parse(readFileSync(reportPath, "utf8"));
} catch (error) {
  voided(`${reportPath} is not JSON: ${error.message}`);
}
if (report?.package?.name !== undefined && report.package.name !== "news-show") voided(`the report is of ${report.package.name}, not news-show`);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
if (!isObj(report) || !Array.isArray(report.cases) || !report.cases.every((c) => isObj(c) && Array.isArray(c.runs ?? []))) voided(`${reportPath} is not a serve eval report: no list of cases, each with a list of runs`);
const runs = report.cases.flatMap((c) => (c.runs ?? []).map((run) => ({ name: c.name, run })));
if (!runs.length) voided("the report holds no runs");
const caseName = runs[0].name;
if (runs.some((r) => r.name !== caseName)) voided("the report holds runs of more than one case; this check takes the runs of one case");
const rules = CASES[caseName];
if (rules === undefined) voided(`the check holds nothing for case ${caseName} (CASES in ${new URL(import.meta.url).pathname})`);
const FAKE = join(EVALS, String(caseName), "fixtures", "fal-mcp.json");
const live = !existsSync(FAKE);
if (live && rules.reads) voided(`case ${caseName} has no fake fal (templates/news-show/evals/${caseName}/fixtures/fal-mcp.json)`);
runs.forEach(({ run }, r) => {
  const which = runs.length > 1 ? `run ${r + 1}'s ` : "";
  if (!isObj(run)) voided(`the report's ${which || "run "}is not an object`);
  if (!Array.isArray(run.calls)) voided(`the report holds no ${which}calls list`);
  if (!live && (!Array.isArray(run.mcp_calls) || !run.mcp_calls.length)) voided(`no fake log: case ${caseName} has no ${which}mcp_calls in the report`);
  for (const [list, name] of [[run.calls, "calls"], [live ? [] : run.mcp_calls, "mcp_calls"]]) {
    list.forEach((c, i) => {
      if (!isObj(c) || typeof c.tool !== "string") voided(`the report's ${which}${name} item ${i + 1} is not a call`);
    });
  }
});

// ---------- fal's answers ----------
// A fixture case: the case's own fake, whole. Each tool's answer to its arguments is the first whose when matches them,
// as the fake picks (a when lists the argument fields it holds; a {"$pattern": ...} value matches a whole string).
let tools = {};
if (!live) {
  try {
    tools = JSON.parse(readFileSync(FAKE, "utf8")).tools;
  } catch (error) {
    voided(`the case's fake fal (${FAKE}) can't be read: ${error.message.split("\n")[0]}`);
  }
  if (!isObj(tools)) voided(`the case's fake fal (${FAKE}) holds no tools`);
}
const fakeText = (answer) => {
  try {
    const j = JSON.parse(answer?.result?.content?.[0]?.text ?? "null");
    return isObj(j) && !answer.result.isError ? j : undefined;
  } catch {
    return undefined;
  }
};
const matches = (want, got) => (isObj(want) && typeof want.$pattern === "string" ? typeof got === "string" && new RegExp(`^(?:${want.$pattern})$`).test(got) : isDeepStrictEqual(want, got));
const fakeAnswer = (tool, args) => fakeText((tools[tool]?.answers ?? []).find((a) => [a.when].flat().some((w) => isObj(w) && Object.entries(w).every(([k, v]) => matches(v, args[k])))));
// The requests the fake's reads answer completed.
const completedInFake = new Set();
for (const a of tools.wait_for_jobs?.answers ?? []) {
  for (const job of fakeText(a)?.jobs ?? []) if (isObj(job) && job.outcome === "completed" && typeof job.request_id === "string") completedInFake.add(job.request_id);
}

// ---------- each run ----------
if (where === undefined) where = report?.server?.data;
if (typeof where !== "string" || !where) voided("the report names no server.data folder: give the run's work folder or the serve's data folder");
if (!existsSync(where) || !statSync(where).isDirectory()) voided(`no folder at ${where}`);
const isWork = (dir) => existsSync(join(dir, "media")) || existsSync(join(dir, "film"));
if (isWork(where) && runs.length > 1) voided(`${where} is one run's work folder, and the report holds ${runs.length} runs: give the serve's data folder`);
function workFolder(run) {
  if (isWork(where)) return where;
  const agents = join(where, "disk", "agents");
  const found = existsSync(agents)
    ? readdirSync(agents).filter((a) => run.agent_id && a.startsWith(`${run.agent_id}-`)).map((a) => join(agents, a, "runs", String(run.run_id), "work")).filter((w) => existsSync(w))
    : [];
  if (found.length === 1) return found[0];
  voided(`${where} holds no media/ or film/ and no disk/agents/<agent>/runs/${run.run_id}/work${found.length > 1 ? ` (it holds ${found.length})` : ""}`);
}
const works = runs.map(({ run }) => workFolder(run));

const lines = [];
const show = (v) => (v === undefined ? "nothing" : JSON.stringify(v));
let checked = 0;
runs.forEach(({ run }, r) => checkRun(run, works[r], runs.length > 1 ? `run ${r + 1}: ` : ""));

function checkRun(run, work, which) {
  const say = (what) => lines.push(which + what);
  const own = run.calls.map((c, at) => ({ at, tool: c.tool, args: isObj(c.arguments) ? c.arguments : {}, result: c.result }));
  const falLog = live ? own.filter((c) => c.tool.startsWith("mcp:fal/")) : run.mcp_calls.map((c, at) => ({ at, tool: c.tool, args: isObj(c.arguments) ? c.arguments : {} }));
  const fal = falLog.map((c) => ({ ...c, tool: c.tool.replace(/^mcp:fal\//, "") }));
  checked += own.length + (live ? 0 : fal.length);
  const of = (tool) => fal.filter((c) => c.tool === tool);
  const step = (key) => (typeof key === "string" ? key.match(/^ns-[a-z0-9]{8}-(.+)$/)?.[1] : undefined);
  // fal's answer to a call: the fake's, or on a live run the call's own result.
  const answerOf = (c) => {
    if (!live) return fakeAnswer(c.tool, c.args);
    if (typeof c.result !== "string") return isObj(c.result) ? c.result : undefined;
    try {
      const j = JSON.parse(c.result);
      return isObj(j) ? j : undefined;
    } catch {
      return undefined;
    }
  };

  // ---------- writes ----------
  for (const c of own.filter((c) => c.tool === "write" || c.tool === "edit")) {
    const path = c.args.path ?? c.args.file_path;
    const { path: _p, file_path: _f, ...rest } = c.args;
    if (typeof path === "string" && /(^|\/)film\/captions-source\.json$/.test(path)) say(`writes: a ${c.tool} touches ${path} (only the build writes it)`);
    if (typeof path === "string" && /-timestamps\.json$/.test(path)) say(`writes: a ${c.tool} names ${path}, a timestamps file`);
    if (/character_(start|end)_times_seconds/.test(JSON.stringify(rest))) say(`writes: the ${c.tool} of ${show(path)} holds fal's timestamp chunks`);
  }

  // Every job fal answered the run with handles: its submit_jobs' and get_submissions' answers.
  const HANDLES = ["request_id", "status_url", "response_url"];
  const handles = (j) => (isObj(j) && HANDLES.every((f) => typeof j[f] === "string") ? j : undefined);
  const jobs = [];
  for (const c of [...of("submit_job"), ...of("get_submission")]) {
    const h = handles(answerOf(c));
    if (h) jobs.push({ at: c.at, by: c.tool, key: c.args.submission_key, endpoint: c.args.endpoint_id, h });
  }
  jobs.sort((a, b) => a.at - b.at);
  const listed = (c) => (Array.isArray(c.args.jobs) ? c.args.jobs.filter(isObj) : []);
  const reads = of("wait_for_jobs");

  // ---------- reads ----------
  if (rules.reads) {
    const bad = (why) => say(`read: ${why}`);
    // A key sent again once fal holds its job: an earlier send was answered with handles, or fal's get_submission
    // finds it (the run's own get_submission, or on the fake the answer it gives that key).
    const held = new Set();
    for (const c of fal) {
      const k = c.args.submission_key;
      if (c.tool === "submit_job" && held.has(k)) bad(`${k} was sent again after fal held its job`);
      if ((c.tool === "submit_job" || c.tool === "get_submission") && handles(answerOf(c))) held.add(k);
      if (c.tool === "submit_job" && !live && handles(fakeAnswer("get_submission", { submission_key: k }))) held.add(k);
    }
    const jobOf = (j) => jobs.find((k) => HANDLES.some((f) => j[f] === k.h[f]));
    for (const c of reads) {
      for (const j of listed(c)) {
        const job = jobOf(j);
        if (!job) {
          bad(`a wait_for_jobs lists request ${show(j.request_id)}, which no submit_job or get_submission was answered with`);
          continue;
        }
        if (job.at > c.at) bad(`a wait_for_jobs lists ${job.key} (request ${job.h.request_id}) before the ${job.by} that answered it`);
        if (j.request_id !== job.h.request_id) bad(`a wait_for_jobs reads ${job.key} with request_id ${show(j.request_id)}, not ${show(job.h.request_id)} as its ${job.by} answered`);
        for (const f of ["status_url", "response_url"]) if (j[f] !== undefined && j[f] !== job.h[f]) bad(`a wait_for_jobs reads ${job.key} with its ${f} ${show(j[f])}, not ${show(job.h[f])} as its ${job.by} answered`);
      }
    }
  }

  // ---------- show-from-feed's grouped read ----------
  if (rules.grouped) {
    const bad = (why) => say(`grouped read: ${why}`);
    const want = [...SEGMENTS.map((s) => [VOICE, `voice-${s}`]), [STILL, "anchor-image"]];
    const subs = of("submit_job");
    const ten = subs.slice(0, 10);
    const off = want.findIndex(([e, s], i) => !ten[i] || ten[i].args.endpoint_id !== e || step(ten[i].args.submission_key) !== s);
    if (off >= 0) bad(`the first ten submit_jobs are not the nine voices in segment order then the still: submit_job ${off + 1} is ${ten[off] ? `${show(ten[off].args.submission_key)} on ${show(ten[off].args.endpoint_id)}` : "not sent"}, not ${want[off][1]} on ${want[off][0]}`);
    else {
      // No other call of the run's between the ten, in the run's own calls.
      const mine = own.filter((c) => c.tool === "mcp:fal/submit_job");
      const at = ten.map((t) => mine.find((m) => m.args.submission_key === t.args.submission_key)?.at);
      if (at.some((a) => a === undefined)) bad("the run's calls list lacks one of the ten submit_jobs the fake got");
      else {
        const firstOn = new Map();
        for (const m of mine) if (!firstOn.has(m.args.endpoint_id)) firstOn.set(m.args.endpoint_id, m.at);
        for (const c of own.slice(at[0] + 1, at[9])) {
          if (c.tool === "mcp:fal/submit_job") continue;
          const next = own[c.at + 1];
          const meter = c.tool === "mcp:fal/get_pricing" && typeof c.args.endpoint_id === "string" && c.args.endpoint_ids === undefined && next?.tool === "mcp:fal/submit_job" && next.args.endpoint_id === c.args.endpoint_id && firstOn.get(c.args.endpoint_id) === next.at;
          if (!meter) {
            bad(`a ${c.tool} call comes between the ten submit_jobs`);
            break;
          }
        }
      }
      const tenJobs = ten.map((t) => jobs.find((j) => j.by === "submit_job" && j.at === t.at));
      const ids = new Set(tenJobs.filter(Boolean).map((j) => j.h.request_id));
      const readsTen = reads.filter((c) => listed(c).some((j) => ids.has(j.request_id)));
      const next = reads.find((c) => c.at > ten[9].at);
      if (readsTen.length !== 1) bad(`${readsTen.length} wait_for_jobs calls read the voices and the still; one does`);
      if (!next) bad("no wait_for_jobs follows the ten submit_jobs");
      else {
        const items = listed(next);
        if (items.length !== 10) bad(`the wait_for_jobs after the ten lists ${items.length} jobs, not the ten`);
        tenJobs.forEach((job, i) => {
          const j = items[i];
          if (!job || !j) return;
          if (j.index !== i) bad(`the wait_for_jobs after the ten lists ${want[i][1]} at index ${show(j.index)}, not ${i}`);
          for (const f of HANDLES) if (j[f] !== job.h[f]) bad(`the wait_for_jobs after the ten lists, at position ${i + 1}, ${f} ${show(j[f])}, not ${want[i][1]}'s ${show(job.h[f])}`);
        });
      }
    }
  }

  // ---------- captions ----------
  if (rules.captions) {
    const bad = (why) => say(`captions: ${why}`);
    const path = join(work, "film", "captions-source.json");
    let source;
    if (!existsSync(path)) bad("the run left no film/captions-source.json");
    else {
      try {
        source = JSON.parse(readFileSync(path, "utf8"));
      } catch (error) {
        bad(`film/captions-source.json is not JSON: ${error.message}`);
      }
      if (source !== undefined && !isObj(source)) {
        bad("film/captions-source.json is not an object of segments");
        source = undefined;
      }
    }
    if (source) {
      // Each segment's voice: the eleven-v3 submit_job of its key, and the request fal answered that key with (the
      // submit_job's answer, or get_submission's after a lost reply).
      const sent = SEGMENTS.filter((s) => of("submit_job").some((c) => c.args.endpoint_id === VOICE && step(c.args.submission_key) === `voice-${s}`));
      const requestOf = (s) => jobs.find((j) => j.endpoint !== STILL && step(j.key) === `voice-${s}`)?.h.request_id;
      for (const s of Object.keys(source)) if (!sent.includes(s)) bad(`film/captions-source.json has ${show(s)}, a segment the run sent no voice for`);
      for (const s of sent) {
        const entry = source[s];
        const want = requestOf(s);
        if (entry === undefined) bad(`film/captions-source.json has no ${s}`);
        else if (!isObj(entry) || entry.request_id !== want) bad(`film/captions-source.json gives ${s} request_id ${show(entry?.request_id)}, not ${show(want)}, the request fal answered its voice with`);
        else if (live ? !existsSync(join(work, "evidence", "fal", `${want}.json`)) : !completedInFake.has(want)) bad(`${s}'s request ${want} did not complete${live ? " (the run filed no evidence/fal/<request_id>.json for it)" : " on the fake"}`);
      }
    }
  }
}

if (lines.length) {
  console.log(`SENT FAIL ${lines[0]}${lines.length > 1 ? ` (and ${lines.length - 1} more)` : ""} ${LABEL}`);
  process.exit(1);
}
console.log(`SENT PASS n=${checked} ${LABEL}`);
process.exit(0);
