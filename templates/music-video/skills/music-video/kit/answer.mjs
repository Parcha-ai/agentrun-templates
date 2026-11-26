#!/usr/bin/env node
// answer.mjs: the run's answer, built by code from the run's own files, report_markdown included. The model writes only
// what no file holds, in a small facts file; everything else comes from what the kit wrote, so no figure, row or path in
// the answer is typed by hand and the report's table always sits inside report_markdown.
//
//   node .agents/skills/music-video/kit/answer.mjs --facts media/answer-facts.json
//
// Run it from the run's folder, last, in every run (a refused one too). It reads, each only when it is there:
//   film/plan.json     beats, cut and shots (plan's answer fields), the plan's words for the cut and a weak beat
//   film/price.json    plan_usd and the ceiling it was judged against; film/ceiling.json: the run's ceiling as recorded
//   storyboard.md      each shot's picture (the plan's shots, in order)
//   film/lyrics.json   the words in the song and the cut, the caption lines, the lyric under each shot
//   media/stills.json  which shots were remade; media/clips.json: each still's URL as fal answered it
//   film/placed.json   what place put on screen for each shot (its clip, or its still and why)
//   media/check.json   the check's errors and warnings; media/film.mp4: its length and canvas, read with ffprobe
//   film/cost.json     fal_cost_usd as beats.mjs cost wrote it; media/run-keys.json: the key stem
//   media/still-<n>.png, still-<n>-2.png, clip-<n>.mp4, song.*, lyrics.vtt, transcript.json: the files saved
// The facts file (JSON) holds the rest:
//   status, failed_step, error          the run's outcome, error in fal's (or the refusal's) own words
//   max_fal_usd                         the input's max_fal_usd as given, or null when the user set none; the price and
//                                       the recorded ceiling must be the same
//   song: {url, rights, duration_s}     song_url as given, song_rights (or null), web_save's duration_s (or null)
//   renders                             renders run (0 to 3)
//   lyrics_on                           the input's lyrics, needed only when there is no plan
//   lyrics_note                         why there are no captions, only when no file says it
//   held_keys, shot_errors {n: words}, borrowed {n: shot whose still it shows}, warnings_kept, review_fixes,
//   sources {saved path: URL}, failed_saves [{what, source_url}], ignored_instructions, notes (report only)
// A file that is there and can't be read, or facts that don't fit the files, exit non-zero with words and print no
// answer: fix the file (or run the kit command that writes it) and run this again. Its output, one fenced json block,
// is the reply, sent as printed.
//
// The whole answer is checked against music-video.schema.json beside this file (the template's schema, kept the same by
// a repo test; a run holds only the skill's folder), rule by rule as the file states them; a rule this check doesn't
// know stops it. Fal's words the kit carries (a shot's error, the error of a failed fal step, the transcript's lyric
// under a shot) are cut at a field's limit with a marker naming the file that holds the whole text, and the cut is said
// on stderr. What the model wrote in the facts is its own to shorten: over a limit it is a problem naming the field and
// the limit, never cut.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { answerFields, cutHow, pictureOf, shotLines, weakBeat } from "./beats.mjs";

const stop = (message) => {
  console.error(`answer.mjs: ${message}`);
  process.exit(2);
};
const argv = process.argv.slice(2);
if (argv.length !== 2 || argv[0] !== "--facts") stop("usage: node answer.mjs --facts media/answer-facts.json (run from the run's folder)");
const factsPath = argv[1];

