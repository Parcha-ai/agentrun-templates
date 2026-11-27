// The explainer's answer fields (templates/explainer-video/skills/explainer-video/kit/answer.mjs) come from code, because a
// model filling them by hand gets them wrong: a text-happy run gave the avatar step the run's total (2.42 where
// 29.2 s x $0.08 = 2.34), and a premium-revoice run retyped its script into the answer with an audio tag the voiceover
// never had. The kit reads the scripts the run sent, fal's results as the run filed them (evidence/fal/<request_id>.json)
// and the files saved under media/, and prints every computed field in one line. These tests hold what the template and
// its graders depend on:
// - `script` is the exact text of the voiceover the avatar was sent (work/script-2.txt when a re-voice was made and sent
//   to the avatar, else work/script.txt), outer whitespace aside: no tag added, none dropped; `word_count` is the script
//   check's count of it;
// - `audio_seconds`: OmniHuman's billed `duration` when its result states one (source "avatar"), else that voiceover's
//   file_size x 8 / 128000 to one decimal ("file_size"), else its last character's end ("timestamps"), else null;
// - each step's fal_cost_usd is its units x get_pricing's rate (1 image, the characters sent, the avatar at
//   audio_seconds); refused, failed or not run costs 0; 3 decimals, half up; the total is the sum of the listed steps;
// - `plan_usd` is step 4's plan: the portrait, the first script's voiceover twice (the re-voice reserve) and `length`
//   seconds of the avatar; `--plan` prints it before any paid call;
// - `files` lists each fal output by its saved path (null when the save failed) and fal's URL, then the captions and the
//   run's keys when they exist;
// - everything printed fits the output schema; bad input is refused with a non-zero exit, nothing printed and nothing
//   written; a pass writes nothing.
// They need only node.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRoot } from "./temp-root.mjs";

const KIT_DIR = new URL("../templates/explainer-video/skills/explainer-video/kit/", import.meta.url).pathname;
const KIT = join(KIT_DIR, "answer.mjs");
const CHECK = join(KIT_DIR, "check-script.mjs");
const SCHEMA = JSON.parse(readFileSync(new URL("../templates/explainer-video/explainer-video.schema.json", import.meta.url), "utf8"));
const RATES = "image=0.0398,voice=0.1,avatar=0.08";
const PREMIUM_RATES = "image=0.0398,voice=0.1,avatar=0.16";
const root = tempRoot("ev-answer-");
let n = 0;

// Request ids and fal's results, as the fake fal answers them.
const P = "a1b2c3d4-1111";
const V1 = "b2c3d4e5-2222";
const V2 = "e5f6a7b8-5555";
const A = "c3d4e5f6-3333";
const URL_P = "https://v3.fal.media/files/koala/portrait.png";
const URL_V1 = "https://v3.fal.media/files/zebra/voice-1.mp3";
const URL_V2 = "https://v3.fal.media/files/zebra/voice-2.mp3";
const URL_A = "https://v3.fal.media/files/lion/avatar.mp4";
const portraitResult = { images: [{ url: URL_P, content_type: "image/png", width: 1344, height: 768 }], description: "a portrait" };
const voice = (url, fileSize, timestamps) => ({ audio: { url, content_type: "audio/mpeg", file_size: fileSize }, timestamps });
const STAMPS = [{ characters: ["H", "i", "."], character_start_times_seconds: [0.15, 0.3, 28.6], character_end_times_seconds: [0.3, 0.5, 28.785] }];
const fabricResult = { video: { url: URL_A, content_type: "video/mp4" } };
const omniResult = { video: { url: URL_A, content_type: "video/mp4" }, duration: 52.8 };

/** `count` characters of script: audio tags and words, no outer whitespace. */
function chars(count) {
  const base = "[warm] Scheduled exports send a report to your inbox on a timetable you choose. ";
  let s = "";
  while (s.length < count) s += base;
  return s.slice(0, count).replace(/\s$/, "x");
}

/** A run folder: `work` maps a file under work/ to its text, `fal` a request id to its filed result (under `falDir`),
 *  `media` names files saved under media/. */
