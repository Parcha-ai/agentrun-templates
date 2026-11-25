#!/usr/bin/env node
// node .github/eval-checks/music-video-sent.mjs <report.json> [<the run's work folder or the serve's data folder>]
// (also: --report <report.json> [--work <folder>])
//
// A repo check beside serve's grade, and a stopgap: it goes away when a serve grader can compare a call to a run's file
// (agentrun #3824, tool_used args_file). README.md beside it says how to run it.
//
// A music-video eval run's stills and clips, as sent, against the records the template's kit wrote in the run's folder
// (media/stills.json and media/clips.json). A grader reads a run's calls cut to fit its prompt, so it reads the records
// instead; this check is what ties them to the calls. The sent calls are the fake fal's whole log, which serve keeps in
// the report as the run's mcp_calls, never the records' word for it. The report doesn't hold the run's files; they are
// in the serve's data folder, which the report names as server.data for a serve run in process: the run's folder is
// disk/agents/<the report's agent_id>-*/runs/<the report's run_id>/work in it, by exact ids. A second argument
// overrides it: the run's work folder itself, or a data folder.
//
// Passes when, for the stills and for the clips:
// - the record exists and holds the case's number of shots (first takes for the stills, at most two remakes), the
//   count the case's own grader (templates/music-video/evals/<case>/graders/clips-negative.md) holds, never the records;
// - every submit_job sent on the endpoint is in the record by its key, was sent once, and its arguments equal the
//   record's for that key, field by field;
// - every call in the record was sent;
// - the stills' fixed fields are one 1K png with no web search, and every clip carries no audio and the one exact
//   negative prompt;
// - each record has the kit's shape: only the kit's top-level fields, each_prompt the kit's exact template, its shared
//   fields (every_still, every_clip) only the kit's fields there, so none stands in for a field built per item, and its
//   items exactly the kit's fields (else a FAIL naming it);
// - each record is what the kit builds: rebuilt with the repo's own kit (never the run's copy, which the run can write)
//   from the run's film/plan.json, storyboard.md and media/run-keys.json, the remakes by the kit's rules and the clips
//   with the record's still URLs; the first field that differs fails, naming the shot.
// Prints one line: `SENT PASS n=<calls checked> (repo check; serve's grade is separate; stopgap for agentrun #3824)`
// (exit 0), `SENT FAIL <the first reason> [(and N more)] (...the same)` (exit 1), or `SENT VOID <why>` when it can't
// find its inputs or has nothing to check (exit 2: no verdict; a live run on real fal has no fake log).
// Node built-ins only, and the repo's own music-video kit (templates/music-video/skills/music-video/kit/beats.mjs).
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

const NANO = "fal-ai/nano-banana-pro";
const KLING = "fal-ai/kling-video/v3/pro/image-to-video";
const NEGATIVE = "text, letters, words, captions, subtitles, logo, watermark, signage, brand, real person, celebrity, blur, distortion, low quality";
const ENDING = "No text, no lettering, no logos.";
const EVALS = new URL("../../templates/music-video/evals/", import.meta.url).pathname;
// The kit itself, from this repo, never the copy in the run's folder (the run can write that one): the records are
// rebuilt with its own functions from the run's plan, storyboard and key stem.
const KIT = new URL("../../templates/music-video/skills/music-video/kit/beats.mjs", import.meta.url);

function voided(why) {
  console.log(`SENT VOID ${why}`);
  process.exit(2);
}
let kit;
try {
  kit = await import(KIT.href);
} catch (error) {
  voided(`the repo's music-video kit can't be loaded (${error.message.split("\n")[0]})`);
}
const USAGE = "usage: node .github/eval-checks/music-video-sent.mjs <report.json> [<the run's work folder or the serve's data folder>]";
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
if (report?.package?.name !== undefined && report.package.name !== "music-video") voided(`the report is of ${report.package.name}, not music-video`);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
if (!isObj(report) || !Array.isArray(report.cases) || !report.cases.every((c) => isObj(c) && Array.isArray(c.runs ?? []))) voided(`${reportPath} is not a serve eval report: no list of cases, each with a list of runs`);
const runs = report.cases.flatMap((c) => (c.runs ?? []).map((run) => ({ name: c.name, run })));
if (runs.length !== 1) voided(`the report holds ${runs.length} runs; this check takes a report of one run`);
const [{ name: caseName, run }] = runs;
if (!isObj(run)) voided("the report's run is not an object");
if (caseName === "live" || !Array.isArray(run.mcp_calls) || !run.mcp_calls.length) voided(`no fake log: live runs aren't checked (case ${caseName} has no mcp_calls in the report)`);
run.mcp_calls.forEach((c, i) => {
  if (!isObj(c) || typeof c.tool !== "string") voided(`the report's mcp_calls item ${i + 1} is not a call`);
});
const grader = join(EVALS, String(caseName), "graders", "clips-negative.md");
if (!existsSync(grader)) voided(`case ${caseName} has no clips-negative grader (templates/music-video/evals/${caseName}/graders/clips-negative.md): this check covers the fake-fal cases that make a film`);
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
if (where === undefined) where = report?.server?.data;
if (typeof where !== "string" || !where) voided("the report names no server.data folder: give the run's work folder or the serve's data folder");
if (!existsSync(where) || !statSync(where).isDirectory()) voided(`no folder at ${where}`);
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
  const sent = run.mcp_calls.filter((c) => c.tool === "mcp:fal/submit_job" && isObj(c.arguments) && c.arguments.endpoint_id === endpoint).map((c) => c.arguments);
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