const TABLE_HEAD = "| Shot | Film time (s) | Bars | Lyric | Picture (as storyboarded) | Used |";
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// ---------- the schema the answer is checked against ----------
let schema;
try {
  schema = JSON.parse(readFileSync(new URL("./music-video.schema.json", import.meta.url), "utf8"));
} catch (e) {
  stop(`the kit's music-video.schema.json can't be read (${e.message.split("\n")[0]}): the kit is not as it ships`);
}
const NOTES = new Set(["$schema", "$id", "title", "description"]);
const RULES = new Set(["type", "enum", "const", "required", "additionalProperties", "properties", "items", "maxItems", "maxLength", "minimum", "maximum", "pattern"]);
(function known(s, at) {
  if (!isObj(s)) stop(`music-video.schema.json: ${at} is not a schema object`);
  for (const k of Object.keys(s)) if (!NOTES.has(k) && !RULES.has(k)) stop(`music-video.schema.json uses ${k} at ${at}, a rule answer.mjs doesn't check: the kit is not as it ships`);
  if ("additionalProperties" in s && typeof s.additionalProperties !== "boolean") stop(`music-video.schema.json: ${at}'s additionalProperties is a schema, which answer.mjs doesn't check`);
  for (const [k, x] of Object.entries(s.properties ?? {})) known(x, `${at}.${k}`);
  if ("items" in s) known(s.items, `${at}[]`);
})(schema, "the answer");
// JSON Schema counts a string's characters (code points), not UTF-16 units.
const chars = (v) => [...v].length;
const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v);
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
// Each rule the value breaks, with its path and the schema's limit.
function breaks(s, v, at, out = []) {
  if (s.type !== undefined) {
    const types = [s.type].flat(), t = typeOf(v);
    if (!types.includes(t) && !(t === "integer" && types.includes("number"))) {
      out.push([at, `is ${t}, not the schema's ${types.join(" or ")}`]);
      return out;
    }
  }
  if (s.enum && !s.enum.some((x) => same(x, v))) out.push([at, `is ${JSON.stringify(v)}, not one of the schema's ${s.enum.map((x) => JSON.stringify(x)).join(", ")}`]);
  if ("const" in s && !same(s.const, v)) out.push([at, `is ${JSON.stringify(v)}, not the schema's ${JSON.stringify(s.const)}`]);
  if (typeof v === "string") {
    if (s.maxLength !== undefined && chars(v) > s.maxLength) out.push([at, `runs ${chars(v)} characters, over the schema's maxLength of ${s.maxLength}`]);
    if (s.pattern !== undefined && !new RegExp(s.pattern, "u").test(v)) out.push([at, `is ${JSON.stringify(v.slice(0, 80))}, which doesn't match the schema's pattern ${s.pattern}`]);
  }
  if (typeof v === "number") {
    if (s.minimum !== undefined && v < s.minimum) out.push([at, `is ${v}, under the schema's minimum of ${s.minimum}`]);
    if (s.maximum !== undefined && v > s.maximum) out.push([at, `is ${v}, over the schema's maximum of ${s.maximum}`]);
  }
  if (Array.isArray(v)) {
    if (s.maxItems !== undefined && v.length > s.maxItems) out.push([at, `holds ${v.length} items, over the schema's maxItems of ${s.maxItems}`]);
    if (s.items) v.forEach((x, i) => breaks(s.items, x, `${at}[${i}]`, out));
  } else if (isObj(v)) {
    for (const k of s.required ?? []) if (!(k in v)) out.push([`${at ? `${at}.` : ""}${k}`, "is missing, and the schema requires it"]);
    for (const [k, x] of Object.entries(v)) {
      const path = `${at ? `${at}.` : ""}${k}`;
      if (s.properties && k in s.properties) breaks(s.properties[k], x, path, out);
      else if (s.additionalProperties === false) out.push([path, "is not a field the schema allows"]);
    }
  }
  return out;
}
const shotRules = schema.properties?.shots?.items?.properties ?? {};
// Fal's words the kit carries, cut at a limit: the start as fal gave it, then a marker naming where the whole text is.
const cuts = [];
function carry(text, max, where, what) {
  if (typeof text !== "string" || max === undefined || chars(text) <= max) return text;
  const mark = `… (cut at ${max} characters; the whole text is in ${where})`;
  cuts.push(`${what} cut at ${max} characters; the whole text is in ${where}`);
  return [...text].slice(0, Math.max(0, max - chars(mark))).join("").trimEnd() + mark;
}
const isInt = (v) => Number.isInteger(v) && v >= 0;
// A file the run wrote: undefined when it isn't there; not JSON, or not the shape its writer gives it, stops the answer.
function readJson(path, what, shape = () => true) {
  if (!existsSync(path)) return undefined;
  let v;
  try {
    v = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    stop(`${path} is not JSON (${e.message.split("\n")[0]}): ${what}`);
  }
  if (!shape(v)) stop(`${path} is not what its writer leaves: ${what}`);
  return v;
}