function runDir({ work = {}, fal = {}, media = [], falDir = "evidence/fal" } = {}) {
  const dir = join(root, String(n++));
  mkdirSync(join(dir, "work"), { recursive: true });
  for (const [name, text] of Object.entries(work)) writeFileSync(join(dir, "work", name), text);
  for (const [id, result] of Object.entries(fal)) {
    mkdirSync(join(dir, falDir), { recursive: true });
    writeFileSync(join(dir, falDir, `${id}.json`), JSON.stringify(result));
  }
  for (const name of media) {
    mkdirSync(join(dir, "media"), { recursive: true });
    writeFileSync(join(dir, "media", name), name === "run-keys.json" ? '{"stem":"k3v9q2xa"}\n' : "bytes");
  }
  return dir;
}

/** text-happy's run: a 641-character script, the three jobs done, everything saved. */
const HAPPY_FAL = { [P]: portraitResult, [V1]: voice(URL_V1, 466560, STAMPS), [A]: fabricResult };
const happy = (extra = {}) =>
  runDir({
    work: { "script.txt": `${chars(641)}\n` },
    fal: HAPPY_FAL,
    media: ["portrait.png", "voiceover.mp3", "explainer.mp4", "explainer.vtt", "run-keys.json"],
    ...extra,
  });
const STANDARD = ["--quality", "standard", "--rates", RATES, "--length", "30"];
const DONE3 = ["--portrait", `done:${P}`, "--voiceover", `done:${V1}`, "--avatar", `done:${A}`];

/** premium-revoice's run: the first script (641 characters, 63.4 s) too long, the re-voice (522, 52.8 s) sent to
 *  OmniHuman. */
const REVOICE_FAL = (avatarResult) => ({ [P]: portraitResult, [V1]: voice(URL_V1, 1014400, STAMPS), [V2]: voice(URL_V2, 844800, STAMPS), [A]: avatarResult });
const ALL_MEDIA = ["portrait.png", "voiceover.mp3", "voiceover-2.mp3", "explainer.mp4", "explainer.vtt", "run-keys.json"];
const revoiced = (avatarResult = omniResult, media = ALL_MEDIA) =>
  runDir({ work: { "script.txt": chars(641), "script-2.txt": `[calm] ${chars(515)}\n` }, fal: REVOICE_FAL(avatarResult), media });
const PREMIUM = ["--quality", "premium", "--rates", PREMIUM_RATES, "--length", "60"];
const REVOICED4 = ["--portrait", `done:${P}`, "--voiceover", `done:${V1}`, "--revoice", `done:${V2}`, "--avatar", `done:${A}`];

function snapshot(dir) {
  return readdirSync(dir, { recursive: true })
    .map(String)
    .sort()
    .map((p) => {
      let bytes = "";
      try {
        bytes = readFileSync(join(dir, p), "utf8");
      } catch {}
      return `${p}\n${bytes}`;
    })
    .join("\n--\n");
}

/** Runs the kit in `dir`; asserts it passed, printed one JSON line and wrote nothing; answers that line. */
function answer(dir, ...args) {
  const before = snapshot(dir);
  const r = spawnSync(process.execPath, [KIT, ...args], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 0, `passed: ${r.stderr}`);
  const lines = r.stdout.trim().split("\n");
  assert.equal(lines.length, 1, `one line: ${r.stdout}`);
  assert.equal(snapshot(dir), before, "a pass writes nothing");
  return JSON.parse(lines[0]);
}

function refused(dir, args, why) {
  const before = snapshot(dir);
  const r = spawnSync(process.execPath, [KIT, ...args], { cwd: dir, encoding: "utf8" });
  assert.notEqual(r.status, 0, `${why}: refused with a non-zero exit, got ${r.status}: ${r.stdout}`);
  assert.notEqual(r.status, null, `${why}: it exits, not killed`);
  assert.equal(r.stdout.trim(), "", `${why}: nothing printed to copy`);
  assert.match(r.stderr, /fill none of these fields yourself/i, `${why}: says the fields are never filled by hand`);
  assert.equal(snapshot(dir), before, `${why}: a refusal writes nothing`);
  return r;
}

/** The script check's `words` for a file in `dir`. */
function checkWords(dir, file) {
  const r = spawnSync(process.execPath, [CHECK, "--script", file, "--max", "200"], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.trim()).words;
}

const step = (out, name) => out.steps.find((s) => s.step === name);
const read = (dir, file) => readFileSync(join(dir, file), "utf8");