// A record's shape, before anything in it is read: an object; its shared fields (`every`) an object holding only the
// fields the kit writes there, so none can stand in for a field built per item; its list (`list`) a list of items, each
// exactly the fields the kit writes. Returns why not, or undefined.
function misshapen(file, data, top, every, fields, list, item, itemShape) {
  if (!isObj(data)) return `media/${file} is not a JSON object`;
  const stray = Object.keys(data).find((k) => !top.includes(k));
  if (stray !== undefined) return `media/${file} has a field ${stray}; its fields are ${top.join(", ")}`;
  if (!isObj(data[every])) return `media/${file}'s ${every} is not an object`;
  const extra = Object.keys(data[every]).find((k) => !fields.includes(k));
  if (extra !== undefined) return `media/${file}'s ${every} has a field ${extra}; its fields are ${fields.join(", ")}`;
  if (!Array.isArray(data[list])) return `media/${file}'s ${list} is not a list`;
  const at = data[list].findIndex((x) => !isObj(x) || !item(x));
  if (at >= 0) return `media/${file}'s ${list} item ${at + 1} is not ${itemShape}`;
  return undefined;
}
const text = (v) => typeof v === "string" && v.length > 0;
// The kit's record rebuilt from the run's own plan, storyboard and key stem, against the record the run left: the first
// field that differs, naming the shot. `build` rebuilds it (the kit's errors are its words).
const FROM = "film/plan.json, storyboard.md and media/run-keys.json";
let stem;
function runStem() {
  if (stem !== undefined) return stem;
  const path = join(work, "media", "run-keys.json");
  if (!existsSync(path)) return (stem = { missing: "the run left no media/run-keys.json: its records can't be tied to the run's key stem" });
  try {
    const keys = JSON.parse(readFileSync(path, "utf8"));
    return (stem = typeof keys?.stem === "string" ? { stem: keys.stem } : { missing: "media/run-keys.json holds no stem" });
  } catch (error) {
    return (stem = { missing: `media/run-keys.json is not JSON: ${error.message}` });
  }
}
// Run only when the record passed its own checks: a record already failed needs no second reason.
function rebuilt(file, data, list, build, bad, before) {
  if (lines.length > before) return;
  const keys = runStem();
  if (keys.missing) return bad(keys.missing);
  let expected;
  try {
    expected = build(keys.stem);
  } catch (error) {
    return bad(error.what ?? `the kit can't rebuild media/${file} from the run's ${FROM}: ${error.message.split("\n")[0]}`);
  }
  for (const k of Object.keys(expected)) {
    if (k === list || isDeepStrictEqual(data[k], expected[k])) continue;
    return bad(`media/${file}'s ${k} is ${show(data[k])}; the kit builds ${show(expected[k])} from the run's ${FROM}`);
  }
  const want = expected[list], got = data[list];
  for (let i = 0; i < Math.max(want.length, got.length); i++) {
    const e = want[i], a = got[i];
    if (e === undefined) return bad(`media/${file} holds ${show(a)}, which the kit doesn't build from the run's ${FROM}`);
    if (a === undefined) return bad(`media/${file} has no ${e.remake ? "remake of " : ""}shot ${e.n}, which the kit builds from the run's ${FROM}`);
    const d = differs(a, e);
    if (d) return bad(`media/${file}'s ${e.remake ? "remake of " : ""}shot ${e.n} is not what the kit builds from ${FROM}: ${d.at} ${show(d.sent)}, the kit's ${show(d.recorded)}`);
  }
}
const only = (x, required, optional = []) => required.every((k) => k in x) && Object.keys(x).every((k) => required.includes(k) || optional.includes(k));

