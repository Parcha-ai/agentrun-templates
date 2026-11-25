#!/usr/bin/env node
// music-video-check-sent.mjs --report <eval report.json> --case <name> [--run <n>] --work <run's work folder> --shots <n>
//
// A music-video eval run's stills and clips, as sent, against the records the template's kit wrote in the run's folder
// (media/stills.json and media/clips.json). A grader reads a run's calls cut to fit its prompt, so it reads the records
// instead; this check is what ties them to the calls. The sent calls are the fake fal's whole log (the report's
// mcp_calls for the run), never the records' word for it.
//
// Passes when, for the stills and for the clips:
// - the record exists and holds the case's number of shots (first takes for the stills, at most two remakes);
// - every submit_job sent on the endpoint is in the record by its key, was sent once, and its arguments equal the
//   record's for that key, field by field;
// - every call in the record was sent;
// - the stills' fixed fields are one 1K png with no web search, and every clip carries no audio and the one exact
//   negative prompt.
// Prints one PASS or FAIL line per finding and RESULT PASS or RESULT FAIL; exits 0, 1 (a failure) or 2 (bad arguments).
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

const NANO = "fal-ai/nano-banana-pro";
const KLING = "fal-ai/kling-video/v3/pro/image-to-video";
const NEGATIVE = "text, letters, words, captions, subtitles, logo, watermark, signage, brand, real person, celebrity, blur, distortion, low quality";
const ENDING = "No text, no lettering, no logos.";

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 2) {
  if (!argv[i].startsWith("--") || argv[i + 1] === undefined) usage(`unexpected argument ${argv[i]}`);
  args[argv[i].slice(2)] = argv[i + 1];
}
function usage(why) {
  console.error(`${why}\nusage: music-video-check-sent.mjs --report <report.json> --case <name> [--run <n>] --work <dir> --shots <n>`);
  process.exit(2);
}
for (const name of ["report", "case", "work", "shots"]) if (args[name] === undefined) usage(`--${name} is missing`);
const shots = Number(args.shots);
if (!Number.isSafeInteger(shots) || shots < 1) usage("--shots is the case's number of shots");
const report = JSON.parse(readFileSync(args.report, "utf8"));
const one = report.cases?.find((c) => c.name === args.case);
if (!one) usage(`the report has no case ${args.case}`);
const run = args.run === undefined ? one.runs?.[0] : one.runs?.find((r) => String(r.run) === args.run);
if (!run || !Array.isArray(run.mcp_calls)) usage(`the report has no run ${args.run ?? "(first)"} of ${args.case} with mcp_calls`);

const lines = [];
let failed = false;
const say = (ok, what) => {
  if (!ok) failed = true;
  lines.push(`${ok ? "PASS" : "FAIL"} ${what}`);
};
const show = (v) => (v === undefined ? "nothing" : typeof v === "string" ? JSON.stringify(v) : JSON.stringify(v));

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
  const path = join(args.work, "media", name);
  if (!existsSync(path)) return { missing: `the run left no media/${name}` };
  try {
    return { data: JSON.parse(readFileSync(path, "utf8")) };
  } catch (error) {
    return { missing: `media/${name} is not JSON: ${error.message}` };
  }
}

// Every submit_job sent on `endpoint` against `calls` (key -> recorded arguments). Returns the number sent.
function compare(kind, file, endpoint, calls) {
  const sent = run.mcp_calls.filter((c) => c.tool === "mcp:fal/submit_job" && c.arguments?.endpoint_id === endpoint).map((c) => c.arguments);
  const seen = new Map();
  let ok = true;
  for (const a of sent) {
    const key = a.submission_key;
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if (seen.get(key) === 2) (ok = false), say(false, `${kind}: ${key} was sent ${sent.filter((b) => b.submission_key === key).length} times`);
    if (seen.get(key) > 1) continue;
    if (!calls.has(key)) {
      ok = false;
      say(false, `${kind}: ${key} was sent and is not in media/${file}`);
      continue;
    }
    const d = differs(a, calls.get(key));
    if (d) (ok = false), say(false, `${kind}: ${key} was sent with ${d.at} ${show(d.sent)}; media/${file} has ${show(d.recorded)}`);
  }
  for (const key of calls.keys()) if (!seen.has(key)) (ok = false), say(false, `${kind}: ${key} is in media/${file} and was never sent`);
  return { ok, count: sent.length };
}

// ---------- stills ----------
{
  const { data, missing } = record("stills.json");
  if (missing) say(false, `stills: ${missing}`);
  else {
    let ok = true;
    const bad = (why) => ((ok = false), say(false, `stills: ${why}`));
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
    const r = compare("stills", "stills.json", NANO, calls);
    if (ok && r.ok) say(true, `stills: ${r.count} sent, each equal to media/stills.json`);
  }
}

// ---------- clips ----------
{
  const { data, missing } = record("clips.json");
  if (missing) say(false, `clips: ${missing}`);
  else {
    let ok = true;
    const bad = (why) => ((ok = false), say(false, `clips: ${why}`));
    const every = data.every_clip ?? {};
    if (data.endpoint_id !== KLING) bad(`media/clips.json's endpoint_id is ${show(data.endpoint_id)}, not ${KLING}`);
    if (every.negative_prompt !== NEGATIVE) bad(`media/clips.json's negative_prompt is ${show(every.negative_prompt)}, not the one exact string`);
    if (every.generate_audio !== false) bad(`media/clips.json's generate_audio is ${show(every.generate_audio)}, not false`);
    const list = Array.isArray(data.clips) ? data.clips : [];
    if (list.length !== shots) bad(`media/clips.json holds ${list.length} clips, the case ${shots} shots`);
    const calls = new Map(list.map((c) => [c.key, { endpoint_id: data.endpoint_id, submission_key: c.key, input: { prompt: c.prompt, start_image_url: c.start_image_url, duration: c.duration, ...every } }]));
    if (calls.size !== list.length) bad("media/clips.json holds one key twice");
    const r = compare("clips", "clips.json", KLING, calls);
    if (ok && r.ok) say(true, `clips: ${r.count} sent, each equal to media/clips.json, negative_prompt exact`);
  }
}

console.log([...lines, `RESULT ${failed ? "FAIL" : "PASS"}`].join("\n"));
process.exit(failed ? 1 : 0);