test("text-happy's run: every computed field, from the script sent, fal's results and the saved files", () => {
  const dir = happy();
  const out = answer(dir, ...STANDARD, ...DONE3);
  assert.deepEqual(out, {
    script: chars(641),
    word_count: checkWords(dir, "work/script.txt"),
    audio_seconds: 29.2,
    audio_seconds_source: "file_size",
    quality_used: "standard",
    avatar_model: "veed/fabric-1.0",
    resolution: "480p",
    plan_usd: 2.568,
    steps: [
      { step: "portrait", endpoint: "fal-ai/nano-banana", units: 1, unit: "images", fal_cost_usd: 0.04, status: "done", request_id: P },
      { step: "voiceover", endpoint: "fal-ai/elevenlabs/tts/eleven-v3", units: 641, unit: "characters", fal_cost_usd: 0.064, status: "done", request_id: V1 },
      { step: "avatar", endpoint: "veed/fabric-1.0", units: 29.2, unit: "seconds", fal_cost_usd: 2.336, status: "done", request_id: A },
    ],
    fal_cost_usd: 2.44,
    files: [
      { path: "media/portrait.png", kind: "portrait", fal_url: URL_P },
      { path: "media/voiceover.mp3", kind: "voiceover", fal_url: URL_V1 },
      { path: "media/explainer.mp4", kind: "video", fal_url: URL_A },
      { path: "media/explainer.vtt", kind: "captions", fal_url: null },
      { path: "media/run-keys.json", kind: "run_keys", fal_url: null },
    ],
  });
});

test("everything printed fits the output schema: its fields, types and enums", () => {
  const out = answer(happy(), ...STANDARD, ...DONE3);
  const props = SCHEMA.properties;
  for (const [k, v] of Object.entries(out)) {
    assert.ok(Object.hasOwn(props, k), `${k} is an answer field`);
    if (props[k].enum) assert.ok(props[k].enum.includes(v), `${k} ${v} is in its enum`);
  }
  for (const s of out.steps) {
    const item = props.steps.items;
    for (const k of item.required) assert.ok(Object.hasOwn(s, k), `step has ${k}`);
    for (const k of Object.keys(s)) assert.ok(Object.hasOwn(item.properties, k), `step's ${k} is a schema field`);
    assert.ok(item.properties.step.enum.includes(s.step) && item.properties.unit.enum.includes(s.unit) && item.properties.status.enum.includes(s.status));
  }
  for (const f of out.files) {
    const item = props.files.items;
    assert.deepEqual(Object.keys(f).sort(), [...item.required].sort());
    assert.ok(item.properties.kind.enum.includes(f.kind));
  }
  assert.ok(out.files.length <= props.files.maxItems);
});

test("script is the sent file's exact text: every tag kept, none added, only the outer whitespace dropped", () => {
  const text = "Kiln Studio can now render a scene on a farm. [pause] Open the Render menu. [curious] Pick two machines.";
  const dir = happy({ work: { "script.txt": `\n  ${text}\n\n` } });
  const out = answer(dir, ...STANDARD, ...DONE3);
  assert.equal(out.script, text);
  assert.equal(out.word_count, checkWords(dir, "work/script.txt"));
  assert.equal(out.word_count, 17);
});

test("a voiceover's characters count tags and every letter once (é is one), not the file's outer whitespace", () => {
  const script = "[warm] Café exports.";
  assert.equal([...script].length, 20);
  const out = answer(happy({ work: { "script.txt": `\n  ${script}\n\n` } }), ...STANDARD, ...DONE3);
  assert.equal(step(out, "voiceover").units, 20);
  assert.equal(step(out, "voiceover").fal_cost_usd, 0.002);
});

test("a re-voice sent to the avatar: script and word_count are work/script-2.txt's; four steps; both voiceovers listed", () => {
  const dir = revoiced();
  const out = answer(dir, ...PREMIUM, ...REVOICED4);
  assert.equal(out.script, read(dir, "work/script-2.txt").trim());
  assert.equal(out.word_count, checkWords(dir, "work/script-2.txt"));
  assert.equal(out.audio_seconds, 52.8);
  assert.equal(out.audio_seconds_source, "avatar");
  assert.deepEqual(
    out.steps.map((s) => [s.step, s.endpoint, s.units, s.fal_cost_usd, s.request_id]),
    [
      ["portrait", "fal-ai/nano-banana", 1, 0.04, P],
      ["voiceover", "fal-ai/elevenlabs/tts/eleven-v3", 641, 0.064, V1],
      ["revoice", "fal-ai/elevenlabs/tts/eleven-v3", 522, 0.052, V2],
      ["avatar", "fal-ai/bytedance/omnihuman/v1.5", 52.8, 8.448, A],
    ],
  );
  assert.equal(out.fal_cost_usd, 8.604);
  assert.equal(out.avatar_model, "fal-ai/bytedance/omnihuman/v1.5");
  assert.equal(out.resolution, "720p");
  // The plan is step 4's: the first script's voiceover twice and 60 s of OmniHuman.
  assert.equal(out.plan_usd, 9.768);
  assert.deepEqual(
    out.files.map((f) => [f.path, f.kind, f.fal_url]),
    [
      ["media/portrait.png", "portrait", URL_P],
      ["media/voiceover.mp3", "voiceover", URL_V1],
      ["media/voiceover-2.mp3", "voiceover", URL_V2],
      ["media/explainer.mp4", "video", URL_A],
      ["media/explainer.vtt", "captions", null],
      ["media/run-keys.json", "run_keys", null],
    ],
  );
});