// ---------- the facts the model gives ----------
const FACTS = ["status", "failed_step", "error", "max_fal_usd", "song", "renders", "lyrics_on", "lyrics_note", "held_keys", "shot_errors", "borrowed", "warnings_kept", "review_fixes", "sources", "failed_saves", "ignored_instructions", "notes"];
if (!existsSync(factsPath)) stop(`${factsPath} is missing: write the facts no file holds there first (agent.md's Answer)`);
const facts = readJson(factsPath, "write it again as one JSON object", isObj);
const problems = [];
for (const k of Object.keys(facts)) if (!FACTS.includes(k)) problems.push(`${factsPath}: ${k} is not a fact this command takes (it takes ${FACTS.join(", ")}); every other field is built from the run's files`);
// A list of sentences; its limits are the schema's (notes, in the report only, at most 1000 characters each).
const strings = (k, max = Infinity) => {
  const v = facts[k] ?? [];
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string" && x.trim() && chars(x) <= max)) problems.push(`${factsPath}: ${k} is a list of sentences${max < Infinity ? `, each at most ${max} characters` : ""}`);
  return Array.isArray(v) ? v.map(String) : [];
};
const STATUS = ["completed", "partial", "over_budget", "refused", "failed"];
if (!STATUS.includes(facts.status)) problems.push(`${factsPath}: status is one of ${STATUS.join(", ")}`);
for (const k of ["failed_step", "error"]) if (!(k in facts) || (facts[k] !== null && (typeof facts[k] !== "string" || !facts[k].trim()))) problems.push(`${factsPath}: ${k} is a string, or null when none`);
if (typeof facts.failed_step === "string" && !/^(rights|song|beats|isolate|transcript|stills|still-\d{1,2}|clip-\d{1,2}|place|render)$/.test(facts.failed_step))
  problems.push(`${factsPath}: failed_step is rights, song, beats, isolate, transcript, stills, still-<n>, clip-<n>, place or render`);
const song = facts.song;
if (!isObj(song) || typeof song.url !== "string" || !song.url || !["own", "licensed", null].includes(song.rights) || !(song.duration_s === null || (typeof song.duration_s === "number" && song.duration_s >= 0)))
  problems.push(`${factsPath}: song is {url: song_url as given, rights: own, licensed or null, duration_s: web_save's or null}`);
if (!(Number.isInteger(facts.renders) && facts.renders >= 0 && facts.renders <= 3)) problems.push(`${factsPath}: renders is how many renders ran, 0 to 3`);
const maxGiven = "max_fal_usd" in facts && (facts.max_fal_usd === null || (typeof facts.max_fal_usd === "number" && facts.max_fal_usd >= 0));
if (!maxGiven) problems.push(`${factsPath}: max_fal_usd is the input's max_fal_usd as given, or null when the user set none`);
for (const k of ["shot_errors", "borrowed", "sources"]) if (k in facts && !isObj(facts[k])) problems.push(`${factsPath}: ${k} is an object`);
const warningsKept = strings("warnings_kept"), reviewFixes = strings("review_fixes"), ignored = strings("ignored_instructions"), notes = strings("notes", 1000);
const failedSaves = Array.isArray(facts.failed_saves ?? []) ? facts.failed_saves ?? [] : [];
if (!failedSaves.every((f) => isObj(f) && typeof f.what === "string" && f.what && (f.source_url === null || typeof f.source_url === "string")))
  problems.push(`${factsPath}: failed_saves is a list of {what, source_url}, one per save that failed`);
const shotErrors = isObj(facts.shot_errors) ? facts.shot_errors : {};
const borrowed = isObj(facts.borrowed) ? facts.borrowed : {};
const sources = isObj(facts.sources) ? facts.sources : {};

// ---------- the run's files ----------
const plan = readJson("film/plan.json", "run beats.mjs plan again", (p) => isObj(p) && isObj(p.cut) && Array.isArray(p.cut.shots) && isObj(p.beats) && isObj(p.song));
const fields = plan ? answerFields(plan) : null;
const planShots = fields ? fields.shots : [];
const price = readJson("film/price.json", "run beats.mjs price again", (p) => isObj(p) && typeof p.plan_usd === "number" && typeof p.fits === "boolean");
if (price && plan && price.plan_sha256 !== createHash("sha256").update(readFileSync("film/plan.json")).digest("hex"))
  problems.push("film/price.json is the price of another plan: run beats.mjs price again");
// The ceiling the price used and the one the run's first price recorded are the input's, as the facts give it.
const ceiling = readJson("film/ceiling.json", "it is written by beats.mjs price only", (c) => isObj(c) && (c.max_fal_usd === null || (typeof c.max_fal_usd === "number" && c.max_fal_usd >= 0)));
if (price && !ceiling) problems.push("film/price.json is there but film/ceiling.json is not: run beats.mjs price again with --max <the input's max_fal_usd> (left out only when it is null)");
if (maxGiven) {
  const said = facts.max_fal_usd === null ? "null (no ceiling)" : facts.max_fal_usd;
  if (price && price.max_fal_usd !== facts.max_fal_usd)
    problems.push(`max_fal_usd: film/price.json judged the plan against ${price.max_fal_usd ?? "no ceiling"}, and the input's max_fal_usd in ${factsPath} is ${said}: run beats.mjs price again with --max <the input's max_fal_usd> (left out only when it is null)`);
  if (ceiling && ceiling.max_fal_usd !== facts.max_fal_usd)
    problems.push(`max_fal_usd: film/ceiling.json records ${ceiling.max_fal_usd ?? "no ceiling"} as this run's ceiling, and the input's max_fal_usd in ${factsPath} is ${said}: the run was priced against another ceiling than the user's`);
}
const keys = readJson("media/run-keys.json", "it is written by beats.mjs stem only", (k) => isObj(k) && /^[a-z0-9]{8}$/.test(k.stem));
const stem = keys ? keys.stem : null;

