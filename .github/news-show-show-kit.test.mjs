// The news show kit's build-show.mjs and each segment's `timestamps` in film/show.json. The run files each completed fal
// job's whole result at evidence/fal/<request_id>.json, so a segment names its voice's filed result and the kit takes its
// `timestamps` from it: the model never retypes nine long lists of per-character times. A copy retyped by a model drifts
// (a chunk of 32 characters with 31 starts), and the build used to swallow it: a file it could not read, one missing or
// one that was not fal's chunks timed that segment's captions as `measured`, and nothing said so. These tests hold:
// - a voice's filed result captions exactly as the bare list does; null timestamps (in show.json or in the result) are
//   measured, as before;
// - a result object outside the run's evidence/fal/ (work/evidence/fal/ included, or reached through a link there),
//   another job's result, a named file that isn't there, a list that isn't fal's chunks or whose chunks are uneven, and a
//   list typed into show.json: exit 3, nothing written, and the message says what to pass;
// - a build that succeeds writes film/captions-source.json: each segment's method and the request_id of the result it
//   read ("bare list" for a list, null for none), small enough that a grader's cut input shows it whole.
// They need ffmpeg and ffprobe on PATH (the evals-parse workflow installs ffmpeg). Every input is synthetic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { tempRoot } from "./temp-root.mjs";

const KIT = new URL("../templates/news-show/skills/news-show/kit/", import.meta.url).pathname;
const ORDER = ["cold-open", "headlines", "lead-a", "story-a", "lead-b", "story-b", "lead-c", "story-c", "closing"];
const SCRIPTS = {
  "cold-open": "[warm] Good morning. I'm Rowan, an AI-generated anchor, and this is The Daily Desk.",
  headlines: "Rail ridership tops a million. Night buses run more often. Line four opens two stations.",
  "lead-a": "First, the airport rail link.",
  "story-a": "TransitWire reports the link carried its one millionth rider on Sunday.",
  "lead-b": "Next, night buses.",
  "story-b": "The N9 will run every fifteen minutes from January, the agency says.",
  "lead-c": "And finally, Line four.",
  "story-c": "Two new stations opened on Line four, TransitWire reports.",
  closing: "Sources are in the description. This show is AI-generated. Back tomorrow.",
};
// Each voice's request id, as fal would answer it.
const ID = Object.fromEntries(ORDER.map((name, i) => [name, `${String(i + 1).repeat(8)}-aaaa-4bbb-8ccc-${String(i + 1).padStart(12, "0")}`]));
const STEP = 0.05;
// fal's timestamps for a script: every character (tags, spaces and punctuation included), in chunks of 16.
const chunksOf = (script) => {
  const chars = [...script];
  const out = [];
  for (let i = 0; i < chars.length; i += 16) {
    const part = chars.slice(i, i + 16);
    out.push({
      characters: part,
      character_start_times_seconds: part.map((_, k) => Math.round((i + k) * STEP * 1000) / 1000),
      character_end_times_seconds: part.map((_, k) => Math.round((i + k + 1) * STEP * 1000) / 1000),
    });
  }
  return out;
};
const audioOf = (name) => ({ url: `https://v3.fal.media/files/zebra/${name}.mp3`, content_type: "audio/mpeg", file_name: "output.mp3", file_size: 40000 });
const resultOf = (name) => ({ audio: audioOf(name), timestamps: chunksOf(SCRIPTS[name]) });
const filedPath = (name) => `evidence/fal/${ID[name]}.json`;
const listPath = (name) => `media/voice-${name}-timestamps.json`;

