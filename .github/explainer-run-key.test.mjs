// The explainer's run keys (templates/explainer-video/skills/explainer-video/kit/run-key.mjs) come from code, because a
// model making its own stem miscounts: a run wrote the 9-character stem `q7m2destv`, fal refused both first jobs, and
// the run made a second stem and sent them again. These tests hold what the template and its fake fal depend on:
// - a fresh run gets one stem of 8 lowercase letters and digits, written to media/run-keys.json as {"stem": ...};
// - a resumed run (a valid stem in the file) reuses it, and the file is never rewritten;
// - every step's key is ev-<stem>-<step>, matching the fake fal's pattern;
// - a file holding anything else (the 9-character stem among them) is refused and never overwritten, since a second
//   stem would orphan the jobs already sent under the first;
// - an unknown or missing step is refused; every refusal exits non-zero and writes nothing.
// They need only node.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRoot } from "./temp-root.mjs";

const KIT = new URL("../templates/explainer-video/skills/explainer-video/kit/run-key.mjs", import.meta.url).pathname;
const STEPS = ["portrait", "voiceover", "voiceover-2", "avatar"];
// The fake fal's pattern for this template's keys (evals/*/fixtures/fal-mcp.json).
const FAKE = /^ev-[a-z0-9]{8}-(portrait|voiceover|voiceover-2|avatar)$/;
const root = tempRoot("ev-run-key-");
let n = 0;

/** A run folder; `keys` (a string) is written to media/run-keys.json when given. */
function runDir(keys) {
  const dir = join(root, String(n++));
  mkdirSync(dir, { recursive: true });
  if (keys !== undefined) {
    mkdirSync(join(dir, "media"));
    writeFileSync(join(dir, "media", "run-keys.json"), keys);
  }
  return dir;
}

/** Every path under `dir` with its bytes, so a refusal that writes anything shows. */
function snapshot(dir) {
  return readdirSync(dir, { recursive: true })
    .map(String)
    .sort()
    .map((p) => {
      const full = join(dir, p);
      let bytes = "";
      try {
        bytes = readFileSync(full, "utf8");
      } catch {}
      return `${p}\n${bytes}`;
    })
    .join("\n--\n");
}

function key(dir, ...args) {
  const r = spawnSync(process.execPath, [KIT, ...args], { cwd: dir, encoding: "utf8" });
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, line: r.stdout.trim() ? JSON.parse(r.stdout.trim().split("\n")[0]) : null };
}

const stemIn = (dir) => JSON.parse(readFileSync(join(dir, "media", "run-keys.json"), "utf8")).stem;

function refused(dir, args, why) {
  const before = snapshot(dir);
  const r = spawnSync(process.execPath, [KIT, ...args], { cwd: dir, encoding: "utf8" });
  assert.notEqual(r.status, 0, `${why}: refused with a non-zero exit, got ${r.status}: ${r.stdout}`);
  assert.notEqual(r.status, null, `${why}: it exits, not killed`);
  assert.doesNotMatch(r.stdout, /"key"/, `${why}: no key printed`);
  assert.match(r.stderr, /send no paid job/i, `${why}: says no paid job may be sent`);
  assert.equal(snapshot(dir), before, `${why}: a refusal writes nothing`);
  return r;
}

test("a fresh run gets one stem of 8 lowercase letters and digits, written as {\"stem\": ...}", () => {
  const dir = runDir();
  const r = key(dir, "--step", "portrait");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.line.stem, /^[a-z0-9]{8}$/);
  assert.deepEqual(JSON.parse(readFileSync(join(dir, "media", "run-keys.json"), "utf8")), { stem: r.line.stem });
  assert.equal(r.line.key, `ev-${r.line.stem}-portrait`);
  assert.match(r.line.key, FAKE);
});

test("two fresh runs get different stems", () => {
  const a = key(runDir(), "--step", "portrait").line.stem;
  const b = key(runDir(), "--step", "portrait").line.stem;
  assert.notEqual(a, b);
});

test("every step's key is ev-<stem>-<step> on the one stem, in the fake fal's pattern", () => {
  const dir = runDir();
  const stems = new Set();
  for (const step of STEPS) {
    const r = key(dir, "--step", step);
    assert.equal(r.status, 0, r.stderr);
    stems.add(r.line.stem);
    assert.equal(r.line.key, `ev-${r.line.stem}-${step}`);
    assert.match(r.line.key, FAKE);
  }
  assert.equal(stems.size, 1, "one stem per run");
  assert.equal(stemIn(dir), [...stems][0]);
});

test("a resumed run reuses the stem in media/run-keys.json and never rewrites the file", () => {
  const text = '{"stem": "k3v9q2xa"}\n';
  const dir = runDir(text);
  for (const step of STEPS) {
    const r = key(dir, "--step", step);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.line.stem, "k3v9q2xa");
    assert.equal(r.line.key, `ev-k3v9q2xa-${step}`);
  }
  assert.equal(readFileSync(join(dir, "media", "run-keys.json"), "utf8"), text);
});

test("the 9-character stem q7m2destv is refused, not overwritten, and the message says why", () => {
  const dir = runDir('{"stem": "q7m2destv"}');
  const r = refused(dir, ["--step", "portrait"], "q7m2destv");
  assert.match(r.stderr, /second stem/i);
  assert.equal(readFileSync(join(dir, "media", "run-keys.json"), "utf8"), '{"stem": "q7m2destv"}');
});

for (const [why, text] of [
  ["7 characters", '{"stem": "q7m2des"}'],
  ["an upper-case letter", '{"stem": "Q7m2dest"}'],
  ["a dash", '{"stem": "q7m2-est"}'],
  ["a number, not a string", '{"stem": 12345678}'],
  ["another field beside the stem", '{"stem": "q7m2dest", "date": "2026-11-27"}'],
  ["no stem", '{"key": "ev-q7m2dest-portrait"}'],
  ["a list", '["q7m2dest"]'],
  ["a bare string", '"q7m2dest"'],
  ["not JSON", "stem: q7m2dest"],
  ["an empty file", ""],
]) {
  test(`a run-keys file with ${why} is refused and never overwritten`, () => {
    const r = refused(runDir(text), ["--step", "voiceover"], why);
    assert.match(r.stderr, /media\/run-keys\.json/, "names the file");
  });
}

test("an unknown or missing step is refused, and a fresh run's folder stays empty", () => {
  for (const args of [["--step", "voiceover-3"], ["--step", "Portrait"], ["--step", ""], ["--step"], []]) {
    const dir = runDir();
    const r = refused(dir, args, JSON.stringify(args));
    assert.match(r.stderr, /portrait, voiceover, voiceover-2 or avatar/, "names the steps");
    assert.equal(existsSync(join(dir, "media", "run-keys.json")), false);
  }
});

test("an unknown step is refused on a resumed run too, the file untouched", () => {
  refused(runDir('{"stem": "k3v9q2xa"}'), ["--step", "video"], "--step video");
});
