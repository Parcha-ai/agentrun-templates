// The explainer's script check (templates/explainer-video/skills/explainer-video/kit/check-script.mjs) holds the
// spoken-word cap in code, because a model counting its own words miscounts: a run sent a 30 s script of 76 spoken
// words against the cap of 75. These tests hold what the template and its graders depend on:
// - the caps: --length 30, 45 and 60 allow 75, 110 and 135 spoken words, and refuse one more; --max <n> (step 6's
//   re-voice) allows n and refuses n + 1.
// - audio tags are not words, a token with no letter or digit (a lone dash) is not a word, a hyphenated word is one.
// - a missing, empty or tag-only script is refused, as is a run with no cap.
// - every refusal exits non-zero, says nothing may be sent, and writes nothing; a pass writes nothing either.
// - ONE count: on a set of tricky scripts the check's count equals the W the caption kit (build-captions.mjs) reports,
//   and both equal a count chosen by hand.
// They need only node.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRoot } from "./temp-root.mjs";

const KIT_DIR = new URL("../templates/explainer-video/skills/explainer-video/kit/", import.meta.url).pathname;
const CHECK = join(KIT_DIR, "check-script.mjs");
const CAPTIONS = join(KIT_DIR, "build-captions.mjs");
const root = tempRoot("ev-script-check-");
let n = 0;

/** Every path under `dir`, sorted. */
function tree(dir) {
  return readdirSync(dir, { recursive: true }).map(String).sort();
}

/** A run folder holding work/script.txt with `script` (none when `script` is undefined). */
function runDir(script) {
  const dir = join(root, String(n++));
  mkdirSync(join(dir, "work"), { recursive: true });
  if (script !== undefined) writeFileSync(join(dir, "work", "script.txt"), script);
  return dir;
}

/** Runs the check in a run folder on work/script.txt with `args`; answers its exit status, output, and whether the
 *  folder changed. */
function check(script, ...args) {
  const dir = runDir(script);
  const before = tree(dir);
  const r = spawnSync(process.execPath, [CHECK, "--script", "work/script.txt", ...args], { cwd: dir, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, changed: tree(dir).join("\n") !== before.join("\n") };
}

/** The caption kit's W for `script`: its JSON line's `words`, timed from a length alone. */
function captionWords(script) {
  const dir = runDir(script);
  const r = spawnSync(process.execPath, [CAPTIONS, "--script", "work/script.txt", "--audio-seconds", "30", "--vtt", "media/explainer.vtt"], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout.split("\n")[0]).words;
}

/** `count` distinct spoken words, in sentences of eight, with a tag every sentence. */
function words(count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    if (i % 8 === 0) out.push("[warm]");
    out.push(`word${String.fromCharCode(97 + (i % 26))}${i}${i % 8 === 7 || i === count - 1 ? "." : ""}`);
  }
  return out.join(" ");
}

function passes(r, count, max) {
  assert.equal(r.status, 0, r.stderr);
  const line = JSON.parse(r.stdout.split("\n")[0]);
  assert.equal(line.script_check, "passed");
  assert.equal(line.words, count);
  assert.equal(line.max, max);
  assert.equal(r.changed, false, "a passing check writes nothing");
}

function refused(r, over) {
  assert.notEqual(r.status, 0, `a refusal exits non-zero: ${r.stdout}`);
  assert.equal(r.status === null, false, "it exits, not killed");
  assert.match(r.stderr, /send nothing/i);
  if (over !== undefined) assert.match(r.stderr, new RegExp(`\\b${over} over\\b`));
  assert.doesNotMatch(r.stdout, /"script_check":"passed"/);
  assert.equal(r.changed, false, "a refusal writes nothing");
}

for (const [length, cap] of [[30, 75], [45, 110], [60, 135]]) {
  test(`--length ${length}: ${cap} spoken words pass, ${cap + 1} are refused`, () => {
    passes(check(words(cap), "--length", String(length)), cap, cap);
    refused(check(words(cap + 1), "--length", String(length)), 1);
    refused(check(words(cap + 7), "--length", String(length)), 7);
  });
}

