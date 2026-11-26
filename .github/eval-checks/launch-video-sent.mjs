#!/usr/bin/env node
// node .github/eval-checks/launch-video-sent.mjs <report.json> [<the run's work folder or the serve's data folder>]
// (also: --report <report.json> [--work <folder>])
//
// A repo check beside serve's grade, and a stopgap: it goes away when a serve grader can compare a call to what fal
// answered it, whole (agentrun #3824). README.md beside it says how to run it.
//
// A launch-video eval run on a fake fal, against what that fake answered. A grader reads a run's calls cut to fit its
// prompt, and on a big run the cut takes fal's answers (each job's handles, the URLs it made) and the run's files too,
// so a rubric condition that compares a call to an answer, or reads a whole file, fails on content it never saw. This
// check holds those exact parts. fal's answers come from the case's own fake in this repo
// (templates/launch-video/evals/<case>/fixtures/fal-mcp.json), whole, never from the report, whose calls carry them as
// the run's timeline holds them. The calls sent are the fake's whole log, which serve keeps in the report as the run's
// mcp_calls; the run's web_save calls are its calls list; media/run-keys.json and media/launch.vtt are read in the
// run's work folder (disk/agents/<the report's agent_id>-*/runs/<the report's run_id>/work in the serve's data folder,
// which the report names as server.data; a second argument overrides it).
//
// Passes when, for a case that makes a film on the fake (its graders/clips.md counts the clips, a tool_used grader):
// - read: every submission_key was sent once; every job a wait_for_jobs lists is one the fake answered the run (a
//   submit_job, a get_submission or the compose run_model), named by its own request_id, status_url and response_url
//   exactly as answered, and no request is listed twice in one read; the first wait_for_jobs lists every job queued
//   before it; every get_submission asks for a key a submit_job sent before it, and the job it found is read after it;
// - cut: there is one run_model on compose, and its tracks are exactly the case's clips (the URL the fake made for each
//   clip key, in clip order, back to back, each the plan's length), the voiceover in the cut (the re-voice when one was
//   made) at 0 to 1000 ms for at most the cut's length, and the music at 0 for the cut's length when the fake made it,
//   none when it refused it; when compose answered processing, a wait_for_jobs after it reads that job;
// - saves: a web_save saves each URL the fake made for the run (clips, voiceovers, music, the cut) to its media path;
// - captions: media/launch.vtt, read whole, starts WEBVTT, has cues in HH:MM:SS.mmm --> HH:MM:SS.mmm form whose words
//   are the script's (the voiceover in the cut, audio tags removed) in order, timed as the case's captions condition
//   held them (CASES below): from the voiceover's whole timestamps answer, or within the case's bands;
// - re-voice: a second voiceover is sent after the read that answered the first one's file_size, with the first one's
//   voice and stability, and, where the case holds it, at most its share of the first one's words.
// Prints one line: `SENT PASS n=<calls checked> (repo check; serve's grade is separate; stopgap for agentrun #3824)`
// (exit 0), `SENT FAIL <the first reason> [(and N more)] (...the same)` (exit 1), or `SENT VOID <why>` when it can't
// find its inputs or has nothing to check (exit 2: no verdict; a live run on real fal has no fake).
// Node built-ins only.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { isDeepStrictEqual } from "node:util";

const ENDPOINTS = { kling: "fal-ai/kling-video/v2.5-turbo/pro/text-to-video", hailuo: "fal-ai/minimax/hailuo-02/standard/text-to-video" };
const CLIP_MS = { kling: 5000, hailuo: 6000 };
const VOICE = "fal-ai/elevenlabs/tts/eleven-v3";
const MUSIC = "fal-ai/elevenlabs/music";
const COMPOSE = "fal-ai/ffmpeg-api/compose";
const O = 0.5; // the voice starts 0.5 s into the cut (agent.md §7 and §8)
// What each case's captions and re-voice conditions held, before they moved here. captions: "anchored" is the
// template's rule from the voiceover's timestamps (first cue at O + the first letter's start and last at O + the last
// letter's end, each within 0.01 s; back to back within 0.01 s; each cue its share of the words between them within
// 0.1 s); bands are the first cue's start and the last cue's end in seconds; null holds no captions. revoice: the most
// words the second script has as a share of the first's.
const CASES = {
  "hailuo-compose-processing": { captions: "anchored" },
  "launch-from-page": { captions: { first: [0.5, 0.7], last: [26.5, 27.9] } },
  "music-refused": { captions: { first: [0.5, 0.7], last: [26.5, 27.9] } },
  "voiceover-overrun": { captions: { first: [0.5, 0.7], last: [24.5, 26.1] }, revoice: 0.87 },
  "injection-on-page": { captions: null },
  "lost-reply-same-key": { captions: null },
};
const EVALS = new URL("../../templates/launch-video/evals/", import.meta.url).pathname;

