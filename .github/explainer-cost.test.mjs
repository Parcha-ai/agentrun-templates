// The explainer's cost (templates/explainer-video/skills/explainer-video/kit/cost.mjs) is worked out in code, because a
// model doing its own arithmetic gets it wrong: a text-happy run gave the avatar step the run's total, 2.42, where
// 29.2 s x $0.08 = 2.34, so its steps summed to 2.50 against a fal_cost_usd of 2.42. These tests hold what the
// template and its graders depend on:
// - each step's fal_cost_usd is its units x get_pricing's rate: the portrait one image, a voiceover its script's
//   characters (tags included, the file's leading and trailing whitespace aside) at the rate per 1000, the avatar
//   --audio-seconds at the avatar rate (no rounding up to a whole second);
// - a step refused, failed or not run costs 0; a pending one is costed;
// - each step is rounded to 3 decimals, half up (1005 characters at $0.10 per 1000 is 0.101, not 0.1), and the total
//   is the sum of the listed steps, rounded to 3 decimals;
// - steps come in order (portrait, voiceover, revoice when one was made, avatar), the avatar on VEED Fabric for
//   standard and OmniHuman 1.5 for premium, and the line printed fits the output schema's steps;
// - missing or bad input is refused with a non-zero exit, no cost printed, and nothing written; a pass writes nothing.
// They need only node.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRoot } from "./temp-root.mjs";

const KIT = new URL("../templates/explainer-video/skills/explainer-video/kit/cost.mjs", import.meta.url).pathname;
const SCHEMA = JSON.parse(readFileSync(new URL("../templates/explainer-video/explainer-video.schema.json", import.meta.url), "utf8"));
const RATES = "image=0.0398,voice=0.1,avatar=0.08";
const PREMIUM_RATES = "image=0.0398,voice=0.1,avatar=0.16";
const root = tempRoot("ev-cost-");
let n = 0;

/** `count` characters of script: audio tags and words, no leading or trailing whitespace. */
function chars(count) {
  const base = "[warm] Scheduled exports send a report to your inbox on a timetable you choose. ";
  let s = "";
  while (s.length < count) s += base;
  s = s.slice(0, count);
  return s.replace(/\s$/, "x");
}

/** A run folder; `scripts` maps a file under work/ to its text. */
function runDir(scripts = {}) {
  const dir = join(root, String(n++));
  mkdirSync(join(dir, "work"), { recursive: true });
  for (const [name, text] of Object.entries(scripts)) writeFileSync(join(dir, "work", name), text);
  return dir;
}

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
function cost(dir, ...args) {
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
  assert.doesNotMatch(r.stdout, /fal_cost_usd/, `${why}: no cost printed`);
  assert.match(r.stderr, /work out no cost yourself/i, `${why}: says the cost is never worked out by hand`);
  assert.equal(snapshot(dir), before, `${why}: a refusal writes nothing`);
  return r;
}

const step = (out, name) => out.steps.find((s) => s.step === name);
const STANDARD = ["--quality", "standard", "--rates", RATES];
const DONE3 = ["--portrait", "done", "--voiceover", "done", "--avatar", "done"];

test("text-happy's run: portrait 0.04, 641 characters 0.064, 29.16 s x 0.08 = 2.333, total 2.437", () => {
  const out = cost(runDir({ "script.txt": `${chars(641)}\n` }), ...STANDARD, ...DONE3, "--audio-seconds", "29.16");
  assert.deepEqual(out, {
    steps: [
      { step: "portrait", endpoint: "fal-ai/nano-banana", units: 1, unit: "images", fal_cost_usd: 0.04, status: "done" },
      { step: "voiceover", endpoint: "fal-ai/elevenlabs/tts/eleven-v3", units: 641, unit: "characters", fal_cost_usd: 0.064, status: "done" },
      { step: "avatar", endpoint: "veed/fabric-1.0", units: 29.16, unit: "seconds", fal_cost_usd: 2.333, status: "done" },
    ],
    fal_cost_usd: 2.437,
  });
});

