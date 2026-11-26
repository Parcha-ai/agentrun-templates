// The explainer's caption kit (templates/explainer-video/skills/explainer-video/kit/build-captions.mjs) cuts and times
// every cue in code, because a model timing cues by hand from fal's character timestamps put them off by hundredths of
// a second, or a whole second, and wrote lines over 42 characters. These tests hold what the template's rubrics depend
// on:
// - aligned: on three real ElevenLabs v3 takes, every cue runs from its first letter's start to its last letter's end.
//   This covers the two cues a grader failed by hand (one starting at 9.653 s, one ending at 28.240 s), and the take
//   whose first letter follows a [warm] tag at 0.32 s and whose last letter ends at 24.56 s.
// - a timestamps file that isn't fal's chunks (a retyped copy with a typo, uneven arrays, a time that's text): exit 3
//   and no file, never cues timed from the length. A live run's model retyped its timestamps with a typo, and the
//   kit then timed every cue from 0 to V.
// - anchored and measured: the cues run back to back, each lasting its share of the words.
// - every cue is one or two lines of at most 42 characters, in the script's order, with audio tags dropped. A word
//   longer than a line is cut after a hyphen or slash, else at 42, and its pieces keep its timing.
// - no length at all: exit 2, no file.
// They need only node. explainer-captions.fixtures.json holds the three takes, each the script sent and fal's
// `timestamps` as it answered them.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRoot } from "./temp-root.mjs";

const KIT = new URL("../templates/explainer-video/skills/explainer-video/kit/build-captions.mjs", import.meta.url).pathname;
const TAKES = JSON.parse(readFileSync(new URL("./explainer-captions.fixtures.json", import.meta.url), "utf8"));
const root = tempRoot("ev-captions-");
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

const key = (text) => text.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Walks fal's letters cue by cue: each cue owns the next run of letters its lines spell, and runs from the first
 *  one's start to the last one's end. */
function onLetters(cues, timestamps) {
  const L = letters(timestamps);
  let at = 0;
  for (const c of cues) {
    const count = key(c.lines.join(""));
    assert.ok(Math.abs(c.start - L[at].start) < 0.0005, `${c.lines.join(" ")} starts at ${c.start}, its first letter at ${L[at].start}`);
    assert.ok(Math.abs(c.end - L[at + count.length - 1].end) < 0.0005, `${c.lines.join(" ")} ends at ${c.end}, its last letter at ${L[at + count.length - 1].end}`);
    at += count.length;
  }
  assert.equal(at, L.length);
}

/** A take whose characters spell `text` exactly, one every 0.05 s from 0.2 s. */
function spelled(text) {
  const ch = [...text];
  return [{ characters: ch, character_start_times_seconds: ch.map((_, i) => 0.2 + i * 0.05), character_end_times_seconds: ch.map((_, i) => 0.25 + i * 0.05) }];
}