test("an avatar result with no duration: audio_seconds is the re-voice's file_size length, not the first voiceover's", () => {
  const out = answer(revoiced(fabricResult), ...PREMIUM, ...REVOICED4);
  assert.equal(out.audio_seconds, 52.8);
  assert.equal(out.audio_seconds_source, "file_size");
  assert.equal(step(out, "avatar").units, 52.8);
  assert.equal(step(out, "avatar").fal_cost_usd, 8.448);
});

test("a re-voice made but never sent to the avatar: script, word_count and audio_seconds are the first voiceover's", () => {
  const dir = revoiced(omniResult, ["portrait.png", "voiceover.mp3", "voiceover-2.mp3", "explainer.vtt", "run-keys.json"]);
  const out = answer(dir, ...PREMIUM, "--portrait", `done:${P}`, "--voiceover", `done:${V1}`, "--revoice", `done:${V2}`, "--avatar", "not_run");
  assert.equal(out.script, chars(641));
  assert.equal(out.word_count, checkWords(dir, "work/script.txt"));
  assert.equal(out.audio_seconds, 63.4);
  assert.equal(out.audio_seconds_source, "file_size");
  assert.deepEqual(step(out, "avatar"), { step: "avatar", endpoint: "fal-ai/bytedance/omnihuman/v1.5", units: 63.4, unit: "seconds", fal_cost_usd: 0, status: "not_run", request_id: null });
  assert.equal(step(out, "revoice").fal_cost_usd, 0.052);
  assert.deepEqual(out.files.map((f) => f.path), ["media/portrait.png", "media/voiceover.mp3", "media/voiceover-2.mp3", "media/explainer.vtt", "media/run-keys.json"]);
});

test("a re-voice sent to an avatar that fal refused is still the voiceover described: script-2's text", () => {
  const dir = revoiced(omniResult, ["portrait.png", "voiceover.mp3", "voiceover-2.mp3", "run-keys.json"]);
  const out = answer(dir, ...PREMIUM, "--portrait", `done:${P}`, "--voiceover", `done:${V1}`, "--revoice", `done:${V2}`, "--avatar", "refused");
  assert.equal(out.script, read(dir, "work/script-2.txt").trim());
  assert.equal(out.audio_seconds, 52.8);
  assert.equal(step(out, "avatar").fal_cost_usd, 0);
  assert.ok(!out.files.some((f) => f.kind === "video"));
});

test("no file_size: audio_seconds is the last character's end in timestamps, and the avatar is billed on it", () => {
  const dir = happy({ fal: { ...HAPPY_FAL, [V1]: voice(URL_V1, null, STAMPS) } });
  const out = answer(dir, ...STANDARD, ...DONE3);
  assert.equal(out.audio_seconds, 28.785);
  assert.equal(out.audio_seconds_source, "timestamps");
  assert.equal(step(out, "avatar").fal_cost_usd, 2.303);
});

test("length unknown (neither file_size nor timestamps): audio_seconds and its source null, the avatar not run at 0", () => {
  const dir = runDir({
    work: { "script.txt": chars(641) },
    fal: { [P]: portraitResult, [V1]: voice(URL_V1, null, null) },
    media: ["portrait.png", "voiceover.mp3", "run-keys.json"],
  });
  const out = answer(dir, ...STANDARD, "--portrait", `done:${P}`, "--voiceover", `done:${V1}`, "--avatar", "not_run");
  assert.equal(out.audio_seconds, null);
  assert.equal(out.audio_seconds_source, null);
  assert.deepEqual(step(out, "avatar"), { step: "avatar", endpoint: "veed/fabric-1.0", units: 0, unit: "seconds", fal_cost_usd: 0, status: "not_run", request_id: null });
  assert.equal(out.fal_cost_usd, 0.104);
  assert.deepEqual(out.files.map((f) => f.kind), ["portrait", "voiceover", "run_keys"]);
});