// ---------- stills ----------
{
  const { data, missing } = record("stills.json");
  if (missing) say(false, `stills: ${missing}`);
  else {
    const bad = (why) => say(false, `stills: ${why}`);
    const STILL_FIELDS = ["num_images", "aspect_ratio", "resolution", "output_format", "enable_web_search"];
    const still = (s) => only(s, ["n", "key", "picture"], ["remake"]) && Number.isSafeInteger(s.n) && text(s.key) && text(s.picture) && (s.remake === undefined || s.remake === true);
    const shape = misshapen("stills.json", data, ["endpoint_id", "style", "each_prompt", "every_still", "stills"], "every_still", STILL_FIELDS, "stills", still, "{n, key, picture[, remake]}");
    const EACH = `<style>. <picture>. ${ENDING}`;
    if (shape) bad(shape);
    else if (data.each_prompt !== EACH) bad(`media/stills.json's each_prompt is ${show(data.each_prompt)}, not ${show(EACH)}`);
    else checkStills(data, bad);
  }
}
function checkStills(data, bad) {
  const before = lines.length;
  const fixed = data.every_still;
  if (data.endpoint_id !== NANO) bad(`media/stills.json's endpoint_id is ${show(data.endpoint_id)}, not ${NANO}`);
  if (typeof data.style !== "string" || !data.style.trim()) bad("media/stills.json has no style");
  for (const [k, v] of Object.entries({ num_images: 1, resolution: "1K", output_format: "png", enable_web_search: false })) if (fixed[k] !== v) bad(`media/stills.json's ${k} is ${show(fixed[k])}, not ${show(v)}`);
  if (!["16:9", "9:16"].includes(fixed.aspect_ratio)) bad(`media/stills.json's aspect_ratio is ${show(fixed.aspect_ratio)}`);
  const list = data.stills;
  const firsts = list.filter((s) => !s.remake);
  const remakes = list.filter((s) => s.remake);
  if (firsts.length !== shots) bad(`media/stills.json holds ${firsts.length} first takes, the case ${shots} shots`);
  if (remakes.length > 2) bad(`media/stills.json holds ${remakes.length} remakes; two are the most a run makes`);
  const calls = new Map(list.map((s) => [s.key, { endpoint_id: data.endpoint_id, submission_key: s.key, input: { ...fixed, prompt: `${data.style}. ${s.picture}. ${ENDING}` } }]));
  if (calls.size !== list.length) bad("media/stills.json holds one key twice");
  compare("stills", "stills.json", NANO, calls);
  // The kit's first takes from the run's plan and storyboard, then each remake the record holds, by the kit's rules.
  rebuilt("stills.json", data, "stills", (stem) => {
    const expected = kit.buildStills(join(work, "film"), join(work, "storyboard.md"), stem);
    for (const s of data.stills.filter((t) => t.remake)) {
      try {
        kit.addRemake(expected, s.n, kit.tidy(s.picture), "media/stills.json");
      } catch (error) {
        throw Object.assign(error, { what: `media/stills.json's remake of shot ${s.n} is not one the kit makes: ${error.message}` });
      }
    }
    return expected;
  }, bad, before);
}

// ---------- clips ----------
{
  const { data, missing } = record("clips.json");
  if (missing) say(false, `clips: ${missing}`);
  else {
    const bad = (why) => say(false, `clips: ${why}`);
    const CLIP_FIELDS = ["generate_audio", "negative_prompt"];
    const clip = (c) => only(c, ["n", "key", "duration", "prompt", "start_image_url"]) && Number.isSafeInteger(c.n) && text(c.key) && text(c.duration) && text(c.prompt) && text(c.start_image_url);
    const shape = misshapen("clips.json", data, ["endpoint_id", "every_clip", "clips"], "every_clip", CLIP_FIELDS, "clips", clip, "{n, key, duration, prompt, start_image_url}");
    if (shape) bad(shape);
    else checkClips(data, bad);
  }
}
function checkClips(data, bad) {
  const before = lines.length;
  const every = data.every_clip;
  if (data.endpoint_id !== KLING) bad(`media/clips.json's endpoint_id is ${show(data.endpoint_id)}, not ${KLING}`);
  if (every.negative_prompt !== NEGATIVE) bad(`media/clips.json's negative_prompt is ${show(every.negative_prompt)}, not the one exact string`);
  if (every.generate_audio !== false) bad(`media/clips.json's generate_audio is ${show(every.generate_audio)}, not false`);
  const list = data.clips;
  if (list.length !== shots) bad(`media/clips.json holds ${list.length} clips, the case ${shots} shots`);
  const calls = new Map(list.map((c) => [c.key, { endpoint_id: data.endpoint_id, submission_key: c.key, input: { ...every, prompt: c.prompt, start_image_url: c.start_image_url, duration: c.duration } }]));
  if (calls.size !== list.length) bad("media/clips.json holds one key twice");
  compare("clips", "clips.json", KLING, calls);
  // The kit's clips from the run's plan and storyboard, with the still URLs the record holds (fal's, in shot order).
  rebuilt("clips.json", data, "clips", (stem) => kit.buildClips(join(work, "film"), join(work, "storyboard.md"), stem, data.clips.map((c) => c.start_image_url)), bad, before);
}

if (lines.length) {
  console.log(`SENT FAIL ${lines[0]}${lines.length > 1 ? ` (and ${lines.length - 1} more)` : ""} ${LABEL}`);
  process.exit(1);
}
console.log(`SENT PASS n=${checked} ${LABEL}`);
process.exit(0);