const root = tempRoot("ns-show-");
// The nine voices, made once: PCM in a WAV container under the voice's name, as long as its script's timestamps and a
// little more. ffprobe probes by content and reads its length.
const VOICES = join(root, "voices");
mkdirSync(VOICES);
for (const name of ORDER) {
  const seconds = [...SCRIPTS[name]].length * STEP + 0.3;
  const r = spawnSync("ffmpeg", ["-v", "error", "-nostdin", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", seconds.toFixed(3), "-c:a", "pcm_s16le", "-f", "wav", join(VOICES, `voice-${name}.mp3`)], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
}

let n = 0;
/** A run's folder with the kit copied to film/ as the skill does, the voices in media/, `files` (path in the folder to
 *  JSON value) written, and film/show.json whose segment `name` has `timestamps: at(name)`. Runs the build from that
 *  folder, as the agent does. `links` (path in the folder to the path it points at, relative to the link's folder) are
 *  made after the files. */
function build(at, files = {}, links = {}) {
  const dir = join(root, `run-${n++}`);
  mkdirSync(join(dir, "media"), { recursive: true });
  cpSync(KIT, join(dir, "film"), { recursive: true });
  cpSync(VOICES, join(dir, "media"), { recursive: true });
  for (const [rel, value] of Object.entries(files)) {
    mkdirSync(join(dir, dirname(rel)), { recursive: true });
    writeFileSync(join(dir, rel), typeof value === "string" ? value : JSON.stringify(value));
  }
  for (const [rel, target] of Object.entries(links)) {
    mkdirSync(join(dir, dirname(rel)), { recursive: true });
    symlinkSync(target, join(dir, rel));
  }
  const segments = ORDER.map((name) => {
    const g = { name, script: SCRIPTS[name], voice: `media/voice-${name}.mp3`, timestamps: at(name) };
    if (["cold-open", "lead-a", "lead-b", "lead-c", "closing"].includes(name)) Object.assign(g, { anchor: null, chyron: "Transit today" });
    if (name === "headlines") g.lines = ["Rail link tops a million", "N9 every 15 minutes", "Line 4 opens two stations"];
    if (name.startsWith("story-")) Object.assign(g, { headline: "A transit story", source: "TransitWire, November 22", facts: [{ text: "1,000,000", label: "riders" }], chyron: "Transit today" });
    return g;
  });
  const show = { show: { name: "The Daily Desk", date_label: "Monday, November 23", anchor_name: "Rowan", anchor_image: null }, segments };
  writeFileSync(join(dir, "film/show.json"), JSON.stringify(show, null, 1));
  const r = spawnSync(process.execPath, ["film/build-show.mjs", "--show", "film/show.json", "--film", "film", "--vtt", "media/show.vtt"], { cwd: dir, encoding: "utf8" });
  const read = (rel) => (existsSync(join(dir, rel)) ? readFileSync(join(dir, rel), "utf8") : null);
  const report = r.status === 0 ? JSON.parse(r.stdout.split("\n")[0]) : null;
  return {
    status: r.status,
    stderr: r.stderr,
    report,
    methods: report ? Object.fromEntries(report.segments.map((s) => [s.name, s.method])) : null,
    vtt: read("media/show.vtt"),
    words: read("film/words.json"),
    captions: read("film/compositions/captions.html"),
    source: read("film/captions-source.json"),
    // What a refused build must not have written: any of the project's outputs.
    wrote: ["media/show.vtt", "film/index.html", "film/words.json", "film/timeline.json", "film/captions-source.json", "film/assets", "film/compositions", "film/card"].filter((p) => existsSync(join(dir, p))),
  };
}
const allFiled = () => Object.fromEntries(ORDER.map((name) => [filedPath(name), resultOf(name)]));
const refused = (r) => {
  assert.equal(r.status, 3, `exit ${r.status}: ${r.stderr}`);
  assert.deepEqual(r.wrote, [], `a refused build wrote ${r.wrote.join(", ")}`);
};

test("the bare lists, one per voice: every segment aligned (the base the filed results must match)", () => {
  const r = build(listPath, Object.fromEntries(ORDER.map((name) => [listPath(name), chunksOf(SCRIPTS[name])])));
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.report.method, "aligned");
});

test("each voice's result filed at evidence/fal/<request_id>.json: the kit takes its timestamps, and captions as from the lists", () => {
  const lists = build(listPath, Object.fromEntries(ORDER.map((name) => [listPath(name), chunksOf(SCRIPTS[name])])));
  const filed = build(filedPath, allFiled());
  assert.equal(filed.status, 0, filed.stderr);
  assert.equal(filed.report.method, "aligned");
  assert.equal(filed.vtt, lists.vtt);
  assert.equal(filed.words, lists.words);
  assert.equal(filed.captions, lists.captions);
});

test("null timestamps, in show.json or as fal answered them in the filed result: that segment is measured, not an error", () => {
  const files = allFiled();
  files[filedPath("story-b")] = { audio: audioOf("story-b"), timestamps: null };
  const r = build((name) => (name === "lead-c" ? null : filedPath(name)), files);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.methods["story-b"], "measured");
  assert.equal(r.methods["lead-c"], "measured");
  assert.equal(r.methods["story-a"], "aligned");
  assert.equal(r.report.method, "measured");
});