for (const name of ["take1", "take2", "take3"]) {
  test(`aligned (${name}): every cue runs from its first letter's start to its last letter's end`, () => {
    const { script, timestamps } = TAKES[name];
    const r = kit(script, timestamps, 40);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(r.line).captions_timing, "aligned");
    assert.ok(r.vtt.startsWith("WEBVTT\n"));
    checkLines(r.cues);
    assert.deepEqual(cueWords(r.cues), spokenWords(script));
    onLetters(r.cues, timestamps);
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

test("aligned: the take after a [warm] tag starts at its first letter, 0.32 s, and ends at its last, 24.56 s", () => {
  const r = kit(TAKES.take3.script, TAKES.take3.timestamps, 24.7);
  assert.equal(r.status, 0, r.stderr);
  const line = JSON.parse(r.line);
  assert.equal(line.captions_timing, "aligned");
  assert.equal(line.first_cue_start_s, 0.32);
  assert.equal(line.last_cue_end_s, 24.56);
  assert.equal(r.cues[0].start, 0.32);
  assert.equal(r.cues.at(-1).end, 24.56);
});

/** Runs the kit on take3's script with `text` as the timestamps file, and checks it refused: exit 3, no file. */
function refused(text) {
  const dir = join(root, String(n++));
  spawnSync("mkdir", ["-p", dir]);
  writeFileSync(join(dir, "script.txt"), TAKES.take3.script);
  writeFileSync(join(dir, "ts.json"), text);
  const r = spawnSync(process.execPath, [KIT, "--script", join(dir, "script.txt"), "--timestamps", join(dir, "ts.json"), "--audio-seconds", "24.7", "--vtt", join(dir, "explainer.vtt")], { encoding: "utf8" });
  assert.equal(r.status, 3, `exit ${r.status}: ${r.stdout.split("\n")[0]} ${r.stderr}`);
  assert.ok(!existsSync(join(dir, "explainer.vtt")), "no captions file");
  assert.match(r.stderr, /not fal's timestamps/);
  return r;
}

test("a retyped timestamps file with a typo: exit 3 and no file, not cues timed from 0 to V", () => {
  // The live run's copy: the same take with the model's typo in its third chunk (`"."); " "` for `".", " "`).
  const good = JSON.stringify(TAKES.take3.timestamps);
  const typo = '"t",".");" ","T"';
  assert.equal(good.split('"t","."," ","T"').length, 2, "the typo's place is in the take once");
  refused(good.replace('"t","."," ","T"', typo));
});

test("uneven arrays or a time that is not a number: exit 3 and no file", () => {
  const cut = structuredClone(TAKES.take3.timestamps);
  cut[2].character_end_times_seconds.pop();
  assert.match(refused(JSON.stringify(cut)).stderr, /chunk 3 has/);
  const text = structuredClone(TAKES.take3.timestamps);
  text[0].character_start_times_seconds[7] = "0.32";
  assert.match(refused(JSON.stringify(text)).stderr, /not a number/);
  const missing = structuredClone(TAKES.take3.timestamps);
  delete missing[1].character_start_times_seconds;
  refused(JSON.stringify(missing));
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

const LONG =
  "Short sentences stay whole. " +
  "This much longer sentence keeps going well past what two caption lines can hold, with commas in the middle, and with a phrase that runs on and on without a break anywhere in sight for the cutter to use. " +
  "Supercalifragilisticexpialidocious-extraordinarily-long-compound-word stands alone. " +
  "See https://example.com/a/very/long/path/that/keeps/going/on/and/on/index.html now. " +
  "Then Pneumonoultramicroscopicsilicovolcanoconiosisxxxxxxxxxxxxxxx ends.";

test("cues: two lines of at most 42 characters, a word longer than a line cut across lines; a sentence that fits stays whole", () => {
  const r = kit(LONG, undefined, 20);
  assert.equal(r.status, 0, r.stderr);
  checkLines(r.cues);
  // The cues keep every letter of the script, in order; a long word's pieces sit on consecutive lines.
  assert.equal(key(r.cues.map((c) => c.lines.join("")).join("")), key(LONG));
  const lines = r.cues.flatMap((c) => c.lines);
  assert.ok(lines.includes("Supercalifragilisticexpialidocious-"), `cut after the hyphen: ${lines.join(" / ")}`);
  assert.ok(lines.some((l) => l.endsWith("https://example.com/a/very/long/path/that/")), `cut after the slash: ${lines.join(" / ")}`);
  assert.ok(lines.includes("Pneumonoultramicroscopicsilicovolcanoconio"), `no hyphen or slash: cut at 42: ${lines.join(" / ")}`);
  assert.deepEqual(r.cues[0].lines, ["Short sentences stay whole."]);
  assert.equal(JSON.parse(r.line).words, spokenWords(LONG).length, "a cut word still counts once");
});

test("a word longer than a line keeps its timing: aligned pieces on their own letters, measured by their share of letters", () => {
  const aligned = kit(LONG, spelled(LONG), 0.25 + LONG.length * 0.05); // V: the take's last character's end
  assert.equal(aligned.status, 0, aligned.stderr);
  assert.equal(JSON.parse(aligned.line).captions_timing, "aligned");
  checkLines(aligned.cues);
  onLetters(aligned.cues, spelled(LONG));
  // Measured: back to back from 0 to V, each cue's time its words' share, a cut word's pieces sharing it by letters.
  const V = 20;
  const measured = kit(LONG, undefined, V);
  const W = spokenWords(LONG).length;
  // Walk the script's words in order: each token of a cue takes its letters' share of the word it comes from.
  const spoken = spokenWords(LONG).map(key);
  let word = 0;
  let used = 0;
  measured.cues.forEach((c, i) => {
    if (i) assert.equal(c.start, measured.cues[i - 1].end, "back to back");
    let share = 0;
    for (const t of c.lines.flatMap((l) => l.split(" "))) {
      const n = key(t).length;
      if (!n) continue;
      share += n / spoken[word].length;
      used += n;
      if (used === spoken[word].length) [word, used] = [word + 1, 0];
    }
    assert.ok(Math.abs(c.end - c.start - (share / W) * V) < 0.002, `${c.lines.join(" / ")}: ${c.end - c.start} s for ${share} of ${W} words`);
  });
  assert.equal(measured.cues.at(-1).end, V);
});

test("no timestamps and no length: exit 2, and no captions file", () => {
  const r = kit("[warm] Nothing tells when this voice ends.", undefined, undefined);
  assert.equal(r.status, 2);
  assert.equal(r.vtt, null);
  assert.match(r.stderr, /length is unknown/);
});