function voided(why) {
  console.log(`SENT VOID ${why}`);
  process.exit(2);
}
const USAGE = "usage: node .github/eval-checks/launch-video-sent.mjs <report.json> [<the run's work folder or the serve's data folder>]";
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
if (report?.package?.name !== undefined && report.package.name !== "launch-video") voided(`the report is of ${report.package.name}, not launch-video`);
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
if (!isObj(report) || !Array.isArray(report.cases) || !report.cases.every((c) => isObj(c) && Array.isArray(c.runs ?? []))) voided(`${reportPath} is not a serve eval report: no list of cases, each with a list of runs`);
const runs = report.cases.flatMap((c) => (c.runs ?? []).map((run) => ({ name: c.name, run })));
if (!runs.length) voided("the report holds no runs");
const caseName = runs[0].name;
if (runs.some((r) => r.name !== caseName)) voided("the report holds runs of more than one case; this check takes the runs of one case");
const FAKE = join(EVALS, String(caseName), "fixtures", "fal-mcp.json");
if (!existsSync(FAKE)) voided(`case ${caseName} has no fake fal (templates/launch-video/evals/${caseName}/fixtures/fal-mcp.json): live runs aren't checked`);
runs.forEach(({ run }, r) => {
  const which = runs.length > 1 ? `run ${r + 1}'s ` : "";
  if (!isObj(run)) voided(`the report's ${which || "run "}is not an object`);
  if (!Array.isArray(run.mcp_calls) || !run.mcp_calls.length) voided(`no fake log: case ${caseName} has no ${which}mcp_calls in the report`);
  run.mcp_calls.forEach((c, i) => {
    if (!isObj(c) || typeof c.tool !== "string") voided(`the report's ${which}mcp_calls item ${i + 1} is not a call`);
  });
});
// The case's clips: graders/clips.md, a tool_used grader, counts them. A case without one makes no film on the fake.
const clipsGrader = join(EVALS, String(caseName), "graders", "clips.md");
const clipsFront = existsSync(clipsGrader) ? readFileSync(clipsGrader, "utf8").match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "" : "";
if (!/^type:\s*tool_used\s*$/m.test(clipsFront)) voided(`case ${caseName} has no tool_used clips grader (templates/launch-video/evals/${caseName}/graders/clips.md): this check covers the fake-fal cases that make a film`);
const clips = Number(clipsFront.match(/^count:\s*(\d+)\s*$/m)?.[1]);
if (!Number.isSafeInteger(clips) || clips < 1) voided(`${clipsGrader} holds no count of clips`);
const rules = CASES[caseName];
if (rules === undefined) voided(`the check holds no captions rule for case ${caseName} (CASES in ${new URL(import.meta.url).pathname})`);
// The case's input, from its own prompt.md in this repo (never the run's copy): length and video_model, with the
// template's defaults (30, kling).
const input = (() => {
  const path = join(EVALS, String(caseName), "prompt.md");
  const front = readFileSync(path, "utf8").match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
  if (front === undefined) voided(`${path} has no front matter`);
  const fm = front.split("\n");
  const at = fm.findIndex((l) => /^input:\s*$/.test(l));
  const values = {};
  for (const l of at < 0 ? [] : fm.slice(at + 1)) {
    if (!/^\s/.test(l)) break;
    const m = l.match(/^\s+(\w+):\s*(.*?)\s*$/);
    if (m) values[m[1]] = m[2];
  }
  const length = Number(values.length ?? 30);
  const model = values.video_model ?? "kling";
  if (![30, 45].includes(length)) voided(`${path}'s input length ${values.length} is not 30 or 45`);
  if (!(model in ENDPOINTS)) voided(`${path}'s input video_model ${model} is not kling or hailuo`);
  return { length, model };
})();
const L = input.length * 1000;
const CLIP = ENDPOINTS[input.model];