let pictures = planShots.map(() => "");
if (plan && existsSync("storyboard.md")) {
  try {
    const { lines } = shotLines("storyboard.md", plan.cut.shots);
    pictures = lines.map(pictureOf);
  } catch (e) {
    stop(`storyboard.md: ${e.message}`);
  }
}

const lyricsFile = readJson("film/lyrics.json", "run beats.mjs lyrics again", (l) => isObj(l) && isInt(l.words_in_song) && isInt(l.words_in_cut) && Array.isArray(l.lines) && Array.isArray(l.under_shots));
if (lyricsFile && !plan) stop("film/lyrics.json is there but film/plan.json is not: run beats.mjs plan and lyrics again");
const placed = readJson("film/placed.json", "run beats.mjs place again", (p) => isObj(p) && Array.isArray(p.shots));
if (placed && (placed.shots.length !== planShots.length || placed.shots.some((s, i) => s?.n !== planShots[i].n || !["clip", "still"].includes(s?.use))))
  stop("film/placed.json is not this plan's shots: run beats.mjs place again");
const stillsRecord = readJson("media/stills.json", "it is written by beats.mjs stills only", (r) => isObj(r) && Array.isArray(r.stills) && r.stills.every(isObj));
const clipsRecord = readJson("media/clips.json", "it is written by beats.mjs clips only", (r) => isObj(r) && Array.isArray(r.clips) && r.clips.every(isObj));
// The remakes sent; a remake counts as the shot's still only when its file was saved.
const remakeSent = new Set((stillsRecord?.stills ?? []).filter((s) => s.remake === true).map((s) => s.n));
const check = readJson("media/check.json", "write it again with hyperframes check --json (the skill's step 5)", isObj);

let cost = readJson("film/cost.json", "run beats.mjs cost again", (c) => isObj(c) && Array.isArray(c.steps) && c.steps.every(isObj) && typeof c.total === "number");
if (!cost) {
  if (stem) stop("film/cost.json is missing: run beats.mjs cost with every paid step the run sent (the skill's step 8); it writes the file");
  cost = { steps: [], total: 0 };
}
for (const s of cost.steps) if (stem && s.key !== `mu-${stem}-${s.step}`) problems.push(`film/cost.json: ${s.step}'s key is not mu-${stem}-${s.step}: run beats.mjs cost again with --stem ${stem}`);
// Each still and clip the records hold is billed exactly once; no step is billed twice, and none the records don't hold
// (isolate and transcript the run sends itself).
{
  const named = (step) => (stem ? `mu-${stem}-${step}` : step);
  const recorded = new Map();
  for (const [file, list] of [["media/stills.json", stillsRecord?.stills], ["media/clips.json", clipsRecord?.clips]])
    for (const item of list ?? []) if (typeof item.key === "string") recorded.set(item.key.replace(/^mu-[a-z0-9]{8}-/, ""), { key: item.key, file });
  const times = new Map();
  for (const s of cost.steps) times.set(s.step, (times.get(s.step) ?? 0) + 1);
  for (const [step, n] of times) if (n > 1) problems.push(`film/cost.json bills ${named(step)} ${n} times: run beats.mjs cost again with each step sent once`);
  for (const step of times.keys()) if (!recorded.has(step) && !["isolate", "transcript"].includes(step)) problems.push(`film/cost.json bills ${named(step)}, which neither media/stills.json nor media/clips.json records: run beats.mjs cost again with the steps sent`);
  for (const [step, { key, file }] of recorded) if (!times.has(step)) problems.push(`film/cost.json has no step for ${key}, which ${file} records: run beats.mjs cost again with every still and clip sent`);
}
// A remake's outcome as cost billed it: failed (0), pending, or made (billed in full).
const remakeStep = (n) => cost.steps.find((s) => s.step === `still-${n}-2`);

