#!/usr/bin/env node
// node .github/eval-checks/music-video-sent.mjs <report.json> <the run's work folder or the serve's data folder>
//
// A repo check beside serve's grade, and a stopgap: it goes away when a serve grader can compare a call to a run's file
// (agentrun #3824, tool_used args_file). README.md beside it says how to run it.
//
// A music-video eval run's stills and clips, as sent, against the records the template's kit wrote in the run's folder
// (media/stills.json and media/clips.json). A grader reads a run's calls cut to fit its prompt, so it reads the records
// instead; this check is what ties them to the calls. The sent calls are the fake fal's whole log, which serve keeps in
// the report as the run's mcp_calls, never the records' word for it. The report doesn't hold the run's files, so the
// second argument names where they are: the run's work folder itself, or a serve's data folder, in which the folder is
// disk/agents/<the report's agent_id>-*/runs/<the report's run_id>/work.
//
// Passes when, for the stills and for the clips:
// - the record exists and holds the case's number of shots (first takes for the stills, at most two remakes), the
//   count the case's own clips grader (templates/music-video/evals/<case>/graders/clips.md) holds;
// - every submit_job sent on the endpoint is in the record by its key, was sent once, and its arguments equal the
//   record's for that key, field by field;
// - every call in the record was sent;
// - the stills' fixed fields are one 1K png with no web search, and every clip carries no audio and the one exact
//   negative prompt.
// Prints one line: `SENT PASS n=<calls checked> (repo check; serve's grade is separate)` (exit 0), `SENT FAIL <the first
// reason> [(and N more)]` (exit 1), or `SENT VOID <why>` when it can't find its inputs (exit 2: no verdict).
// Node built-ins only.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

const NANO = "fal-ai/nano-banana-pro";
const KLING = "fal-ai/kling-video/v3/pro/image-to-video";
const NEGATIVE = "text, letters, words, captions, subtitles, logo, watermark, signage, brand, real person, celebrity, blur, distortion, low quality";
const ENDING = "No text, no lettering, no logos.";
const EVALS = new URL("../../templates/music-video/evals/", import.meta.url).pathname;

function voided(why) {
  console.log(`SENT VOID ${why}`);
  process.exit(2);
}
const [reportPath, where, ...extra] = process.argv.slice(2);
if (!reportPath || !where || extra.length) voided("usage: node .github/eval-checks/music-video-sent.mjs <report.json> <the run's work folder or the serve's data folder>");
if (!existsSync(reportPath)) voided(`no report at ${reportPath}`);
if (!existsSync(where) || !statSync(where).isDirectory()) voided(`no folder at ${where}`);
let report;
try {
  report = JSON.parse(readFileSync(reportPath, "utf8"));
} catch (error) {
  voided(`${reportPath} is not JSON: ${error.message}`);
}
if (report?.package?.name !== undefined && report.package.name !== "music-video") voided(`the report is of ${report.package.name}, not music-video`);
const runs = (report?.cases ?? []).flatMap((c) => (c.runs ?? []).map((run) => ({ name: c.name, run })));
if (runs.length !== 1) voided(`the report holds ${runs.length} runs; this check takes a report of one run`);
const [{ name: caseName, run }] = runs;
if (!Array.isArray(run.mcp_calls)) voided("the run has no mcp_calls (the fake fal's log) in the report");
const grader = join(EVALS, String(caseName), "graders", "clips.md");
if (!existsSync(grader)) voided(`case ${caseName} has no clips grader (templates/music-video/evals/${caseName}/graders/clips.md): this check covers the fake-fal cases that make a film`);
const shots = Number(readFileSync(grader, "utf8").match(/^count:\s*(\d+)\s*$/m)?.[1]);
if (!Number.isSafeInteger(shots) || shots < 1) voided(`${grader} holds no count of clips`);
// The run's work folder: the folder given, when it holds media/; else the run's folder inside a serve's data folder.
function workFolder() {
  if (existsSync(join(where, "media"))) return where;
  const agents = join(where, "disk", "agents");
  const found = existsSync(agents)
    ? readdirSync(agents).filter((a) => run.agent_id && a.startsWith(`${run.agent_id}-`)).map((a) => join(agents, a, "runs", String(run.run_id), "work")).filter((w) => existsSync(w))
    : [];
  if (found.length === 1) return found[0];
  voided(`${where} holds no media/ and no disk/agents/<agent>/runs/${run.run_id}/work${found.length > 1 ? ` (it holds ${found.length})` : ""}`);
}
const work = workFolder();

const lines = [];
let checked = 0;
const say = (ok, what) => {
  if (!ok) lines.push(what);
};
const show = (v) => (v === undefined ? "nothing" : JSON.stringify(v));