test("a refused avatar costs 0 with no request id, lists no video, and the total is the portrait plus the voiceover", () => {
  const dir = happy({ media: ["portrait.png", "voiceover.mp3", "explainer.vtt", "run-keys.json"] });
  const out = answer(dir, ...STANDARD, "--portrait", `done:${P}`, "--voiceover", `done:${V1}`, "--avatar", "refused");
  assert.deepEqual(step(out, "avatar"), { step: "avatar", endpoint: "veed/fabric-1.0", units: 29.2, unit: "seconds", fal_cost_usd: 0, status: "refused", request_id: null });
  assert.equal(out.fal_cost_usd, 0.104);
  assert.ok(!out.files.some((f) => f.kind === "video"));
});

test("failed and not_run steps cost 0; a pending step is costed and lists no file yet", () => {
  const dir = happy({ media: ["voiceover.mp3", "explainer.vtt", "run-keys.json"] });
  const out = answer(dir, ...STANDARD, "--portrait", `failed:${P}`, "--voiceover", `done:${V1}`, "--avatar", `pending:${A}`);
  assert.deepEqual(
    out.steps.map((s) => [s.step, s.status, s.fal_cost_usd, s.request_id]),
    [
      ["portrait", "failed", 0, P],
      ["voiceover", "done", 0.064, V1],
      ["avatar", "pending", 2.336, A],
    ],
  );
  assert.equal(out.fal_cost_usd, 2.4);
  assert.deepEqual(out.files.map((f) => f.kind), ["voiceover", "captions", "run_keys"]);
});

test("a video made but not saved: its path is null and fal's URL kept", () => {
  const dir = happy({ media: ["portrait.png", "voiceover.mp3", "explainer.vtt", "run-keys.json"] });
  const out = answer(dir, ...STANDARD, ...DONE3);
  assert.deepEqual(out.files.find((f) => f.kind === "video"), { path: null, kind: "video", fal_url: URL_A });
});

test("nothing run (over the user's ceiling): every step 0, the total 0, no files, the plan priced", () => {
  const dir = runDir({ work: { "script.txt": chars(641) } });
  const out = answer(dir, ...PREMIUM, "--portrait", "not_run", "--voiceover", "not_run", "--avatar", "not_run");
  assert.ok(out.steps.every((s) => s.fal_cost_usd === 0 && s.request_id === null));
  assert.equal(out.fal_cost_usd, 0);
  assert.deepEqual(out.files, []);
  assert.equal(out.plan_usd, 9.768);
  assert.equal(out.script, chars(641));
  assert.equal(out.audio_seconds, null);
});

test("--plan, before any paid call: plan_usd and the plan's model, nothing else", () => {
  const dir = runDir({ work: { "script.txt": chars(641) } });
  assert.deepEqual(answer(dir, "--plan", ...STANDARD), { plan_usd: 2.568, quality_used: "standard", avatar_model: "veed/fabric-1.0", resolution: "480p" });
  assert.deepEqual(answer(dir, "--plan", ...PREMIUM), {
    plan_usd: 9.768,
    quality_used: "premium",
    avatar_model: "fal-ai/bytedance/omnihuman/v1.5",
    resolution: "720p",
  });
});

test("rounding: 3 decimals, half up: 1005 characters at $0.10 per 1000 is 0.101, and a $0.5005 portrait 0.501", () => {
  const dir = runDir({ work: { "script.txt": chars(1005) }, fal: HAPPY_FAL });
  const out = answer(dir, ...STANDARD, "--portrait", "not_run", "--voiceover", `done:${V1}`, "--avatar", "not_run");
  assert.equal(step(out, "voiceover").fal_cost_usd, 0.101);
  // 0.5005 is stored as 0.50049999...: half up still makes it 0.501.
  const odd = answer(dir, "--quality", "standard", "--rates", "image=0.5005,voice=0.1,avatar=0.08", "--length", "30", "--portrait", `done:${P}`, "--voiceover", "not_run", "--avatar", "not_run");
  assert.equal(step(odd, "portrait").fal_cost_usd, 0.501);
  assert.equal(odd.fal_cost_usd, 0.501);
});

