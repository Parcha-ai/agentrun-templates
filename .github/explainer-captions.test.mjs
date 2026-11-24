// The explainer's caption kit (templates/explainer-video/skills/explainer-video/kit/build-captions.mjs) cuts and times
// every cue in code, because a model timing cues by hand from fal's character timestamps put them off by hundredths of
// a second, or a whole second, and wrote lines over 42 characters. These tests hold what the template's rubrics depend
// on:
// - aligned: on two real ElevenLabs v3 takes, every cue runs from its first letter's start to its last letter's end.
//   This covers the two cues a grader failed by hand (one starting at 9.653 s, one ending at 28.240 s).
// - anchored and measured: the cues run back to back, each lasting its share of the words.
// - every cue is one or two lines of at most 42 characters, in the script's order, with audio tags dropped.
// - no length at all: exit 2, no file.
// They need only node. explainer-captions.fixtures.json holds the two takes, each the script sent and fal's
// `timestamps` as it answered them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const KIT = new URL("../templates/explainer-video/skills/explainer-video/kit/build-captions.mjs", import.meta.url).pathname;
const TAKES = JSON.parse(readFileSync(new URL("./explainer-captions.fixtures.json", import.meta.url), "utf8"));
const root = mkdtempSync(join(tmpdir(), "ev-captions-"));
let n = 0;

/** Runs the kit on `script` (and `timestamps` when given) and answers its exit status, its first stdout line, the
 *  file it wrote and the file's cues ({start, end, lines}, times in seconds). */
function kit(script, timestamps, audioSeconds) {
  const dir = join(root, String(n++));
  spawnSync("mkdir", ["-p", dir]);
  writeFileSync(join(dir, "script.txt"), script);
  const args = [KIT, "--script", join(dir, "script.txt"), "--vtt", join(dir, "explainer.vtt")];
  if (timestamps !== undefined) {
    writeFileSync(join(dir, "ts.json"), JSON.stringify(timestamps));
    args.push("--timestamps", join(dir, "ts.json"));
  }
  if (audioSeconds !== undefined) args.push("--audio-seconds", String(audioSeconds));
  const r = spawnSync(process.execPath, args, { encoding: "utf8" });
  const vttPath = join(dir, "explainer.vtt");
  const vtt = existsSync(vttPath) ? readFileSync(vttPath, "utf8") : null;
  const sec = (t) => {
    const [h, m, s] = t.split(":");
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
  };
  const cues = vtt
    ? [...vtt.matchAll(/(\d\d:\d\d:\d\d\.\d\d\d) --> (\d\d:\d\d:\d\d\.\d\d\d)\n([\s\S]*?)(?:\n\n|\n?$)/g)].map((m) => ({
        start: sec(m[1]),
        end: sec(m[2]),
        lines: m[3].split("\n").filter(Boolean),
      }))
    : [];
  return { status: r.status, stderr: r.stderr, line: r.stdout.split("\n")[0], stdout: r.stdout, vtt, cues };
}

const spokenWords = (script) => script.replace(/\[[^\]]*\]/g, " ").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
const cueWords = (cues) => cues.flatMap((c) => c.lines.join(" ").split(" ")).filter((w) => /[\p{L}\p{N}]/u.test(w));

function checkLines(cues) {
  for (const c of cues) {
    assert.ok(c.lines.length >= 1 && c.lines.length <= 2, `a cue of ${c.lines.length} lines: ${c.lines.join(" / ")}`);
    for (const l of c.lines) assert.ok(l.length <= 42, `a line of ${l.length} characters: ${l}`);
    assert.ok(!/\[|\]/.test(c.lines.join(" ")), `an audio tag in a cue: ${c.lines.join(" ")}`);
  }
}

/** The letters and digits of fal's characters outside audio tags, in order, each with its start and end. */
function letters(timestamps) {
  const S = timestamps.flatMap((c) => c.characters);
  const st = timestamps.flatMap((c) => c.character_start_times_seconds);
  const en = timestamps.flatMap((c) => c.character_end_times_seconds);
  const out = [];
  let tag = false;
  S.forEach((ch, i) => {
    if (ch === "[") tag = true;
    if (!tag && /[\p{L}\p{N}]/u.test(ch)) out.push({ ch: ch.toLowerCase(), start: st[i], end: en[i] });
    if (ch === "]") tag = false;
  });
  return out;
}