test("a result object outside evidence/fal/ (a copy under media/): exit 3, nothing written, and it names the file to pass", () => {
  const files = allFiled();
  files[listPath("lead-a")] = resultOf("lead-a");
  const r = build((name) => (name === "lead-a" ? listPath(name) : filedPath(name)), files);
  refused(r);
  assert.match(r.stderr, /lead-a/);
  assert.match(r.stderr, /evidence\/fal\/<request_id>\.json/);
});

test("a result object under a nested evidence/fal/ (work/evidence/fal/) is not the run's: exit 3, nothing written", () => {
  const files = allFiled();
  files[`work/evidence/fal/${ID["story-c"]}.json`] = resultOf("story-c");
  const r = build((name) => (name === "story-c" ? `work/evidence/fal/${ID[name]}.json` : filedPath(name)), files);
  refused(r);
  assert.match(r.stderr, /story-c/);
  assert.match(r.stderr, /evidence\/fal\/<request_id>\.json/);
});

test("another job's filed result (the still's {images, description}): exit 3, nothing written, and it says it is not a voice's", () => {
  const still = "5c5c5c5c-aaaa-4bbb-8ccc-000000000001";
  const files = { ...allFiled(), [`evidence/fal/${still}.json`]: { images: [{ url: "https://v3.fal.media/files/koala/p.png" }], description: "" } };
  const r = build((name) => (name === "headlines" ? `evidence/fal/${still}.json` : filedPath(name)), files);
  refused(r);
  assert.match(r.stderr, /headlines/);
  assert.match(r.stderr, /not a voice's result/);
});

test("a named file that is not in the run's files, while others are filed: exit 3, nothing written, it lists them and never says to write a copy", () => {
  const files = allFiled();
  delete files[filedPath("closing")];
  const r = build(filedPath, files);
  refused(r);
  assert.match(r.stderr, /closing/);
  assert.match(r.stderr, new RegExp(`holds [^]*${ID["lead-a"]}\\.json`));
  assert.doesNotMatch(r.stderr, /-timestamps\.json/);
});

test("a named file that is not there and nothing filed (a server that files none): exit 3, and it says where to write fal's list", () => {
  const r = build(filedPath, {});
  refused(r);
  assert.match(r.stderr, /files none/);
  assert.match(r.stderr, /media\/voice-cold-open-timestamps\.json/);
});

test("a filed result whose chunks are uneven: exit 3 and nothing written, never captions timed another way", () => {
  const files = allFiled();
  const cut = resultOf("story-a");
  cut.timestamps[2].character_end_times_seconds.pop();
  files[filedPath("story-a")] = cut;
  const r = build(filedPath, files);
  refused(r);
  assert.match(r.stderr, /story-a/);
  assert.match(r.stderr, /chunk 3 has 16 characters, 16 starts and 15 ends/);
});

test("a bare list whose chunks are uneven (a retyped copy on a server that files none): exit 3, nothing written", () => {
  const lists = Object.fromEntries(ORDER.map((name) => [listPath(name), chunksOf(SCRIPTS[name])]));
  lists[listPath("headlines")][1].character_start_times_seconds.pop();
  const r = build(listPath, lists);
  refused(r);
  assert.match(r.stderr, /headlines/);
  assert.match(r.stderr, /chunk 2 has 16 characters, 15 starts and 16 ends/);
});

test("a timestamps file holding false, 0 or an empty string (not fal's answer): exit 3, nothing written, never measured", () => {
  for (const [name, value] of [["story-a", false], ["lead-b", 0], ["closing", '""']]) {
    const lists = Object.fromEntries(ORDER.map((n) => [listPath(n), chunksOf(SCRIPTS[n])]));
    lists[listPath(name)] = value;
    const r = build(listPath, lists);
    refused(r);
    assert.match(r.stderr, new RegExp(name));
    assert.match(r.stderr, /is not fal's timestamps/);
  }
});

test("a timestamps file that is not JSON: exit 3, nothing written", () => {
  const lists = Object.fromEntries(ORDER.map((name) => [listPath(name), chunksOf(SCRIPTS[name])]));
  lists[listPath("lead-b")] = '[{"characters": ["N", "e"';
  const r = build(listPath, lists);
  refused(r);
  assert.match(r.stderr, /lead-b/);
});

test("fal's list typed into show.json instead of a path: exit 3, nothing written, and it names the file to pass", () => {
  const r = build((name) => (name === "cold-open" ? chunksOf(SCRIPTS[name]) : filedPath(name)), allFiled());
  refused(r);
  assert.match(r.stderr, /cold-open/);
  assert.match(r.stderr, /evidence\/fal\/<request_id>\.json/);
});

// film/captions-source.json is what a grader reads to see where each segment's timestamps came from. The other files a
// grader is shown are cut to a share of its input (about 1,380 characters each in a news-show run with fal's results
// filed); a file under 1,000 bytes is shown whole.
const SOURCE_MAX_BYTES = 1000;
const sourceOf = (r) => {
  assert.notEqual(r.source, null, "the build wrote no film/captions-source.json");
  return JSON.parse(r.source);
};

test("film/captions-source.json: each segment's method and the request_id of the result it read, under the size a grader shows whole", () => {
  const r = build(filedPath, allFiled());
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(sourceOf(r), Object.fromEntries(ORDER.map((name) => [name, { method: "aligned", request_id: ID[name] }])));
  assert.ok(Buffer.byteLength(r.source) <= SOURCE_MAX_BYTES, `film/captions-source.json is ${Buffer.byteLength(r.source)} bytes`);
});

test("film/captions-source.json says \"bare list\" for a list, null for no timestamps, and keeps a result's request_id when fal gave it none", () => {
  const files = allFiled();
  files[filedPath("story-b")] = { audio: audioOf("story-b"), timestamps: null };
  files[listPath("lead-a")] = chunksOf(SCRIPTS["lead-a"]);
  const r = build((name) => (name === "lead-c" ? null : name === "lead-a" ? listPath(name) : filedPath(name)), files);
  assert.equal(r.status, 0, r.stderr);
  const source = sourceOf(r);
  assert.deepEqual(source["lead-a"], { method: "aligned", request_id: "bare list" });
  assert.deepEqual(source["lead-c"], { method: "measured", request_id: null });
  assert.deepEqual(source["story-b"], { method: "measured", request_id: ID["story-b"] });
  assert.deepEqual(source["story-a"], { method: "aligned", request_id: ID["story-a"] });
  // The worst case for its size: the longest method on every segment, each with a full request_id.
  const worst = build(filedPath, Object.fromEntries(ORDER.map((name) => [filedPath(name), { audio: audioOf(name), timestamps: null }])));
  assert.equal(worst.status, 0, worst.stderr);
  assert.deepEqual(sourceOf(worst), Object.fromEntries(ORDER.map((name) => [name, { method: "measured", request_id: ID[name] }])));
  assert.ok(Buffer.byteLength(worst.source) <= SOURCE_MAX_BYTES, `film/captions-source.json is ${Buffer.byteLength(worst.source)} bytes`);
});

test("film/captions-source.json names the result the build read, not the name show.json gives: a filed name that links to another filed result", () => {
  // lead-b's voice was answered twice (a retried job). show.json names the first request_id, and that name in
  // evidence/fal/ is a link to the second job's result, the file the build reads.
  const second = "6d6d6d6d-aaaa-4bbb-8ccc-000000000002";
  const files = { ...allFiled(), [`evidence/fal/${second}.json`]: resultOf("lead-b") };
  delete files[filedPath("lead-b")];
  const r = build(filedPath, files, { [filedPath("lead-b")]: `${second}.json` });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(sourceOf(r)["lead-b"], { method: "aligned", request_id: second });
});

test("a filed name that links to a result outside evidence/fal/ (a copy under media/): exit 3, nothing written", () => {
  const files = allFiled();
  delete files[filedPath("story-c")];
  files["media/story-c-result.json"] = resultOf("story-c");
  const r = build(filedPath, files, { [filedPath("story-c")]: "../../media/story-c-result.json" });
  refused(r);
  assert.match(r.stderr, /story-c/);
  assert.match(r.stderr, /evidence\/fal\/<request_id>\.json/);
});