// The film as ffprobe reads it.
let film = { path: null, seconds: null, width: null, height: null };
if (existsSync("media/film.mp4")) {
  const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", "media/film.mp4"], { encoding: "utf8" });
  let got;
  try {
    got = JSON.parse(p.stdout);
  } catch {
    got = null;
  }
  const v = got?.streams?.find((s) => s.codec_type === "video");
  const seconds = Number(got?.format?.duration);
  if (p.status !== 0 || !v || !Number.isFinite(seconds)) stop(`ffprobe could not read media/film.mp4 (${String(p.stderr || "no video stream").trim().split("\n")[0]}): render it again`);
  film = { path: "media/film.mp4", seconds: Math.round(seconds * 1000) / 1000, width: v.width, height: v.height };
  if (!placed) problems.push("media/film.mp4 is there but film/placed.json is not: run beats.mjs place (the skill's step 4) before the render");
  if (!check) problems.push("media/film.mp4 is there but media/check.json is not: run the skill's step 5 check");
}
const sum = (k) => Object.values(check ?? {}).reduce((t, x) => t + (isObj(x) && isInt(x[k]) ? x[k] : 0), 0);
const checkErrors = film.path && check ? sum("errorCount") : null;

// ---------- the answer ----------
const exists = (p) => existsSync(p);
// The take a shot's still is: 2 when its remake was sent and saved, else 1 when its first was saved, else none.
const takeOf = (n) => (remakeSent.has(n) && exists(`media/still-${n}-2.png`) ? 2 : exists(`media/still-${n}.png`) ? 1 : null);
const stillOf = (n) => ({ 1: `media/still-${n}.png`, 2: `media/still-${n}-2.png` })[takeOf(n)] ?? null;
const lyricUnder = new Map((lyricsFile?.under_shots ?? []).map((u) => [u?.n, typeof u?.lyric === "string" ? u.lyric : ""]));
for (const n of Object.keys(shotErrors)) if (!planShots.some((s) => String(s.n) === n) || typeof shotErrors[n] !== "string") problems.push(`${factsPath}: shot_errors names shot ${n}, which the plan has no shot for (or its words are not a string)`);
for (const [n, m] of Object.entries(borrowed)) {
  if (!planShots.some((s) => String(s.n) === n) || !planShots.some((s) => s.n === m)) problems.push(`${factsPath}: borrowed maps a shot to the shot whose still it shows, {"<n>": <m>}, both the plan's`);
  else if (takeOf(Number(n)) !== null) problems.push(`${factsPath}: borrowed names shot ${n}, but its own still is saved (${stillOf(Number(n))}): a shot borrows another's still only when neither of its takes was saved`);
  else if (takeOf(m) === null) problems.push(`${factsPath}: borrowed gives shot ${n} shot ${m}'s still, but no still of shot ${m} is saved either`);
}
const shots = planShots.map((s, i) => {
  const used = placed ? placed.shots[i].use : null;
  const clip = exists(`media/clip-${s.n}.mp4`) ? `media/clip-${s.n}.mp4` : null;
  if (used === "clip" && !clip) problems.push(`shot ${s.n}: place shows its clip, but media/clip-${s.n}.mp4 is not saved`);
  return {
    ...s,
    lyric: carry(lyricUnder.get(s.n) ?? "", shotRules.lyric?.maxLength, "film/lyrics.json", `shot ${s.n}'s lyric`),
    picture: pictures[i],
    still_path: String(s.n) in borrowed ? stillOf(borrowed[String(s.n)]) : stillOf(s.n),
    clip_path: clip,
    used,
    remade: takeOf(s.n) === 2,
    error: carry(shotErrors[String(s.n)] ?? null, shotRules.error?.maxLength, factsPath, `shot ${s.n}'s error`),
  };
});

// The lyrics: the file's counts, or why there are none in plain words.
const lyricsOn = plan ? plan.lyrics_on === true : facts.lyrics_on;
if (typeof lyricsOn !== "boolean") problems.push(`${factsPath}: lyrics_on is the input's lyrics (true or false): there is no plan to read it from`);
const lyrics = { on: lyricsOn === true, words_in_song: null, words_in_cut: null, lines: null, vtt_path: null, note: null };
if (!lyricsOn) lyrics.note = "the lyrics were off: no transcript was paid for, and the film has no lyric captions";
else if (lyricsFile) {
  Object.assign(lyrics, { words_in_song: lyricsFile.words_in_song, words_in_cut: lyricsFile.words_in_cut, lines: lyricsFile.lines.length });
  if (lyricsFile.words_in_cut > 0) {
    if (!exists("media/lyrics.vtt")) problems.push("film/lyrics.json has words but media/lyrics.vtt is missing: run beats.mjs lyrics again");
    lyrics.vtt_path = "media/lyrics.vtt";
  } else
    lyrics.note = lyricsFile.words_in_song === 0
      ? "speech-to-text found no words in the song (an instrumental), so the film has no lyric captions"
      : `speech-to-text found ${lyricsFile.words_in_song} words in the song and none in the cut, so the film has no lyric captions`;
} else if (["isolate", "transcript"].includes(facts.failed_step))
  lyrics.note = `the ${facts.failed_step === "isolate" ? "vocal isolation" : "speech-to-text"} step failed, so the film has no lyric captions (fal's words are in error)`;