for (const name of ["take1", "take2"]) {
  test(`aligned (${name}): every cue runs from its first letter's start to its last letter's end`, () => {
    const { script, timestamps } = TAKES[name];
    const r = kit(script, timestamps, 40);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.line).captions_timing, "aligned");
    assert.ok(r.vtt.startsWith("WEBVTT\n"));
    checkLines(r.cues);
    assert.deepEqual(cueWords(r.cues), spokenWords(script));
    // Walk the letters cue by cue: each cue owns the next run of letters its words spell.
    const L = letters(timestamps);
    let at = 0;
    for (const c of r.cues) {
      const count = c.lines.join(" ").normalize("NFKD").replace(/[^\p{L}\p{N}]/gu, "").length;
      assert.ok(Math.abs(c.start - L[at].start) < 0.0005, `${c.lines.join(" ")} starts at ${c.start}, its first letter at ${L[at].start}`);
      assert.ok(Math.abs(c.end - L[at + count - 1].end) < 0.0005, `${c.lines.join(" ")} ends at ${c.end}, its last letter at ${L[at + count - 1].end}`);
      at += count;
    }
    assert.equal(at, L.length);
  });
}

test("aligned: the two cues a hand-timed run got wrong land on their letters", () => {
  const one = kit(TAKES.take1.script, TAKES.take1.timestamps, 40);
  const so = one.cues.find((c) => c.lines.join(" ").startsWith("so you can write"));
  assert.ok(so, "a cue starting with 'so you can write'");
  assert.equal(so.start, 9.653);
  const two = kit(TAKES.take2.script, TAKES.take2.timestamps, 40);
  const timers = two.cues.find((c) => c.lines.join(" ").startsWith("Timers and tickers"));
  assert.ok(timers, "a cue starting with 'Timers and tickers'");
  assert.equal(timers.end, 28.24);
});

test("anchored: fal's letters don't spell the script, so the cues run back to back by share of words", () => {
  // A stand-in take: the characters of another text, one every 0.1 s, an audio tag first.
  const other = "[warm] Something else was said here, slowly and clearly, by another voice entirely.";
  const timestamps = [{ characters: [...other], character_start_times_seconds: [...other].map((_, i) => 0.05 + i * 0.1), character_end_times_seconds: [...other].map((_, i) => 0.15 + i * 0.1) }];
  const L = letters(timestamps);
  const a = L[0].start;
  const b = L[L.length - 1].end;
  const script = "[curious] Scheduled exports send a report to your inbox on a timetable you choose. Open the report, choose Schedule, and pick a day and an hour. A workspace can keep up to twenty schedules.";
  const r = kit(script, timestamps, 9.5);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.line).captions_timing, "anchored");
  checkLines(r.cues);
  const W = spokenWords(script).length;
  assert.deepEqual(cueWords(r.cues), spokenWords(script));
  assert.ok(Math.abs(r.cues[0].start - a) < 0.0005, `first cue at ${r.cues[0].start}, first letter at ${a}`);
  assert.ok(Math.abs(r.cues.at(-1).end - b) < 0.0005, `last cue ends at ${r.cues.at(-1).end}, last letter at ${b}`);
  r.cues.forEach((c, i) => {
    if (i) assert.equal(c.start, r.cues[i - 1].end, "back to back");
    const words = cueWords([c]).length;
    assert.ok(Math.abs(c.end - c.start - (words / W) * (b - a)) < 0.002, `${c.lines.join(" ")}: ${c.end - c.start} s for ${words} of ${W} words`);
  });
});

test("measured: no timestamps, so the cues run back to back from 0 to V", () => {
  const script = "[warm] Hello there, friend. This is a short test of the measured path.";
  const r = kit(script, undefined, 4.2);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.line).captions_timing, "measured");
  assert.equal(r.cues[0].start, 0);
  assert.equal(r.cues.at(-1).end, 4.2);
  const W = spokenWords(script).length;
  r.cues.forEach((c, i) => {
    if (i) assert.equal(c.start, r.cues[i - 1].end);
    assert.ok(Math.abs(c.end - c.start - (cueWords([c]).length / W) * 4.2) < 0.002);
  });
  // Empty timestamps are no timestamps.
  assert.equal(JSON.parse(kit(script, [], 4.2).line).captions_timing, "measured");
});

test("cues: two lines of at most 42 characters; a sentence that fits stays whole", () => {
  const script =
    "Short sentences stay whole. " +
    "This much longer sentence keeps going well past what two caption lines can hold, with commas in the middle, and with a phrase that runs on and on without a break anywhere in sight for the cutter to use. " +
    "Supercalifragilisticexpialidocious-extraordinarily-long-compound-word stands alone.";
  const r = kit(script, undefined, 20);
  assert.equal(r.status, 0, r.stderr);
  for (const c of r.cues) {
    assert.ok(c.lines.length <= 2);
    for (const l of c.lines) assert.ok(l.length <= 42 || !l.includes(" "), `a line of ${l.length} characters: ${l}`);
  }
  assert.deepEqual(cueWords(r.cues), spokenWords(script));
  assert.deepEqual(r.cues[0].lines, ["Short sentences stay whole."]);
});

test("no timestamps and no length: exit 2, and no captions file", () => {
  const r = kit("[warm] Nothing tells when this voice ends.", undefined, undefined);
  assert.equal(r.status, 2);
  assert.equal(r.vtt, null);
  assert.match(r.stderr, /length is unknown/);
});