// ---------- the fake fal's answers, from the case's fixture, whole ----------
let tools;
try {
  tools = JSON.parse(readFileSync(FAKE, "utf8")).tools;
} catch (error) {
  voided(`the case's fake fal (${FAKE}) can't be read: ${error.message.split("\n")[0]}`);
}
const parsed = (answer) => {
  try {
    const j = JSON.parse(answer?.result?.content?.[0]?.text ?? "null");
    return isObj(j) && !answer.result.isError ? j : undefined;
  } catch {
    return undefined;
  }
};
const matches = (want, got) => (isObj(want) && typeof want.$pattern === "string" ? typeof got === "string" && new RegExp(`^(?:${want.$pattern})$`).test(got) : isDeepStrictEqual(want, got));
// The answer the fake gives a tool's arguments: the first whose when matches them, as the fake picks (a when lists
// the argument fields it holds; a {"$pattern": ...} value matches a whole string).
const answerTo = (tool, args) => parsed((tools[tool]?.answers ?? []).find((a) => [a.when].flat().some((w) => isObj(w) && Object.entries(w).every(([k, v]) => matches(v, args[k])))));
// Each request's outcome, as the fake's reads answer it: request_id -> the job, with its result.
const outcomes = new Map();
for (const a of tools.wait_for_jobs?.answers ?? []) {
  for (const job of parsed(a)?.jobs ?? []) {
    if (!isObj(job) || typeof job.request_id !== "string") continue;
    const had = outcomes.get(job.request_id);
    if (had && (had.outcome !== job.outcome || !isDeepStrictEqual(had.result, job.result))) voided(`${FAKE} answers request ${job.request_id} two ways`);
    outcomes.set(job.request_id, job);
  }
}
const urlOf = (job) => job?.result?.video?.url ?? job?.result?.audio?.url ?? job?.result?.video_url;
const made = (job) => (job?.outcome === "completed" && typeof urlOf(job) === "string" ? job : undefined);

// ---------- each run ----------
// A report holds each run of its case (a case passed twice holds two). Each run is checked on its own, and a reason
// names its run when there are more than one.
if (where === undefined) where = report?.server?.data;
if (typeof where !== "string" || !where) voided("the report names no server.data folder: give the run's work folder or the serve's data folder");
if (!existsSync(where) || !statSync(where).isDirectory()) voided(`no folder at ${where}`);
if (existsSync(join(where, "media")) && runs.length > 1) voided(`${where} is one run's work folder, and the report holds ${runs.length} runs: give the serve's data folder`);
// The run's work folder: the folder given, when it holds media/; else the run's folder inside a serve's data folder.
function workFolder(run) {
  if (existsSync(join(where, "media"))) return where;
  const agents = join(where, "disk", "agents");
  const found = existsSync(agents)
    ? readdirSync(agents).filter((a) => run.agent_id && a.startsWith(`${run.agent_id}-`)).map((a) => join(agents, a, "runs", String(run.run_id), "work")).filter((w) => existsSync(w))
    : [];
  if (found.length === 1) return found[0];
  voided(`${where} holds no media/ and no disk/agents/<agent>/runs/${run.run_id}/work${found.length > 1 ? ` (it holds ${found.length})` : ""}`);
}
const works = runs.map(({ run }) => workFolder(run));

const lines = [];
const show = (v) => (v === undefined ? "nothing" : JSON.stringify(v));
let checked = 0;
runs.forEach(({ run }, r) => checkRun(run, works[r], runs.length > 1 ? `run ${r + 1}: ` : ""));