else if (typeof facts.lyrics_note === "string" && facts.lyrics_note.trim()) lyrics.note = facts.lyrics_note.trim();
else if (["refused", "over_budget"].includes(facts.status) || ["rights", "song", "beats"].includes(facts.failed_step))
  lyrics.note = "no lyrics were transcribed: the run stopped before that step";
else problems.push("lyrics are on and film/lyrics.json is missing: run beats.mjs lyrics (the skill's step 3), or say in lyrics_note why there are none");

// The outcome the facts give, against what the files show.
if (facts.status === "completed" && (facts.failed_step !== null || facts.error !== null)) problems.push(`${factsPath}: a completed run has failed_step and error null`);
if (["partial", "failed", "refused"].includes(facts.status) && (facts.failed_step === null || facts.error === null)) problems.push(`${factsPath}: a ${facts.status} run names its failed_step and gives error in fal's (or the refusal's) own words`);
if (facts.status === "completed" && !film.path) problems.push("a completed run has its film: media/film.mp4 is missing");
if (price && price.fits === false && facts.status !== "over_budget") problems.push("film/price.json says the plan is over your ceiling: the status is over_budget");
if (facts.status === "over_budget" && !(price && price.fits === false)) problems.push("over_budget is only for a plan film/price.json prices over the ceiling the user set");
if (facts.status === "over_budget" && cost.total > 0) problems.push(`over_budget says nothing was paid, and film/cost.json bills $${cost.total}: an over_budget run sends no paid call; a run that paid for a step is partial or failed, naming it`);
const held = Array.isArray(facts.held_keys ?? []) ? facts.held_keys ?? [] : [];
for (const k of held) if (typeof k !== "string" || !stem || !new RegExp(`^mu-${stem}-(isolate|transcript|still-\\d{1,2}|still-\\d{1,2}-2|clip-\\d{1,2})$`).test(k)) problems.push(`${factsPath}: held_keys holds ${JSON.stringify(k)}, not a key of this run (mu-${stem ?? "<stem>"}-<step>)`);

// Every file of the run, with the URL it was saved from (null for what the sandbox made).
const stillUrl = new Map((clipsRecord?.clips ?? []).map((c) => [c.n, c.start_image_url]));
// The still file a clip's URL came from. With no remake made, it is the first take's. With one made, the URL is either
// take's (the clips may have been built before the remake): the run's sources tell which, by the first take's URL;
// without them it is credited to neither. A borrowed still is another shot's, so it is credited to neither.
const clipFrom = (n) => {
  const url = stillUrl.get(n);
  if (typeof url !== "string" || String(n) in borrowed) return null;
  const step = remakeStep(n);
  if (!remakeSent.has(n) || (step && step.usd === 0 && !step.pending)) return `media/still-${n}.png`;
  const first = sources[`media/still-${n}.png`];
  return typeof first !== "string" ? null : first === url ? `media/still-${n}.png` : `media/still-${n}-2.png`;
};
const files = [];
const add = (what, path, url = null) => exists(path.replace(/\/$/, "")) && files.push({ what, saved_path: path, source_url: sources[path] ?? url });
add("film", "media/film.mp4");
add("storyboard", "storyboard.md");
for (const s of planShots) {
  for (const path of [`media/still-${s.n}.png`, `media/still-${s.n}-2.png`]) add("still", path, clipFrom(s.n) === path ? stillUrl.get(s.n) : null);
}
for (const s of planShots) add("clip", `media/clip-${s.n}.mp4`);
add("lyrics", "media/lyrics.vtt");
add("transcript", "media/transcript.json");
for (const ext of ["mp3", "wav", "m4a"]) add("song", `media/song.${ext}`, typeof song?.url === "string" ? song.url : null);
add("run-keys", "media/run-keys.json");
add("stills record", "media/stills.json");
add("clips record", "media/clips.json");
add("composition", "film/");
for (const f of failedSaves) files.push({ what: f.what, saved_path: null, source_url: f.source_url ?? null });