// The first field where two argument objects differ, as a dotted path (undefined when equal).
function differs(sent, recorded, at = "") {
  if (isDeepStrictEqual(sent, recorded)) return undefined;
  const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  if (isObj(sent) && isObj(recorded)) {
    for (const key of new Set([...Object.keys(recorded), ...Object.keys(sent)])) {
      const d = differs(sent[key], recorded[key], at ? `${at}.${key}` : key);
      if (d) return d;
    }
  }
  return { at, sent, recorded };
}

function record(name) {
  const path = join(work, "media", name);
  if (!existsSync(path)) return { missing: `the run left no media/${name}` };
  try {
    return { data: JSON.parse(readFileSync(path, "utf8")) };
  } catch (error) {
    return { missing: `media/${name} is not JSON: ${error.message}` };
  }
}

// Every submit_job sent on `endpoint` against `calls` (key -> recorded arguments).
function compare(kind, file, endpoint, calls) {
  const sent = run.mcp_calls.filter((c) => c.tool === "mcp:fal/submit_job" && c.arguments?.endpoint_id === endpoint).map((c) => c.arguments);
  checked += sent.length;
  const seen = new Map();
  for (const a of sent) {
    const key = a.submission_key;
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if (seen.get(key) === 2) say(false, `${kind}: ${key} was sent ${sent.filter((b) => b.submission_key === key).length} times`);
    if (seen.get(key) > 1) continue;
    if (!calls.has(key)) {
      say(false, `${kind}: ${key} was sent and is not in media/${file}`);
      continue;
    }
    const d = differs(a, calls.get(key));
    if (d) say(false, `${kind}: ${key} was sent with ${d.at} ${show(d.sent)}; media/${file} has ${show(d.recorded)}`);
  }
  for (const key of calls.keys()) if (!seen.has(key)) say(false, `${kind}: ${key} is in media/${file} and was never sent`);
}

// ---------- stills ----------
{
  const { data, missing } = record("stills.json");
  if (missing) say(false, `stills: ${missing}`);
  else {
    const bad = (why) => say(false, `stills: ${why}`);
    const fixed = data.every_still ?? {};
    if (data.endpoint_id !== NANO) bad(`media/stills.json's endpoint_id is ${show(data.endpoint_id)}, not ${NANO}`);
    if (typeof data.style !== "string" || !data.style.trim()) bad("media/stills.json has no style");
    for (const [k, v] of Object.entries({ num_images: 1, resolution: "1K", output_format: "png", enable_web_search: false })) if (fixed[k] !== v) bad(`media/stills.json's ${k} is ${show(fixed[k])}, not ${show(v)}`);
    if (!["16:9", "9:16"].includes(fixed.aspect_ratio)) bad(`media/stills.json's aspect_ratio is ${show(fixed.aspect_ratio)}`);
    const list = Array.isArray(data.stills) ? data.stills : [];
    const firsts = list.filter((s) => !s.remake);
    const remakes = list.filter((s) => s.remake);
    if (firsts.length !== shots) bad(`media/stills.json holds ${firsts.length} first takes, the case ${shots} shots`);
    if (remakes.length > 2) bad(`media/stills.json holds ${remakes.length} remakes; two are the most a run makes`);
    const calls = new Map(list.map((s) => [s.key, { endpoint_id: data.endpoint_id, submission_key: s.key, input: { prompt: `${data.style}. ${s.picture}. ${ENDING}`, ...fixed } }]));
    if (calls.size !== list.length) bad("media/stills.json holds one key twice");
    compare("stills", "stills.json", NANO, calls);
  }
}

// ---------- clips ----------
{
  const { data, missing } = record("clips.json");
  if (missing) say(false, `clips: ${missing}`);
  else {
    const bad = (why) => say(false, `clips: ${why}`);
    const every = data.every_clip ?? {};
    if (data.endpoint_id !== KLING) bad(`media/clips.json's endpoint_id is ${show(data.endpoint_id)}, not ${KLING}`);
    if (every.negative_prompt !== NEGATIVE) bad(`media/clips.json's negative_prompt is ${show(every.negative_prompt)}, not the one exact string`);
    if (every.generate_audio !== false) bad(`media/clips.json's generate_audio is ${show(every.generate_audio)}, not false`);
    const list = Array.isArray(data.clips) ? data.clips : [];
    if (list.length !== shots) bad(`media/clips.json holds ${list.length} clips, the case ${shots} shots`);
    const calls = new Map(list.map((c) => [c.key, { endpoint_id: data.endpoint_id, submission_key: c.key, input: { prompt: c.prompt, start_image_url: c.start_image_url, duration: c.duration, ...every } }]));
    if (calls.size !== list.length) bad("media/clips.json holds one key twice");
    compare("clips", "clips.json", KLING, calls);
  }
}

if (lines.length) {
  console.log(`SENT FAIL ${lines[0]}${lines.length > 1 ? ` (and ${lines.length - 1} more)` : ""}`);
  process.exit(1);
}
console.log(`SENT PASS n=${checked} (repo check; serve's grade is separate)`);
process.exit(0);