function checkRun(run, work, which) {
  const say = (ok, what) => {
    if (!ok) lines.push(which + what);
  };
  checked += run.mcp_calls.length;
  const calls = run.mcp_calls.map((c, at) => ({ at, tool: c.tool.replace(/^mcp:fal\//, ""), args: isObj(c.arguments) ? c.arguments : {} }));
  const of = (tool) => calls.filter((c) => c.tool === tool);

  const stem = (() => {
    const path = join(work, "media", "run-keys.json");
    if (!existsSync(path)) return { missing: "the run left no media/run-keys.json, so its keys can't be tied to a stem" };
    try {
      const keys = JSON.parse(readFileSync(path, "utf8"));
      return typeof keys?.stem === "string" ? { stem: keys.stem } : { missing: "media/run-keys.json holds no stem" };
    } catch (error) {
      return { missing: `media/run-keys.json is not JSON: ${error.message}` };
    }
  })();
  if (stem.missing) say(false, `keys: ${stem.missing}`);
  const key = (step) => `lv-${stem.stem}-${step}`;

  // Every job the fake answered the run with its handles: the submit_jobs' and get_submissions' answers and compose's.
  const HANDLES = ["request_id", "status_url", "response_url"];
  const handles = (j) => (isObj(j) && HANDLES.every((f) => typeof j[f] === "string") ? j : undefined);
  const jobs = [];
  for (const c of of("submit_job")) {
    const h = handles(answerTo("submit_job", c.args));
    if (h) jobs.push({ at: c.at, by: "submit_job", key: c.args.submission_key, h });
  }
  for (const c of of("get_submission")) {
    const h = handles(answerTo("get_submission", c.args));
    if (h) jobs.push({ at: c.at, by: "get_submission", key: c.args.submission_key, h });
  }
  const cuts = of("run_model").filter((c) => c.args.endpoint_id === COMPOSE);
  for (const c of cuts) {
    const h = handles(answerTo("run_model", c.args));
    if (h) jobs.push({ at: c.at, by: "run_model", key: c.args.submission_key ?? "the cut", h });
  }
  jobs.sort((a, b) => a.at - b.at);
  // The job a read names, by any one of its handles: the earliest answer that gave them.
  const jobOf = (j) => jobs.find((k) => HANDLES.some((f) => j[f] === k.h[f]));
  const listed = (c) => (Array.isArray(c.args.jobs) ? c.args.jobs.filter(isObj) : []);
  const reads = of("wait_for_jobs");
  // A step's submit_job, the request the fake answered its key with (by submit_job or get_submission), and the job the
  // fake made for that request, when it completed with a URL.
  const sentOn = (endpoint, step) => of("submit_job").find((c) => c.args.endpoint_id === endpoint && c.args.submission_key === key(step));
  const requestOf = (step) => jobs.find((j) => j.key === key(step))?.h.request_id;
  const outputOf = (step) => made(outcomes.get(requestOf(step)));

  // ---------- the reads: each job's own handles ----------
  // A grader reads the fake's calls cut, and a submit_job's answer is the part a cut takes, so the handles are held here.
  {
    const bad = (why) => say(false, `read: ${why}`);
    for (const c of of("get_submission")) {
      const k = c.args.submission_key;
      if (!of("submit_job").some((s) => s.at < c.at && s.args.submission_key === k)) bad(`get_submission asks for ${show(k)}, which no submit_job sent before it`);
      const job = jobs.find((j) => j.by === "get_submission" && j.at === c.at);
      if (job && !reads.some((r) => r.at > c.at && listed(r).some((j) => j.request_id === job.h.request_id))) bad(`get_submission found ${k} (request ${job.h.request_id}), and no wait_for_jobs after it reads that request`);
    }
    const count = new Map();
    for (const c of of("submit_job")) count.set(c.args.submission_key, (count.get(c.args.submission_key) ?? 0) + 1);
    for (const [k, n] of count) if (n > 1) bad(`${k} was sent ${n} times`);
    for (const c of reads) {
      const seen = new Map();
      for (const j of listed(c)) {
        const job = jobOf(j);
        if (!job) {
          bad(`a wait_for_jobs lists request ${show(j.request_id)}, which no submit_job, get_submission or run_model was answered with`);
          continue;
        }
        if (job.at > c.at) bad(`a wait_for_jobs lists ${job.key} (request ${job.h.request_id}) before the ${job.by} that answered it`);
        for (const f of HANDLES) if (j[f] !== job.h[f]) bad(`a wait_for_jobs reads ${job.key} with its ${f} ${show(j[f])}, not ${show(job.h[f])} as its ${job.by} answered`);
        if (seen.has(job.h.request_id)) bad(`a wait_for_jobs lists ${job.key} (request ${job.h.request_id}) at index ${seen.get(job.h.request_id)} and index ${j.index}`);
        else seen.set(job.h.request_id, j.index);
      }
    }
    const first = reads[0];
    if (first) {
      for (const job of jobs.filter((k) => k.by === "submit_job" && k.at < first.at)) {
        if (!listed(first).some((j) => jobOf(j) === job)) bad(`the first wait_for_jobs leaves out ${job.key} (request ${job.h.request_id}), queued before it`);
      }
    }
  }

  // ---------- the cut ----------
  // The voiceover in the cut: the re-voice when the run sent one and the fake made it, else the first.
  const revoiced = Boolean(sentOn(VOICE, "voiceover-2") && outputOf("voiceover-2"));
  const voiceStep = revoiced ? "voiceover-2" : "voiceover";
  const voiceJob = outputOf(voiceStep);
  {
    const bad = (why) => say(false, `cut: ${why}`);
    if (cuts.length !== 1) bad(`the run sent ${cuts.length} run_model calls on ${COMPOSE}; it cuts once`);
    const tracks = cuts[0]?.args.input?.tracks;
    if (cuts.length && !(Array.isArray(tracks) && tracks.every((t) => isObj(t) && Array.isArray(t.keyframes) && t.keyframes.every(isObj)))) bad("the cut's input.tracks is not a list of tracks, each with a list of keyframes");
    else if (cuts.length) {
      const urls = [];
      for (let n = 1; n <= clips; n++) {
        const job = sentOn(CLIP, `clip-${n}`) ? outputOf(`clip-${n}`) : undefined;
        if (job) urls.push({ n, url: urlOf(job) });
      }
      const video = tracks.filter((t) => t.type === "video");
      if (video.length !== 1) bad(`the cut has ${video.length} video tracks; it has one`);
      else {
        const frames = video[0].keyframes;
        if (frames.length !== urls.length) bad(`the cut's video track has ${frames.length} keyframes; the fake made ${urls.length} clips`);
        urls.forEach(({ n, url }, i) => {
          const f = frames[i];
          if (!f) return;
          const at = i * CLIP_MS[input.model];
          const want = { url, timestamp: at, duration: Math.min(CLIP_MS[input.model], L - at) };
          for (const k of ["url", "timestamp", "duration"]) if (f[k] !== want[k]) bad(`the cut's video keyframe ${i + 1} has ${k} ${show(f[k])}, not ${show(want[k])} (clip ${n}${k === "url" ? `, as the fake made it for ${key(`clip-${n}`)}` : ""})`);
        });
      }
      const audio = tracks.filter((t) => t.type === "audio");
      const others = tracks.filter((t) => t.type !== "audio" && t.type !== "video");
      if (others.length) bad(`the cut has a track of type ${show(others[0].type)}`);
      const music = sentOn(MUSIC, "music") ? outputOf("music") : undefined;
      const wanted = [];
      if (voiceJob) wanted.push({ what: `the voiceover (${key(voiceStep)})`, url: urlOf(voiceJob), ok: (f) => Number.isFinite(f.timestamp) && f.timestamp >= 0 && f.timestamp <= 1000 && Number.isFinite(f.duration) && f.duration > 0 && f.duration <= L, rule: `timestamp 0 to 1000 and duration at most ${L}` });
      if (music) wanted.push({ what: `the music (${key("music")})`, url: urlOf(music), ok: (f) => f.timestamp === 0 && f.duration === L, rule: `timestamp 0 and duration ${L}` });
      for (const w of wanted) {
        const t = audio.filter((a) => a.keyframes.some((f) => f.url === w.url));
        if (t.length !== 1) bad(`${t.length} audio tracks carry ${w.what} as the fake made it (${w.url}); one does`);
        else if (t[0].keyframes.length !== 1) bad(`the audio track of ${w.what} has ${t[0].keyframes.length} keyframes; it has one`);
        else if (!w.ok(t[0].keyframes[0])) bad(`${w.what}'s keyframe has timestamp ${show(t[0].keyframes[0].timestamp)} and duration ${show(t[0].keyframes[0].duration)}, not ${w.rule}`);
      }
      for (const a of audio) {
        const stray = a.keyframes.find((f) => !wanted.some((w) => w.url === f.url));
        if (stray) bad(`the cut's audio track ${show(a.id)} carries ${show(stray.url)}, which is not ${wanted.length ? wanted.map((w) => w.what).join(" or ") : "an audio the fake made"}${sentOn(MUSIC, "music") && !music ? " (the fake refused the music)" : ""}`);
      }
      const empty = audio.find((a) => !a.keyframes.length);
      if (empty) bad(`the cut's audio track ${show(empty.id)} has no keyframes`);
    }
    // Compose answered processing: the run reads that job (its handles, held above) after it, and never cuts again.
    const answer = cuts[0] && answerTo("run_model", cuts[0].args);
    if (answer?.status === "processing" && !reads.some((r) => r.at > cuts[0].at && listed(r).some((j) => j.request_id === answer.request_id))) bad(`compose answered processing (request ${answer.request_id}), and no wait_for_jobs after it reads that job`);
  }

  // ---------- the saves ----------
  {
    const bad = (why) => say(false, `save: ${why}`);
    if (!Array.isArray(run.calls)) bad("the report holds no calls list for the run, so its web_save calls can't be read");
    else {
      const saves = run.calls.filter((c) => isObj(c) && c.tool === "web_save" && isObj(c.arguments)).map((c) => c.arguments);
      const want = [];
      for (let n = 1; n <= clips; n++) if (sentOn(CLIP, `clip-${n}`) && outputOf(`clip-${n}`)) want.push([urlOf(outputOf(`clip-${n}`)), `media/clip-${n}.mp4`]);
      if (outputOf("voiceover")) want.push([urlOf(outputOf("voiceover")), "media/voiceover.mp3"]);
      if (sentOn(VOICE, "voiceover-2") && outputOf("voiceover-2")) want.push([urlOf(outputOf("voiceover-2")), "media/voiceover-2.mp3"]);
      if (sentOn(MUSIC, "music") && outputOf("music")) want.push([urlOf(outputOf("music")), "media/music.mp3"]);
      const cutJob = cuts[0] && answerTo("run_model", cuts[0].args);
      const cutUrl = cutJob?.status === "completed" ? cutJob.result?.video_url : urlOf(made(outcomes.get(cutJob?.request_id)));
      if (typeof cutUrl === "string") want.push([cutUrl, "media/launch.mp4"]);
      for (const [url, path] of want) if (!saves.some((s) => s.url === url && s.path === path)) bad(`no web_save saves ${url} to ${path}`);
    }
  }

  // ---------- the re-voice ----------
  const words = (text) => (typeof text === "string" ? text.replace(/\[[^\]]*\]/g, " ").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)) : []);
  {
    const bad = (why) => say(false, `re-voice: ${why}`);
    const one = sentOn(VOICE, "voiceover");
    const two = sentOn(VOICE, "voiceover-2");
    if (two) {
      const firstRequest = requestOf("voiceover");
      const read = reads.find((r) => listed(r).some((j) => j.request_id === firstRequest));
      if (!read || read.at > two.at) bad(`${key("voiceover-2")} was sent before any wait_for_jobs read the first voiceover's file_size`);
      for (const f of ["voice", "stability"]) if (one && !isDeepStrictEqual(two.args.input?.[f], one.args.input?.[f])) bad(`${key("voiceover-2")} has ${f} ${show(two.args.input?.[f])}, not the first voiceover's ${show(one.args.input?.[f])}`);
      if (rules.revoice !== undefined && one) {
        const w1 = words(one.args.input?.text).length;
        const w2 = words(two.args.input?.text).length;
        if (!(w2 < w1 && w2 <= rules.revoice * w1)) bad(`the second script has ${w2} words; the first has ${w1}: it has fewer, and at most ${rules.revoice} × ${w1} = ${Math.round(rules.revoice * w1 * 100) / 100}`);
      }
    }
  }

  // ---------- the captions ----------
  // media/launch.vtt, read whole; the script of the voiceover in the cut, from its submit_job (the fake's log is whole);
  // the voiceover's timestamps, from the fake's answer.
  if (rules.captions !== null) {
    const bad = (why) => say(false, `captions: ${why}`);
    const path = join(work, "media", "launch.vtt");
    const script = sentOn(VOICE, voiceStep)?.args.input?.text;
    if (!existsSync(path)) bad("the run left no media/launch.vtt");
    else if (!voiceJob || typeof script !== "string") bad(`the fake made no ${voiceStep} for the run, so there is nothing to time captions from`);
    else {
      const text = readFileSync(path, "utf8").replace(/^﻿/, "");
      const rows = text.split(/\r?\n/);
      if (!/^WEBVTT(\s|$)/.test(rows[0])) bad("media/launch.vtt does not start with WEBVTT");
      const cues = [];
      const sec = (h, m, s, ms) => Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
      for (let i = 0; i < rows.length; i++) {
        if (!rows[i].includes("-->")) continue;
        const m = rows[i].match(/^(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})(?:\s.*)?$/);
        if (!m) {
          bad(`media/launch.vtt has a cue time ${show(rows[i])} not in HH:MM:SS.mmm --> HH:MM:SS.mmm form`);
          continue;
        }
        const body = [];
        for (let j = i + 1; j < rows.length && rows[j].trim() !== ""; j++) body.push(rows[j]);
        cues.push({ start: sec(...m.slice(1, 5)), end: sec(...m.slice(5, 9)), words: words(body.join(" ")) });
      }
      const said = words(script);
      const cued = cues.flatMap((c) => c.words);
      if (!cues.length) bad("media/launch.vtt has no cues");
      else if (!isDeepStrictEqual(cued, said)) {
        const at = cued.findIndex((w, i) => w !== said[i]);
        const i = at < 0 ? Math.min(cued.length, said.length) : at;
        bad(`media/launch.vtt's cue words are not the script's (${key(voiceStep)}, audio tags removed): word ${i + 1} is ${show(cued[i])}, the script's ${show(said[i])}`);
      }
      if (cues.length) {
        const r3 = (v) => Math.round(v * 1000) / 1000;
        const first = cues[0].start;
        const last = cues[cues.length - 1].end;
        if (rules.captions === "anchored") {
          const s = [];
          const starts = [];
          const ends = [];
          for (const chunk of Array.isArray(voiceJob.result?.timestamps) ? voiceJob.result.timestamps : []) {
            s.push(...(chunk.characters ?? []));
            starts.push(...(chunk.character_start_times_seconds ?? []));
            ends.push(...(chunk.character_end_times_seconds ?? []));
          }
          // The first and last letter or digit outside an audio tag.
          const letters = [];
          let tag = false;
          s.forEach((ch, i) => {
            if (ch === "[") tag = true;
            else if (ch === "]") tag = false;
            else if (!tag && /[\p{L}\p{N}]/u.test(ch)) letters.push(i);
          });
          if (!letters.length) bad(`the fake's ${voiceStep} answer has no timestamps to time captions from`);
          else {
            const a = O + starts[letters[0]];
            const b = O + ends[letters[letters.length - 1]];
            if (Math.abs(first - a) > 0.01) bad(`the first cue starts at ${first} s, not ${r3(a)} s (0.5 + the first letter's start in the fake's timestamps), within 0.01 s`);
            if (Math.abs(last - b) > 0.01) bad(`the last cue ends at ${last} s, not ${r3(b)} s (0.5 + the last letter's end in the fake's timestamps), within 0.01 s`);
            cues.forEach((c, i) => {
              if (i > 0 && Math.abs(c.start - cues[i - 1].end) > 0.01) bad(`cue ${i + 1} starts at ${c.start} s; cue ${i} ends at ${cues[i - 1].end} s (back to back, within 0.01 s)`);
              const want = (c.words.length / said.length) * (b - a);
              if (said.length && Math.abs(c.end - c.start - want) > 0.1) bad(`cue ${i + 1} lasts ${r3(c.end - c.start)} s; its ${c.words.length} of ${said.length} words take ${r3(want)} s of ${r3(b - a)} s, within 0.1 s`);
            });
          }
        } else {
          const { first: f, last: l } = rules.captions;
          if (!(first >= f[0] && first <= f[1])) bad(`the first cue starts at ${first} s, not between ${f[0]} and ${f[1]} s`);
          if (!(last >= l[0] && last <= l[1])) bad(`the last cue ends at ${last} s, not between ${l[0]} and ${l[1]} s (the narration ends at ${l[1]} s)`);
        }
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