// The run's error: fal's words when a fal job's step failed (the kit carries them, cut at the limit); else the model's.
const FAL_STEP = /^(isolate|transcript|stills|still-\d{1,2}|clip-\d{1,2})$/;
const error = FAL_STEP.test(facts.failed_step ?? "") ? carry(facts.error, schema.properties?.error?.maxLength, factsPath, "error") : facts.error ?? null;

// ---------- the report, in agent.md's order ----------
const cell = (v) => String(v).replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
const money = (n) => `$${n}`;
const out = [];
if (film.path) out.push("![Music video](media/film.mp4)");
if (!price) out.push("Nothing was priced: the run stopped before the plan's price.");
else if (price.max_fal_usd === null || price.max_fal_usd === undefined) out.push(`The plan priced at ${money(price.plan_usd)} on fal before anything was paid (no ceiling set).`);
else if (price.fits) out.push(`The plan priced at ${money(price.plan_usd)} on fal before anything was paid, inside the ${money(price.max_fal_usd)} ceiling you set (max_fal_usd).`);
else out.push(`The plan priced at ${money(price.plan_usd)} on fal, over the ${money(price.max_fal_usd)} ceiling you set (max_fal_usd): nothing was made and nothing was paid.`);
out.push(`**Song:** ${song?.url}${typeof song?.duration_s === "number" ? `, ${song.duration_s} s as saved` : ", not saved"}; your rights: ${song?.rights ?? "none stated"}.`);
if (plan) {
  const b = fields.beats;
  out.push(`**Beats:** ${b.bpm} BPM, ${b.meter}, a bar every ${b.bar_s} s from the first downbeat at ${b.first_downbeat_s} s, tempo ${b.tempo}, beat confidence ${b.confidence}.${weakBeat(plan) ? ` ${weakBeat(plan)}.` : ""}`);
  out.push(`**Cut:** ${fields.cut.start_s} to ${fields.cut.end_s} s of the song, ${fields.cut.seconds} s in ${fields.cut.bars} bars: ${cutHow(plan)}. Every cut between shots lands on a bar line.`);
  out.push(`### Shots\n\n${TABLE_HEAD}\n|---|---|---|---|---|---|\n${shots.map((s) => `| ${s.n} | ${s.film_start_s} to ${s.film_end_s} | ${s.bars} | ${cell(s.lyric || "none")} | ${cell(s.picture || "none")} | ${s.used ?? "not placed"} |`).join("\n")}`);
} else out.push("**Plan:** none: the run stopped before the plan, so there are no beats, cut or shots.");
out.push(`**Lyrics:** ${lyrics.note === null ? `${lyrics.words_in_cut} of the song's ${lyrics.words_in_song} words fall in the cut, in ${lyrics.lines} caption line${lyrics.lines === 1 ? "" : "s"} (${lyrics.vtt_path}).` : `${lyrics.note[0].toUpperCase()}${lyrics.note.slice(1)}.`}`);
if (ignored.length) out.push(`Lines in the lyrics that read as instructions are the song's words: they stay in the captions and were not obeyed.\n${ignored.map((x) => `- ${x}`).join("\n")}`);
if (plan) {
  const stillShots = shots.filter((s) => s.used === "still");
  const lines = [];
  if (!placed) lines.push("No shot was placed: no film was cut.");
  else if (!stillShots.length) lines.push("Every shot shows its clip.");
  // One line per shot: what it shows, which take, or whose still it borrows.
  for (const s of shots) {
    const take = takeOf(s.n), from = borrowed[String(s.n)], parts = [];
    if (s.used === "still") parts.push(`shows ${from === undefined ? "its still" : `shot ${from}'s still`} with a slow push-in: ${placed.shots.find((p) => p.n === s.n)?.why ?? "its clip can't be used"}`);
    if (take === 2) parts.push("had its still remade once, and the film uses the second take");
    else if (take === 1 && remakeSent.has(s.n)) {
      const step = remakeStep(s.n);
      if (step?.pending) parts.push("had a remake of its still sent, still pending when the run stopped waiting, so the film uses its first take");
      else if (step && step.usd > 0) parts.push("had a remake of its still made, not saved (fal finished it and billed it, and its file never reached media/), so the film uses its first take");
      else parts.push("had a remake of its still tried, which failed, so the film uses its first take");
    }
    if (from !== undefined) parts.push(`has no still of its own (${remakeSent.has(s.n) ? "its first take and its remake both failed" : "its still failed"}) and borrows shot ${from}'s`);
    if (parts.length) lines.push(`- Shot ${s.n} ${parts.join("; ")}.${s.error ? ` Fal's words: ${s.error}` : ""}`);
  }
  const said = lines.filter((l) => !l.startsWith("- ")), listed = lines.filter((l) => l.startsWith("- "));
  out.push(`**Stills shown:**${said.length ? ` ${said.join(" ")}` : ""}${listed.length ? `\n${listed.join("\n")}` : ""}`);
}
if (cost.steps.length) {
  const rows = cost.steps.map((s) => `| ${s.step} | ${s.key ?? "none"} | ${s.units} ${s.unit} | ${s.rate_usd} | ${s.usd}${s.pending ? " (pending)" : ""} |`);
  out.push(`### Cost on fal\n\n| Step | Key | Units | Rate (USD) | USD |\n|---|---|---|---|---|\n${rows.join("\n")}\n| Total | | | | ${cost.total} |\n\nEstimates from fal's rates, not fal's invoice.${cost.steps.some((s) => s.pending) ? " A step still pending when the run stopped waiting counts at its full price: fal may yet finish and bill it." : ""}`);
} else out.push("**Cost on fal:** nothing was paid, $0.");
if (film.path) {
  const warns = sum("warningCount");
  out.push(`**Checks:** ${checkErrors} check errors and ${warns} warning${warns === 1 ? "" : "s"} from hyperframes check; ${facts.renders} render${facts.renders === 1 ? "" : "s"}.${warningsKept.length ? `\nWarnings kept:\n${warningsKept.map((x) => `- ${x}`).join("\n")}` : ""}${reviewFixes.length ? `\nReview fixes:\n${reviewFixes.map((x) => `- ${x}`).join("\n")}` : ""}`);
} else out.push(`**Checks:** no film was rendered${facts.renders ? ` (${facts.renders} render${facts.renders === 1 ? "" : "s"} tried)` : ""}.`);
const end = [`**Status:** ${facts.status}${facts.failed_step ? `, failed at ${facts.failed_step}` : ""}.`];
if (error) end.push(`> ${String(error).replace(/\n/g, "\n> ")}`);
if (held.length) end.push(`Keys fal holds for other inputs (never sent again, nothing taken from them): ${held.map((k) => `\`${k}\``).join(", ")}.`);
for (const f of failedSaves) end.push(`- A save failed: ${f.what}${f.source_url ? ` from ${f.source_url}` : ""}.`);
out.push(end.join("\n"));
if (notes.length) out.push(`**Notes:**\n${notes.map((x) => `- ${x}`).join("\n")}`);
const report = out.join("\n\n") + "\n";

const answer = {
  status: facts.status,
  song: { url: song?.url, rights: song?.rights ?? null, duration_s: song?.duration_s ?? null },
  beats: fields ? fields.beats : null,
  cut: fields ? fields.cut : null,
  shots,
  lyrics,
  plan_usd: price ? price.plan_usd : null,
  fal_cost_usd: cost,
  key_stem: stem,
  held_keys: held,
  film,
  checks: { check_errors: checkErrors, warnings_kept: warningsKept, review_fixes: reviewFixes, renders: facts.renders },
  files,
  failed_step: facts.failed_step ?? null,
  error: error ?? null,
  ignored_instructions: ignored,
  report_markdown: report,
};
const text = JSON.stringify(answer, null, 1);
if (text.includes("```")) problems.push(`${factsPath}: a fact holds three backticks, which would end the reply's json block: write it without them`);
// The answer as printed, against the schema: each rule broken names the field, its limit and where to fix it.
const FROM = [
  [/^checks\.(warnings_kept|review_fixes|renders)\b/, (m) => `${m[1]} in ${factsPath}`],
  [/^(song|status|failed_step|error|held_keys|ignored_instructions)\b/, (m) => `${m[1]} in ${factsPath}`],
  [/^shots\[(\d+)\]\.picture/, (m) => `storyboard.md, shot ${planShots[Number(m[1])]?.n}'s picture`],
  [/^report_markdown/, () => `what holds its length: the storyboard's pictures in the shots table (storyboard.md, sent with the stills, so shorten them only before the stills), then the facts the report quotes (notes, the kept warnings and review fixes, the instructions) in ${factsPath}`],
];
for (const [at, what] of breaks(schema, JSON.parse(text), "")) {
  const hit = FROM.map(([re, to]) => [at.match(re), to]).find(([m]) => m);
  problems.push(`${at} ${what}: fix ${hit ? hit[1](hit[0]) : "the run's file it is built from, or run the kit command that writes it"}`);
}
if (problems.length) {
  console.error(`answer.mjs: ${problems.length} problem${problems.length === 1 ? "" : "s"}; no answer printed:`);
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}
for (const c of cuts) console.error(`answer.mjs: ${c}`);
console.log("```json\n" + text + "\n```");