test("the printed steps fit the output schema's steps (no field it lacks, every field it requires)", () => {
  const out = cost(runDir({ "script.txt": chars(641) }), ...STANDARD, ...DONE3, "--audio-seconds", "29.16");
  const item = SCHEMA.properties.steps.items;
  for (const s of out.steps) {
    for (const k of item.required) if (k !== "request_id") assert.ok(Object.hasOwn(s, k), `has ${k}`);
    for (const k of Object.keys(s)) assert.ok(Object.hasOwn(item.properties, k), `${k} is a schema field`);
    assert.ok(item.properties.step.enum.includes(s.step));
    assert.ok(item.properties.unit.enum.includes(s.unit));
    assert.ok(item.properties.status.enum.includes(s.status));
  }
});

test("a voiceover's characters count tags and every letter once (é is one), not the file's outer whitespace", () => {
  const script = "[warm] Café exports.";
  assert.equal([...script].length, 20);
  const out = cost(runDir({ "script.txt": `\n  ${script}\n\n` }), ...STANDARD, ...DONE3, "--audio-seconds", "10");
  assert.equal(step(out, "voiceover").units, 20);
  assert.equal(step(out, "voiceover").fal_cost_usd, 0.002);
});

test("premium with a re-voice: portrait, voiceover, revoice and avatar in order, OmniHuman at 52.8 s x 0.16 = 8.448", () => {
  const dir = runDir({ "script.txt": chars(641), "script-2.txt": chars(522) });
  const out = cost(dir, "--quality", "premium", "--rates", PREMIUM_RATES, "--portrait", "done", "--voiceover", "done", "--revoice", "done", "--avatar", "done", "--audio-seconds", "52.8");
  assert.deepEqual(
    out.steps.map((s) => [s.step, s.endpoint, s.units, s.fal_cost_usd]),
    [
      ["portrait", "fal-ai/nano-banana", 1, 0.04],
      ["voiceover", "fal-ai/elevenlabs/tts/eleven-v3", 641, 0.064],
      ["revoice", "fal-ai/elevenlabs/tts/eleven-v3", 522, 0.052],
      ["avatar", "fal-ai/bytedance/omnihuman/v1.5", 52.8, 8.448],
    ],
  );
  assert.equal(out.fal_cost_usd, 8.604);
});

test("no --revoice: no revoice step", () => {
  const out = cost(runDir({ "script.txt": chars(641), "script-2.txt": chars(522) }), ...STANDARD, ...DONE3, "--audio-seconds", "29.16");
  assert.deepEqual(out.steps.map((s) => s.step), ["portrait", "voiceover", "avatar"]);
});

test("a refused avatar costs 0 and the total is the portrait plus the voiceover", () => {
  const out = cost(runDir({ "script.txt": chars(641) }), ...STANDARD, "--portrait", "done", "--voiceover", "done", "--avatar", "refused", "--audio-seconds", "29.16");
  assert.equal(step(out, "avatar").fal_cost_usd, 0);
  assert.equal(step(out, "avatar").status, "refused");
  assert.equal(out.fal_cost_usd, 0.104);
});

test("failed and not_run steps cost 0; a pending step is costed", () => {
  const dir = runDir({ "script.txt": chars(641) });
  const out = cost(dir, ...STANDARD, "--portrait", "failed", "--voiceover", "pending", "--avatar", "not_run");
  assert.deepEqual(
    out.steps.map((s) => [s.step, s.status, s.fal_cost_usd]),
    [
      ["portrait", "failed", 0],
      ["voiceover", "pending", 0.064],
      ["avatar", "not_run", 0],
    ],
  );
  assert.equal(out.fal_cost_usd, 0.064);
});

test("an avatar not run with no known length (length-unknown) is 0 seconds at 0", () => {
  const out = cost(runDir({ "script.txt": chars(641) }), ...STANDARD, "--portrait", "done", "--voiceover", "done", "--avatar", "not_run");
  assert.deepEqual(step(out, "avatar"), { step: "avatar", endpoint: "veed/fabric-1.0", units: 0, unit: "seconds", fal_cost_usd: 0, status: "not_run" });
  assert.equal(out.fal_cost_usd, 0.104);
});