test("the total is the sum of the listed (rounded) steps, not the rounded sum of the raw costs", () => {
  // Each raw cost is 0.0004, rounded to 0; their raw sum 0.0012 would round to 0.001.
  const dir = happy({ work: { "script.txt": chars(4) }, fal: { ...HAPPY_FAL, [V1]: voice(URL_V1, 16000, STAMPS) } });
  const out = answer(dir, "--quality", "standard", "--rates", "image=0.0004,voice=0.1,avatar=0.0004", "--length", "30", ...DONE3);
  assert.equal(out.audio_seconds, 1);
  assert.deepEqual(out.steps.map((s) => s.fal_cost_usd), [0, 0, 0]);
  assert.equal(out.fal_cost_usd, 0);
});

test("a server that files no fal results: the kit reads fal's results the run wrote to work/fal/<request_id>.json", () => {
  const out = answer(happy({ falDir: "work/fal" }), ...STANDARD, ...DONE3);
  assert.equal(out.audio_seconds, 29.2);
  assert.equal(out.files[0].fal_url, URL_P);
});

const noScript2 = () => runDir({ work: { "script.txt": chars(641) }, fal: REVOICE_FAL(omniResult), media: ALL_MEDIA });
for (const [why, dir, args] of [
  ["no --rates", happy, ["--quality", "standard", "--length", "30", ...DONE3]],
  ["a rate missing", happy, ["--quality", "standard", "--rates", "image=0.0398,voice=0.1", "--length", "30", ...DONE3]],
  ["a rate that is not a number", happy, ["--quality", "standard", "--rates", "image=0.0398,voice=ten,avatar=0.08", "--length", "30", ...DONE3]],
  ["a negative rate", happy, ["--quality", "standard", "--rates", "image=-0.04,voice=0.1,avatar=0.08", "--length", "30", ...DONE3]],
  ["no --quality", happy, ["--rates", RATES, "--length", "30", ...DONE3]],
  ["an unknown quality", happy, ["--quality", "ultra", "--rates", RATES, "--length", "30", ...DONE3]],
  ["no --length", happy, ["--quality", "standard", "--rates", RATES, ...DONE3]],
  ["a length that is not 30, 45 or 60", happy, ["--quality", "standard", "--rates", RATES, "--length", "40", ...DONE3]],
  ["no --avatar status", happy, [...STANDARD, "--portrait", `done:${P}`, "--voiceover", `done:${V1}`]],
  ["an unknown status", happy, [...STANDARD, "--portrait", `ok:${P}`, "--voiceover", `done:${V1}`, "--avatar", `done:${A}`]],
  ["a step done with no request id", happy, [...STANDARD, "--portrait", "done", "--voiceover", `done:${V1}`, "--avatar", `done:${A}`]],
  ["a request id that is a path", happy, [...STANDARD, "--portrait", "done:../../work/script", "--voiceover", `done:${V1}`, "--avatar", `done:${A}`]],
  ["a request id with no filed result (the run files others)", happy, [...STANDARD, "--portrait", `done:${P}`, "--voiceover", "done:f0f0-9999", "--avatar", `done:${A}`]],
  ["a server that files none, and no work/fal/ copy", () => happy({ fal: {} }), [...STANDARD, ...DONE3]],
  ["the portrait's id naming a voiceover's result", happy, [...STANDARD, "--portrait", `done:${V1}`, "--voiceover", `done:${V1}`, "--avatar", `done:${A}`]],
  ["the voiceover's id naming the video's result", happy, [...STANDARD, "--portrait", `done:${P}`, "--voiceover", `done:${A}`, "--avatar", `done:${A}`]],
  ["a voiceover done with no work/script.txt", () => happy({ work: {} }), [...STANDARD, ...DONE3]],
  ["a voiceover done with an empty work/script.txt", () => happy({ work: { "script.txt": " \n" } }), [...STANDARD, ...DONE3]],
  ["a revoice done with no work/script-2.txt", noScript2, [...PREMIUM, ...REVOICED4]],
  ["an avatar done on a voiceover of unknown length", () => happy({ fal: { ...HAPPY_FAL, [V1]: voice(URL_V1, null, null) } }), [...STANDARD, ...DONE3]],
  ["--plan with no work/script.txt", () => runDir(), ["--plan", ...STANDARD]],
]) {
  test(`refused: ${why}`, () => {
    refused(dir(), args, why);
  });
}