test("--max: n spoken words pass, n + 1 are refused (the re-voice's cap)", () => {
  passes(check(words(84), "--max", "84"), 84, 84);
  refused(check(words(85), "--max", "84"), 1);
  passes(check(words(1), "--max", "1"), 1, 1);
  refused(check(words(2), "--max", "1"), 1);
});

test("--max with a fraction allows its whole part only", () => {
  passes(check(words(84), "--max", "84.6"), 84, 84.6);
  refused(check(words(85), "--max", "84.6"));
});

test("--length and --max together: the lesser cap holds", () => {
  passes(check(words(60), "--length", "30", "--max", "60"), 60, 60);
  refused(check(words(61), "--length", "30", "--max", "60"), 1);
  refused(check(words(76), "--length", "30", "--max", "90"), 1);
});

test("audio tags are not counted, whatever they hold", () => {
  const script = `[warm] ${words(75)} [pauses] [short pause] [cheerfully]`;
  passes(check(script, "--length", "30"), 75, 75);
});

test("a lone dash is not a word; a hyphenated word is one", () => {
  passes(check("Offline mode — always-on, built-in — and twenty-two notes - synced.", "--max", "8"), 8, 8);
  refused(check("Offline mode — always-on, built-in — and twenty-two notes - synced.", "--max", "7"), 1);
});

test("a missing, empty, blank or tag-only script is refused", () => {
  refused(check(undefined, "--length", "30"));
  refused(check("", "--length", "30"));
  refused(check("   \n\t ", "--length", "30"));
  refused(check("[warm] [pauses] — ... !", "--length", "30"));
});

test("no cap, or a cap that isn't one, is refused", () => {
  refused(check(words(10)));
  refused(check(words(10), "--length", "40"));
  refused(check(words(10), "--length"));
  refused(check(words(10), "--max", "0"));
  refused(check(words(10), "--max", "-5"));
  refused(check(words(10), "--max", "many"));
});

test("no --script is refused", () => {
  const dir = runDir(words(10));
  const r = spawnSync(process.execPath, [CHECK, "--length", "30"], { cwd: dir, encoding: "utf8" });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /send nothing/i);
});

// Each count chosen by hand, the way a listener hears words: tags out, a lone mark rides on the word before, a
// hyphenated word, a URL or a number with a point is one word.
const TRICKY = [
  ["[warm] Hello there. [pauses] Offline mode is on.", 6],
  ["Notes sync — within ten seconds.", 5],
  ["A built-in, always-on cache.", 4],
  ["Fifty thousand rows, twenty-two schedules, one hundred and five days.", 10],
  ["Visit example.com/docs/offline-mode today.", 3],
  ["Café niño über straße — ünd 東京 も.", 7],
  ["Wait... what?! -- Yes!!! ... ok", 4],
  ["— Hello world", 2],
  ["[excited]\nBig\tnews [short pause] here.\n", 3],
  ["Version 5.3 ships 2 GB", 5],
  ["Don't stop; it's fine.", 4],
  ["[warm Hello there", 3],
  ["Settings, then Storage: off. (Optional.) \"Quoted\" words!", 7],
  ["…  ‑ – — ― ", 0],
];

for (const [script, count] of TRICKY.filter(([, c]) => c > 0)) {
  test(`one count: ${JSON.stringify(script)} is ${count} spoken words, to the check and the caption kit`, () => {
    passes(check(script, "--max", String(count)), count, count);
    refused(check(script, "--max", String(count - 1 || 0.5)));
    assert.equal(captionWords(script), count);
  });
}

test("one count: a script of no spoken words is refused by the check and by the caption kit", () => {
  for (const [script] of TRICKY.filter(([, c]) => c === 0)) {
    refused(check(script, "--length", "30"));
    const dir = runDir(script);
    const r = spawnSync(process.execPath, [CAPTIONS, "--script", "work/script.txt", "--audio-seconds", "30", "--vtt", "media/explainer.vtt"], { cwd: dir, encoding: "utf8" });
    assert.equal(r.status, 2);
  }
});

test("one count: the check and the caption kit agree on every generated script", () => {
  for (const count of [1, 9, 75, 76, 136]) {
    passes(check(words(count), "--max", String(count)), count, count);
    assert.equal(captionWords(words(count)), count);
  }
});