test("nothing run (over the user's ceiling): every step 0 and the total 0", () => {
  const out = cost(runDir({ "script.txt": chars(641) }), ...STANDARD, "--portrait", "not_run", "--voiceover", "not_run", "--avatar", "not_run");
  assert.ok(out.steps.every((s) => s.fal_cost_usd === 0));
  assert.equal(out.fal_cost_usd, 0);
});

test("rounding: 3 decimals, half up, so 1005 characters at $0.10 per 1000 is 0.101 (0.1005), not 0.1", () => {
  const out = cost(runDir({ "script.txt": chars(1005) }), ...STANDARD, "--portrait", "not_run", "--voiceover", "done", "--avatar", "not_run");
  assert.equal(step(out, "voiceover").fal_cost_usd, 0.101);
});

test("the total is the sum of the listed (rounded) steps, not the rounded sum of the raw costs", () => {
  // Each raw cost is 0.0004, rounded to 0; their raw sum 0.0012 would round to 0.001.
  const out = cost(runDir({ "script.txt": chars(4) }), "--quality", "standard", "--rates", "image=0.0004,voice=0.1,avatar=0.0004", ...DONE3, "--audio-seconds", "1");
  assert.deepEqual(out.steps.map((s) => s.fal_cost_usd), [0, 0, 0]);
  assert.equal(out.fal_cost_usd, 0);
  // And a sum with float noise lands on 3 decimals: 0.04 + 0.064 + 1.856 (23.2 s x 0.08).
  const live = cost(runDir({ "script.txt": chars(641) }), ...STANDARD, ...DONE3, "--audio-seconds", "23.2");
  assert.equal(step(live, "avatar").fal_cost_usd, 1.856);
  assert.equal(live.fal_cost_usd, 1.96);
});

for (const [why, args, files = { "script.txt": chars(641) }] of [
  ["no --rates", ["--quality", "standard", ...DONE3, "--audio-seconds", "29.16"]],
  ["a rate missing", ["--quality", "standard", "--rates", "image=0.0398,voice=0.1", ...DONE3, "--audio-seconds", "29.16"]],
  ["a rate that is not a number", ["--quality", "standard", "--rates", "image=0.0398,voice=ten,avatar=0.08", ...DONE3, "--audio-seconds", "29.16"]],
  ["a negative rate", ["--quality", "standard", "--rates", "image=-0.04,voice=0.1,avatar=0.08", ...DONE3, "--audio-seconds", "29.16"]],
  ["no --quality", ["--rates", RATES, ...DONE3, "--audio-seconds", "29.16"]],
  ["an unknown quality", ["--quality", "ultra", "--rates", RATES, ...DONE3, "--audio-seconds", "29.16"]],
  ["no --avatar status", [...STANDARD, "--portrait", "done", "--voiceover", "done", "--audio-seconds", "29.16"]],
  ["no --portrait status", [...STANDARD, "--voiceover", "done", "--avatar", "done", "--audio-seconds", "29.16"]],
  ["an unknown status", [...STANDARD, "--portrait", "ok", "--voiceover", "done", "--avatar", "done", "--audio-seconds", "29.16"]],
  ["an avatar done with no --audio-seconds", [...STANDARD, ...DONE3]],
  ["an avatar pending with no --audio-seconds", [...STANDARD, "--portrait", "done", "--voiceover", "done", "--avatar", "pending"]],
  ["--audio-seconds that is not a number", [...STANDARD, ...DONE3, "--audio-seconds", "about 30"]],
  ["--audio-seconds of 0", [...STANDARD, ...DONE3, "--audio-seconds", "0"]],
  ["a voiceover done with no work/script.txt", [...STANDARD, ...DONE3, "--audio-seconds", "29.16"], {}],
  ["a voiceover done with an empty work/script.txt", [...STANDARD, ...DONE3, "--audio-seconds", "29.16"], { "script.txt": " \n" }],
  ["a revoice done with no work/script-2.txt", [...STANDARD, ...DONE3, "--revoice", "done", "--audio-seconds", "29.16"]],
]) {
  test(`refused: ${why}`, () => {
    refused(runDir(files), args, why);
  });
}
