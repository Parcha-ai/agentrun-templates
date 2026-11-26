// The music video kit's place step joins the clips into one video (assets/shots.mp4) so HyperFrames extracts one file:
// it runs every video's extraction at once, and six clips together ran a 4 GiB sandbox out of memory. These tests hold
// what that fix depends on: the join runs one FFmpeg at a time, its peak memory doesn't grow with the number of shots
// (a 12-shot 60 s film against a 6-shot 30 s one), the joined video tiles the cut frame for frame, and a still's part
// shows the still from its first frame.
// They need ffmpeg, ffprobe and python3 on PATH (the evals-parse workflow installs ffmpeg). Media is synthetic: no song, no clip from fal.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRoot } from "./temp-root.mjs";

const KIT = new URL("../templates/music-video/skills/music-video/kit/", import.meta.url).pathname;
const which = (bin) => spawnSync("sh", ["-c", `command -v ${bin}`], { encoding: "utf8" }).stdout.trim();
const REAL_FFMPEG = which("ffmpeg");
const root = tempRoot("mu-kit-");

// A PATH shim for ffmpeg: one JSON line per call with its start and end (monotonic), whether another call was running
// when it started, and the call's peak resident memory (the child's ru_maxrss, in KiB).
const shimDir = join(root, "bin");
mkdirSync(shimDir);
writeFileSync(join(shimDir, "ffmpeg"), `#!/usr/bin/env python3
import json, os, resource, subprocess, sys, time
log = os.environ["MU_SPAWN_LOG"]
lock = log + ".running"
try:
    os.close(os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY)); overlap = False
except FileExistsError:
    overlap = True
start = time.monotonic()
rc = subprocess.call([os.environ["MU_REAL_FFMPEG"]] + sys.argv[1:])
end = time.monotonic()
if not overlap:
    os.remove(lock)
kind = "concat" if "concat" in sys.argv else "song" if "-vn" in sys.argv else "part"
with open(log, "a") as f:
    f.write(json.dumps({"kind": kind, "start": start, "end": end, "overlap": overlap, "maxrss_kib": resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss, "rc": rc}) + "\\n")
sys.exit(rc)
`);
chmodSync(join(shimDir, "ffmpeg"), 0o755);

const ff = (...a) => {
  const r = spawnSync(REAL_FFMPEG, ["-v", "error", "-nostdin", "-y", ...a], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
};
// Kling-like media: 1924x1076 at 24 fps, a little longer than the shot; one clip short enough to be slowed.
const media = join(root, "media");
mkdirSync(media);
ff("-f", "lavfi", "-i", "testsrc2=s=1924x1076:r=24", "-t", "5.04", "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", join(media, "clip.mp4"));
ff("-f", "lavfi", "-i", "testsrc2=s=1924x1076:r=24", "-t", "4.3", "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", join(media, "short.mp4"));
ff("-f", "lavfi", "-i", "testsrc2=s=1024x576:r=1", "-frames:v", "1", join(media, "still.png"));
ff("-f", "lavfi", "-i", "sine=f=220:d=61", "-c:a", "libmp3lame", join(media, "song.mp3"));

// A film of n 5 s shots (the first and last can be given other lengths): shot 2 has no clip (its still with the
// push-in), shot 3's clip is short (slowed).
function film(n, last = 5, first = 5) {
  const dir = join(root, `film-${n}-${last}-${first}`);
  mkdirSync(join(dir, "assets"), { recursive: true });
  cpSync(join(KIT, "beats.mjs"), join(dir, "beats.mjs"));
  cpSync(join(KIT, "index.html"), join(dir, "index.html"));
  const len = (i) => (i === 0 ? first : i === n - 1 ? last : 5);
  const shots = [];
  for (let i = 0, at = 1; i < n; at += len(i), i++) shots.push({ n: i + 1, start_s: Math.round(at * 1000) / 1000, seconds: len(i) });
  const cut = Math.round(shots.reduce((sum, s) => sum + s.seconds, 0) * 1000) / 1000;
  const plan = { song: { path: join(media, "song.mp3"), seconds: 61 }, cut: { seconds: cut, start_s: 1, end_s: 1 + cut, shots }, aspect: "16:9", width: 1920, height: 1080, lyrics_on: false };
  writeFileSync(join(dir, "plan.json"), JSON.stringify(plan));
  for (const s of shots) {
    cpSync(join(media, "still.png"), join(dir, "assets", `still-${s.n}.png`));
    if (s.n !== 2) cpSync(join(media, s.n === 3 ? "short.mp4" : "clip.mp4"), join(dir, "assets", `clip-${s.n}.mp4`));
  }
  const log = join(root, `spawns-${n}-${last}-${first}.jsonl`);
  const r = spawnSync(process.execPath, [join(dir, "beats.mjs"), "place", "--film", dir], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${shimDir}:${process.env.PATH}`, MU_SPAWN_LOG: log, MU_REAL_FFMPEG: REAL_FFMPEG },
  });
  assert.equal(r.status, 0, `place exited ${r.status}: ${r.stderr}`);
  const spawns = readFileSync(log, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  return { dir, out: JSON.parse(r.stdout.trim().split("\n").pop()), spawns, html: readFileSync(join(dir, "index.html"), "utf8") };
}

const probe = (path) => JSON.parse(spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=nb_frames,width,height,r_frame_rate", "-of", "json", path], { encoding: "utf8" }).stdout).streams[0];
// The mean luma of frame i of a video, read at 64x36 in gray (black is about 16).
const luma = (path, i) => {
  const r = spawnSync(REAL_FFMPEG, ["-v", "error", "-nostdin", "-i", path, "-vf", `select=eq(n\\,${i}),scale=64:36,format=gray`, "-frames:v", "1", "-f", "rawvideo", "-"], { maxBuffer: 1 << 20 });
  assert.equal(r.status, 0, String(r.stderr));
  assert.equal(r.stdout.length, 64 * 36, `frame ${i} of ${path} was not read`);
  return r.stdout.reduce((sum, b) => sum + b, 0) / r.stdout.length;
};
const six = film(6);
const twelve = film(12);
const odd = film(3, 5.041);
const late = film(3, 5, 5.403);

test("the join runs one ffmpeg at a time", () => {
  for (const { spawns } of [six, twelve]) {
    assert.ok(spawns.every((s) => !s.overlap && s.rc === 0), JSON.stringify(spawns));
    const byStart = [...spawns].sort((a, b) => a.start - b.start);
    for (let i = 1; i < byStart.length; i++) assert.ok(byStart[i].start >= byStart[i - 1].end, `ffmpeg call ${i} started before call ${i - 1} ended`);
  }
  // One part per shot, one concat, one song segment: nothing else spawns ffmpeg.
  assert.deepEqual(six.spawns.map((s) => s.kind), [...Array(6).fill("part"), "concat", "song"]);
  assert.deepEqual(twelve.spawns.map((s) => s.kind), [...Array(12).fill("part"), "concat", "song"]);
});

test("a 12-shot 60 s film goes through the join with the memory of a 6-shot one", () => {
  const peak = (f) => Math.max(...f.spawns.map((s) => s.maxrss_kib));
  const p6 = peak(six), p12 = peak(twelve);
  // Calls run one at a time, so the step's peak is its largest call's; it must not grow with the shot count.
  assert.ok(p12 <= p6 * 1.25 + 20 * 1024, `12 shots peaked at ${p12} KiB, 6 shots at ${p6} KiB`);
  // One call stays far under what an extraction took in the box (about 700 MB each, six at once in 4 GiB).
  assert.ok(p12 < 600 * 1024, `one ffmpeg call peaked at ${p12} KiB`);
});

test("the joined video tiles the cut frame for frame, and is the film's only video", () => {
  for (const [f, n] of [[six, 6], [twelve, 12]]) {
    const v = probe(join(f.dir, "assets", "shots.mp4"));
    assert.equal(Number(v.nb_frames), n * 5 * 30);
    assert.equal(v.width, 1920);
    assert.equal(v.height, 1080);
    assert.equal(v.r_frame_rate, "30/1");
    assert.equal(f.out.joined_frames, n * 5 * 30);
    assert.equal((f.html.match(/<video\b/g) || []).length, 1);
    assert.match(f.html, /<video id="shots" class="clip mu-shot" src="assets\/shots.mp4" data-start="0" data-duration="\d+"/);
    assert.match(f.html, /<div id="shot-2" class="clip mu-hold" data-start="5" data-duration="5"[^>]*><img id="shot-2-img" src="assets\/still-2.png"/);
    assert.match(f.html, /<div id="shot-1" class="clip mu-cut" data-start="0" data-duration="5" data-track-index="1" data-clip="assets\/clip-1.mp4"><\/div>/);
    assert.deepEqual(f.out.stills.map((s) => s.n), [2]);
    assert.deepEqual(f.out.slowed.map((s) => s.n), [3]);
    assert.ok(!existsSync(join(f.dir, "join")), "the parts folder is removed after the join");
  }
});

test("a cut that ends between frames is joined to the frames HyperFrames renders: ceil(cut x 30)", () => {
  // 15.041 s at 30 fps is 451.23 frames; HyperFrames renders 452 (a 30.041 s cut rendered as 902), so the joined video
  // must hold 452 or the film's last frame falls past its end.
  assert.equal(Number(probe(join(odd.dir, "assets", "shots.mp4")).nb_frames), 452);
  assert.equal(odd.out.joined_frames, 452);
  assert.match(odd.html, /<div id="shot-3" class="clip mu-cut" data-start="10" data-duration="5.041"/);
});

test("a still that starts between frames shows from its part's first frame, not black", () => {
  // Shot 2 (the still) starts at 5.403 s; its part of the joined video starts on the rounded frame, 162 (5.400 s), a
  // little before the still's element appears. That frame must already be the still, the same picture as the middle of
  // the part, so no frame of black flashes at the cut.
  const v = join(late.dir, "assets", "shots.mp4");
  assert.match(late.html, /<div id="shot-2" class="clip mu-hold" data-start="5.403" data-duration="5"/);
  assert.equal(late.out.joined_frames, Math.ceil(15.403 * 30));
  const first = luma(v, 162), mid = luma(v, 237);
  assert.ok(first > 40, `frame 162 (the still's first) has mean luma ${first.toFixed(1)}: black`);
  assert.ok(Math.abs(first - mid) < 3, `frame 162 (luma ${first.toFixed(1)}) is not the still shown at frame 237 (luma ${mid.toFixed(1)})`);
});

// ---------- clips: every clip's input built from the storyboard and the plan ----------
// A grader reads a run's calls cut to fit its prompt, so a clip's prompt and negative_prompt can be cut out of what it
// sees. The kit's clips command builds each clip's input from the storyboard's motion and the plan, prints each
// submit_job for the run to send as printed, and writes them to media/clips.json, small enough to reach a grader whole.
const NEGATIVE = "text, letters, words, captions, subtitles, logo, watermark, signage, brand, real person, celebrity, blur, distortion, low quality";
const KLING = "fal-ai/kling-video/v3/pro/image-to-video";
let runs = 0;
// A run prices its plan before any still or clip (the kit's price, with no ceiling: film/price.json, fits) and saves
// its key stem (media/run-keys.json).
function priced(dir, stem = "abcd1234") {
  writeFileSync(join(dir, "media", "run-keys.json"), JSON.stringify({ stem }) + "\n");
  const r = spawnSync(process.execPath, ["film/beats.mjs", "price", "--film", "film", "--rates", RATES], { cwd: dir, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
}
function clipsRun({ shots = [6, 4, 6], lines, stills, stem = "abcd1234" } = {}) {
  const dir = join(root, `clips-${++runs}`);
  mkdirSync(join(dir, "film"), { recursive: true });
  mkdirSync(join(dir, "media"));
  cpSync(join(KIT, "beats.mjs"), join(dir, "film", "beats.mjs"));
  let at = 8.254;
  const planShots = shots.map((seconds, i) => {
    const s = { n: i + 1, start_s: Math.round(at * 1000) / 1000, end_s: Math.round((at + seconds) * 1000) / 1000, seconds, bars: 2, partial: false, clip_seconds: Math.max(3, Math.ceil(seconds)) };
    at += seconds;
    return s;
  });
  const total = shots.reduce((t, s) => t + s, 0);
  writeFileSync(join(dir, "film", "plan.json"), JSON.stringify({ song: { path: "media/song.wav", seconds: 80, minutes: 80 / 60 }, cut: { seconds: total, start_s: 8.254, end_s: 8.254 + total, shots: planShots }, aspect: "16:9", width: 1920, height: 1080, lyrics_on: true }));
  let clock = 0;
  const shotLines = lines ?? planShots.map((s) => {
    const line = `${s.n} | ${clock}-${clock + s.seconds} s | ${s.seconds} s | lyric: "none" | picture: a paper ferry ${s.n} on teal water | motion: slow push in ${s.n}`;
    clock += s.seconds;
    return line;
  });
  writeFileSync(join(dir, "storyboard.md"), ["Style: cut paper, teal and amber", ...shotLines].join("\n") + "\n");
  priced(dir);
  const urls = stills ?? planShots.map((s) => `https://v3.fal.media/files/rabbit/still${s.n}.png`);
  const r = spawnSync(process.execPath, ["film/beats.mjs", "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", stem, "--stills", urls.join(","), "--file", "media/clips.json"], { cwd: dir, encoding: "utf8" });
  const file = join(dir, "media", "clips.json");
  return { r, dir, file: existsSync(file) ? readFileSync(file, "utf8") : undefined };
}
const sent = (stdout) => stdout.trim().split("\n").filter((l) => l.startsWith("submit_job ")).map((l) => JSON.parse(l.slice("submit_job ".length)));

test("clips prints each clip's submit_job from the storyboard's motion and the plan's clip seconds", () => {
  const { r } = clipsRun();
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(sent(r.stdout), [1, 2, 3].map((n) => ({
    endpoint_id: KLING,
    submission_key: `mu-abcd1234-clip-${n}`,
    input: { prompt: `slow push in ${n}, the scene as it is`, start_image_url: `https://v3.fal.media/files/rabbit/still${n}.png`, duration: String([6, 4, 6][n - 1]), generate_audio: false, negative_prompt: NEGATIVE },
  })));
});

test("clips writes media/clips.json: the fixed fields once, then every clip's key, duration, prompt and still, the same as printed", () => {
  const { r, file } = clipsRun();
  assert.equal(r.status, 0, r.stderr);
  const record = JSON.parse(file);
  assert.equal(record.endpoint_id, KLING);
  assert.deepEqual(record.every_clip, { generate_audio: false, negative_prompt: NEGATIVE });
  assert.deepEqual(record.clips.map((c) => c.n), [1, 2, 3]);
  // Each clip's whole input is its own fields and every_clip's: what the command printed for it.
  assert.deepEqual(record.clips.map((c) => ({ endpoint_id: record.endpoint_id, submission_key: c.key, input: { prompt: c.prompt, start_image_url: c.start_image_url, duration: c.duration, ...record.every_clip } })), sent(r.stdout));
});

test("a 12-clip media/clips.json stays small enough to reach a grader whole", () => {
  const motion = "camera slowly rises and turns as the paper wake spreads behind the ferry toward the dock";
  const shots = Array(12).fill(5);
  let clock = 0;
  const lines = shots.map((s, i) => `${i + 1} | ${clock}-${(clock += s)} s | ${s} s | lyric: "none" | picture: a paper harbor | motion: ${motion}`);
  const stills = shots.map((_, i) => `https://v3.fal.media/files/rabbit/RsedDXBYySaZbCPxSNh${String(i).padStart(2, "0")}.png`);
  const { r, file } = clipsRun({ shots, lines, stills });
  assert.equal(r.status, 0, r.stderr);
  // One line per clip, the 133-character negative prompt once: about 230 bytes a clip.
  assert.ok(Buffer.byteLength(file) < 3500, `media/clips.json is ${Buffer.byteLength(file)} bytes`);
  assert.equal(sent(r.stdout).length, 12);
});

test("clips refuses a storyboard that doesn't hold the plan's shots, a shot with no motion, or a still list that doesn't match", () => {
  const cases = [
    [{ lines: ['1 | 0-6 s | 6 s | lyric: "none" | picture: a | motion: drift', '2 | 6-10 s | 4 s | lyric: "none" | picture: b | motion: drift'] }, /storyboard\.md holds 2 shot lines, the plan 3/],
    [{ lines: ['1 | 0-6 s | 6 s | lyric: "none" | picture: a | motion: drift', '3 | 6-10 s | 4 s | lyric: "none" | picture: b | motion: drift', '2 | 10-16 s | 6 s | lyric: "none" | picture: c | motion: drift'] }, /shot line 2 is shot 3/],
    [{ lines: ['1 | 0-6 s | 6 s | lyric: "none" | picture: a | motion: drift', '2 | 6-10 s | 4 s | lyric: "none" | picture: b', '3 | 10-16 s | 6 s | lyric: "none" | picture: c | motion: drift'] }, /shot 2: its storyboard line has no motion/],
    [{ lines: ['1 | 0-6 s | 6 s | lyric: "none" | picture: a | motion: drift', '2 | 6-10 s | 4 s | lyric: "none" | picture: b | motion:  ', '3 | 10-16 s | 6 s | lyric: "none" | picture: c | motion: drift'] }, /shot 2: its storyboard line has no motion/],
    [{ stills: ["https://v3.fal.media/a.png", "https://v3.fal.media/b.png"] }, /--stills holds 2 URLs, the plan 3 shots/],
    [{ stills: ["https://v3.fal.media/a.png", "media/still-2.png", "https://v3.fal.media/c.png"] }, /shot 2: its still URL media\/still-2\.png is not an https URL/],
    [{ stem: "ABC" }, /--stem is the run's key stem/],
  ];
  for (const [given, why] of cases) {
    const { r, file } = clipsRun(given);
    assert.equal(r.status, 2, `${JSON.stringify(given)}: exit ${r.status}, ${r.stderr}`);
    assert.match(r.stderr, why);
    assert.equal(r.stdout.trim(), "", "nothing is printed to send");
    assert.equal(file, undefined, "no media/clips.json is written");
  }
});

// ---------- stills and remake: every still's input built from the storyboard and the plan ----------
// The stills' prompts are cut out of a grader's input the same way. The kit's stills command builds each still's
// submit_job (the style line, the shot's picture word for word, the fixed ending and fields), prints them to send as
// printed, and writes media/stills.json: the style and fixed fields once, then one line per still. remake adds one
// still's second take, its picture fixed, to the same record and prints its submit_job.
const NANO = "fal-ai/nano-banana-pro";
const STYLE = "cut paper with soft shadows, teal and amber";
const ENDING = "No text, no lettering, no logos.";
function stillsDir({ shots = [6, 4, 6], lines, style = `Style: ${STYLE}`, aspect = "16:9" } = {}) {
  const dir = join(root, `stills-${++runs}`);
  mkdirSync(join(dir, "film"), { recursive: true });
  mkdirSync(join(dir, "media"));
  cpSync(join(KIT, "beats.mjs"), join(dir, "film", "beats.mjs"));
  let at = 8.254;
  const planShots = shots.map((seconds, i) => {
    const s = { n: i + 1, start_s: Math.round(at * 1000) / 1000, end_s: Math.round((at + seconds) * 1000) / 1000, seconds, bars: 2, partial: false, clip_seconds: Math.max(3, Math.ceil(seconds)) };
    at += seconds;
    return s;
  });
  const total = shots.reduce((t, s) => t + s, 0);
  writeFileSync(join(dir, "film", "plan.json"), JSON.stringify({ song: { path: "media/song.wav", seconds: 80, minutes: 80 / 60 }, cut: { seconds: total, start_s: 8.254, end_s: 8.254 + total, shots: planShots }, aspect, width: 1920, height: 1080, lyrics_on: true }));
  let clock = 0;
  const shotLines = lines ?? planShots.map((s) => {
    const line = `${s.n} | ${clock}-${clock + s.seconds} s | ${s.seconds} s | lyric: "none" | picture: a paper ferry ${s.n} on teal water, wide | motion: slow push in ${s.n}`;
    clock += s.seconds;
    return line;
  });
  writeFileSync(join(dir, "storyboard.md"), [style, ...shotLines].filter((l) => l !== null).join("\n") + "\n");
  priced(dir);
  return dir;
}
const kit = (dir, ...args) => spawnSync(process.execPath, ["film/beats.mjs", ...args], { cwd: dir, encoding: "utf8" });
const stillsOf = (dir, stem = "abcd1234") => kit(dir, "stills", "--film", "film", "--storyboard", "storyboard.md", "--stem", stem, "--file", "media/stills.json");
const recordOf = (dir, name) => (existsSync(join(dir, "media", name)) ? readFileSync(join(dir, "media", name), "utf8") : undefined);
const fixedStill = (aspect = "16:9") => ({ num_images: 1, aspect_ratio: aspect, resolution: "1K", output_format: "png", enable_web_search: false });

test("stills prints each still's submit_job: the style line, the shot's picture word for word, the fixed ending and fields", () => {
  const dir = stillsDir({ aspect: "9:16" });
  const r = stillsOf(dir);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(sent(r.stdout), [1, 2, 3].map((n) => ({
    endpoint_id: NANO,
    submission_key: `mu-abcd1234-still-${n}`,
    input: { prompt: `${STYLE}. a paper ferry ${n} on teal water, wide. ${ENDING}`, ...fixedStill("9:16") },
  })));
});

test("stills writes media/stills.json: the style and fixed fields once, then each still's key and picture, the same as printed", () => {
  const dir = stillsDir();
  const r = stillsOf(dir);
  assert.equal(r.status, 0, r.stderr);
  const record = JSON.parse(recordOf(dir, "stills.json"));
  assert.equal(record.endpoint_id, NANO);
  assert.equal(record.style, STYLE);
  assert.equal(record.each_prompt, `<style>. <picture>. ${ENDING}`);
  assert.deepEqual(record.every_still, fixedStill());
  assert.deepEqual(record.stills.map((s) => s.n), [1, 2, 3]);
  assert.deepEqual(record.stills.map((s) => ({ endpoint_id: record.endpoint_id, submission_key: s.key, input: { prompt: `${record.style}. ${s.picture}. ${ENDING}`, ...record.every_still } })), sent(r.stdout));
});

test("a 12-still media/stills.json stays small enough to reach a grader whole", () => {
  const picture = "a small amber-windowed paper ferry sliding away from a teal paper quay, rows of amber lamp dots along the harbor wall, wide and calm, dark teal sky";
  const shots = Array(12).fill(5);
  let clock = 0;
  const lines = shots.map((s, i) => `${i + 1} | ${clock}-${(clock += s)} s | ${s} s | lyric: "none" | picture: ${picture} | motion: drift`);
  const dir = stillsDir({ shots, lines, style: `Style: ${"cut paper with soft shadows, layered paper shapes in deep teal and amber, harbor lights at night, shallow depth between paper layers, handmade texture"}` });
  const r = stillsOf(dir);
  assert.equal(r.status, 0, r.stderr);
  const bytes = Buffer.byteLength(recordOf(dir, "stills.json"));
  assert.ok(bytes < 3500, `media/stills.json is ${bytes} bytes`);
  assert.equal(sent(r.stdout).length, 12);
});

test("stills refuses a storyboard with no style line, lines that aren't the plan's shots, or a shot with no picture", () => {
  const cases = [
    [{ style: null }, /storyboard\.md has no style line/],
    [{ lines: ['1 | 0-6 s | 6 s | lyric: "none" | picture: a | motion: m', '2 | 6-10 s | 4 s | lyric: "none" | picture: b | motion: m'] }, /storyboard\.md holds 2 shot lines, the plan 3/],
    [{ lines: ['2 | 0-6 s | 6 s | lyric: "none" | picture: a | motion: m', '1 | 6-10 s | 4 s | lyric: "none" | picture: b | motion: m', '3 | 10-16 s | 6 s | lyric: "none" | picture: c | motion: m'] }, /shot line 1 is shot 2/],
    [{ lines: ['1 | 0-6 s | 6 s | lyric: "none" | picture: a | motion: m', '2 | 6-10 s | 4 s | lyric: "none" | motion: m', '3 | 10-16 s | 6 s | lyric: "none" | picture: c | motion: m'] }, /shot 2: its storyboard line has no picture/],
  ];
  for (const [given, why] of cases) {
    const dir = stillsDir(given);
    const r = stillsOf(dir);
    assert.equal(r.status, 2, `${JSON.stringify(given)}: exit ${r.status}, ${r.stderr}`);
    assert.match(r.stderr, why);
    assert.equal(r.stdout.trim(), "");
    assert.equal(recordOf(dir, "stills.json"), undefined);
  }
  const r = stillsOf(stillsDir(), "ABC");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /--stem is the run's key stem/);
});

test("remake adds one still's second take, its picture fixed, to media/stills.json and prints its submit_job; never a third take or a third remake", () => {
  const dir = stillsDir({ shots: [5, 5, 5, 5] });
  assert.equal(stillsOf(dir).status, 0);
  const r = kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "2", "--picture", "a paper ferry on teal water, seen from far behind");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(sent(r.stdout), [{ endpoint_id: NANO, submission_key: "mu-abcd1234-still-2-2", input: { prompt: `${STYLE}. a paper ferry on teal water, seen from far behind. ${ENDING}`, ...fixedStill() } }]);
  const record = JSON.parse(recordOf(dir, "stills.json"));
  assert.deepEqual(record.stills.at(-1), { n: 2, key: "mu-abcd1234-still-2-2", picture: "a paper ferry on teal water, seen from far behind", remake: true });
  assert.equal(record.stills.length, 5);
  const refused = [
    [["--shot", "2", "--picture", "again"], /shot 2 has had its remake/],
    [["--shot", "9", "--picture", "x"], /shot 9 is not in media\/stills\.json/],
    [["--shot", "3", "--picture", "  "], /--picture is the fixed picture/],
  ];
  for (const [args, why] of refused) {
    const no = kit(dir, "remake", "--film", "film", "--file", "media/stills.json", ...args);
    assert.equal(no.status, 2, `${args}: ${no.stderr}`);
    assert.match(no.stderr, why);
    assert.equal(no.stdout.trim(), "");
  }
  assert.equal(kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "3", "--picture", "a calm teal harbor").status, 0);
  const third = kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "4", "--picture", "a quay");
  assert.equal(third.status, 2);
  assert.match(third.stderr, /two remakes are the most a run makes/);
  assert.equal(JSON.parse(recordOf(dir, "stills.json")).stills.length, 6);
});

// ---------- the sent calls against the records (a repo check beside serve's grade) ----------
// The records are what the kit built. What counts is what the run sent: the fake fal's whole log of submit_job calls,
// which serve keeps in the eval report as the run's mcp_calls. .github/eval-checks/music-video-sent.mjs compares them
// call by call: every still and clip sent exactly once, each one's arguments equal to its record's, the clips' negative
// prompt the one exact string, the number of shots the case's clips-negative grader counts. A stopgap until a serve
// grader can compare a call to a run's file (agentrun #3824).
const CHECK = new URL("./eval-checks/music-video-sent.mjs", import.meta.url).pathname;
const SHORT = 8; // short-song's clips-negative.md count
const LABEL = " (repo check; serve's grade is separate; stopgap for agentrun #3824)";
// The still URLs short-song's fake fal answers (its fixtures/fal-mcp.json): shot n's first take, and shot 3's remake.
const SHORT_STILLS = ["GkgWYmDQYoyxtY24Bs9v", "YwAC9i7Db6PXW3GEVE2y", "zby3sZdkDWFBybAuTkMg", "SSDjwaNSwqb49N26opaG", "WP5xWruvXeKA9w7RUDq9", "KGSzJtnkFtMGdEP3YQdb", "XFpyZgC8rFoKbJaeV7sf", "Q5XBaNDPvMEgaX79XS3f"].map((id) => `https://v3.fal.media/files/rabbit/${id}.png`);
const SHORT_REMAKE_3 = "https://v3.fal.media/files/rabbit/6axMNsJrwgJ6Y7oUVrdv.png";
function sentRun({ shots = Array(SHORT).fill(4) } = {}) {
  const dir = stillsDir({ shots });
  const s = stillsOf(dir);
  assert.equal(s.status, 0, s.stderr);
  const urls = SHORT_STILLS.slice(0, shots.length);
  const c = kit(dir, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", urls.join(","), "--file", "media/clips.json");
  assert.equal(c.status, 0, c.stderr);
  const calls = [...sent(s.stdout), ...sent(c.stdout)].map((args) => ({ tool: "mcp:fal/submit_job", arguments: args }));
  costed(dir);
  return { dir, calls: [{ tool: "mcp:fal/get_pricing", arguments: {} }, ...calls, { tool: "mcp:fal/wait_for_jobs", arguments: { jobs: [] } }] };
}
// The run's cost as the agent runs it (the skill's step 8): every still and clip the records hold, sent.
function costed(dir) {
  const held = [...JSON.parse(recordOf(dir, "stills.json")).stills, ...JSON.parse(recordOf(dir, "clips.json")).clips];
  const r = kit(dir, "cost", "--film", "film", "--stem", "abcd1234", "--sent", held.map((x) => x.key.replace(/^mu-abcd1234-/, "")).join(","));
  assert.equal(r.status, 0, r.stderr);
}
function reportOf(dir, calls, { name = "short-song", runs, data } = {}) {
  const report = join(dir, `report-${++runs_}.json`);
  writeFileSync(report, JSON.stringify({ package: { name: "music-video" }, ...(data ? { server: { kind: "in_process", data } } : {}), cases: [{ name, runs: runs ?? [{ run: 1, agent_id: "01aa-agent", run_id: "01aa-run", mcp_calls: calls }] }] }));
  return report;
}
let runs_ = 0;
const checkRaw = (...args) => spawnSync(process.execPath, [CHECK, ...args], { encoding: "utf8" });
// Every verdict line ends with the label that says it is the repo's check; the tests below match what comes before it.
const checkAt = (path, ...args) => {
  const r = spawnSync(process.execPath, [path, ...args], { encoding: "utf8" });
  if (r.status !== 2) assert.ok(r.stdout.endsWith(`${LABEL}\n`), `no label: ${r.stdout}`);
  return { ...r, stdout: r.stdout.replace(LABEL, "") };
};
const check = (...args) => checkAt(CHECK, ...args);
// The check reads the user's ceiling from the case's own prompt.md in its repo. short-song sets none, so a run with a
// ceiling is checked by a copy of the check, the kit and short-song (fixtures and graders as they are) whose prompt.md
// input sets max_fal_usd: one copy per ceiling.
const ceilingChecks = new Map();
function checkWithCeiling(max) {
  if (ceilingChecks.has(max)) return ceilingChecks.get(max);
  const repo = join(root, `repo-max-${++runs}`);
  const REPO = new URL("../", import.meta.url).pathname;
  cpSync(join(REPO, ".github", "eval-checks"), join(repo, ".github", "eval-checks"), { recursive: true });
  cpSync(KIT, join(repo, "templates", "music-video", "skills", "music-video", "kit"), { recursive: true });
  const cased = join(repo, "templates", "music-video", "evals", "short-song");
  cpSync(join(REPO, "templates", "music-video", "evals", "short-song"), cased, { recursive: true });
  const prompt = join(cased, "prompt.md");
  const text = readFileSync(prompt, "utf8");
  assert.match(text, /^input:\n/m);
  writeFileSync(prompt, text.replace(/^input:\n/m, `input:\n  max_fal_usd: ${max}\n`));
  const path = join(repo, ".github", "eval-checks", "music-video-sent.mjs");
  ceilingChecks.set(max, path);
  return path;
}
const edit = (calls, key, change) => calls.map((c) => (c.arguments.submission_key === key ? { ...c, arguments: change(structuredClone(c.arguments)) } : c));

test("the sent check passes a run whose sent stills and clips equal their records, in one line that says it is the repo's check", () => {
  const { dir, calls } = sentRun();
  const r = check(reportOf(dir, calls), dir);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(r.stdout, "SENT PASS n=16\n");
  assert.equal(checkRaw(reportOf(dir, calls), dir).stdout, `SENT PASS n=16${LABEL}\n`);
});

test("the sent check finds the run's work folder from the report alone: its server.data folder, by the agent and run ids", () => {
  const { dir, calls } = sentRun();
  const data = join(root, `data-${++runs}`);
  const work = join(data, "disk", "agents", "01aa-agent-0f0f", "runs", "01aa-run", "work");
  mkdirSync(join(data, "disk", "agents", "01aa-agent-0f0f", "runs", "01aa-other", "work"), { recursive: true });
  mkdirSync(join(work, ".."), { recursive: true });
  cpSync(dir, work, { recursive: true });
  for (const args of [[reportOf(dir, calls, { data })], ["--report", reportOf(dir, calls, { data })], [reportOf(dir, calls), data], ["--report", reportOf(dir, calls, { data: root }), "--work", work]]) {
    const r = check(...args);
    assert.equal(r.status, 0, `${args}: ${r.stdout}${r.stderr}`);
    assert.equal(r.stdout, "SENT PASS n=16\n");
  }
  // The run's folder missing from the data folder: no verdict, not a failure.
  const gone = join(root, `data-${++runs}`);
  mkdirSync(join(gone, "disk", "agents", "01aa-agent-0f0f", "runs"), { recursive: true });
  const r = checkRaw(reportOf(dir, calls, { data: gone }));
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /^SENT VOID .* holds no media\/ and no disk\/agents\/<agent>\/runs\/01aa-run\/work/);
});

test("the sent check passes a remake sent as recorded, and fails one sent but not recorded", () => {
  const { dir, calls } = sentRun();
  const r = kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "3", "--picture", "a teal quay at dusk");
  assert.equal(r.status, 0, r.stderr);
  const remake = { tool: "mcp:fal/submit_job", arguments: sent(r.stdout)[0] };
  costed(dir);
  assert.match(check(reportOf(dir, [...calls, remake]), dir).stdout, /^SENT PASS n=17\n$/);
  const stray = structuredClone(remake);
  stray.arguments.submission_key = "mu-abcd1234-still-4-2";
  const no = check(reportOf(dir, [...calls, remake, stray]), dir);
  assert.equal(no.status, 1);
  assert.equal(no.stdout, "SENT FAIL stills: mu-abcd1234-still-4-2 was sent and is not in media/stills.json\n");
});

test("the sent check fails a run whose sent calls differ from the records, naming the call", () => {
  const { dir, calls } = sentRun();
  const NEG = "text, letters, words, captions, subtitles, logo, watermark, signage, brand, real person, celebrity, blur, distortion, low quality";
  const cases = [
    [edit(calls, "mu-abcd1234-clip-2", (a) => ((a.input.negative_prompt = NEG.replace(", celebrity", "")), a)), /^SENT FAIL clips: mu-abcd1234-clip-2 was sent with input\.negative_prompt "text, letters, words, captions, subtitles, logo, watermark, signage, brand, real person, blur, distortion, low quality"; media\/clips\.json has "text, letters/],
    [calls.filter((c) => c.arguments.submission_key !== "mu-abcd1234-clip-3"), /^SENT FAIL clips: mu-abcd1234-clip-3 is in media\/clips\.json and was never sent\n$/],
    [edit(calls, "mu-abcd1234-clip-1", (a) => ((a.input.prompt = "a new scene: a city at night"), a)), /^SENT FAIL clips: mu-abcd1234-clip-1 was sent with input\.prompt "a new scene: a city at night"; media\/clips\.json has "slow push in 1, the scene as it is"\n$/],
    [edit(calls, "mu-abcd1234-clip-4", (a) => ((a.input.start_image_url = "https://v3.fal.media/files/rabbit/still1.png"), a)), /^SENT FAIL clips: mu-abcd1234-clip-4 was sent with input\.start_image_url/],
    [edit(calls, "mu-abcd1234-still-2", (a) => ((a.input.prompt = a.input.prompt.replace(" on teal water", "")), a)), /^SENT FAIL stills: mu-abcd1234-still-2 was sent with input\.prompt "cut paper with soft shadows, teal and amber\. a paper ferry 2, wide\. No text, no lettering, no logos\."; media\/stills\.json has/],
    [edit(calls, "mu-abcd1234-still-1", (a) => ((a.input.enable_web_search = true), a)), /^SENT FAIL stills: mu-abcd1234-still-1 was sent with input\.enable_web_search true; media\/stills\.json has false\n$/],
    [[...calls, calls.find((c) => c.arguments.submission_key === "mu-abcd1234-clip-2")], /^SENT FAIL clips: mu-abcd1234-clip-2 was sent 2 times\n$/],
    [edit(edit(calls, "mu-abcd1234-clip-1", (a) => ((a.input.prompt = "x"), a)), "mu-abcd1234-clip-2", (a) => ((a.input.prompt = "y"), a)), /^SENT FAIL clips: mu-abcd1234-clip-1 was sent with input\.prompt "x"; media\/clips\.json has "slow push in 1, the scene as it is" \(and 1 more\)\n$/],
  ];
  for (const [mutated, why] of cases) {
    const r = check(reportOf(dir, mutated), dir);
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, why);
  }
});

test("the sent check fails records that don't hold the case's shots or the exact negative prompt, or that the run never left", () => {
  const { dir, calls } = sentRun();
  const twelve = check(reportOf(dir, calls, { name: "sixty-seconds" }), dir);
  assert.equal(twelve.status, 1);
  // The storyboard is read first: the plan's 8 shots against the case's 12, then its 4 missing lines, then the records:
  // 8 first takes and 8 clips, each short of the case's 12.
  assert.match(twelve.stdout, /^SENT FAIL storyboard: film\/plan\.json holds 8 shots, the case 12 \(and 6 more\)\n$/);
  const path = join(dir, "media", "clips.json");
  const record = JSON.parse(readFileSync(path, "utf8"));
  record.every_clip.negative_prompt = "text";
  writeFileSync(path, JSON.stringify(record));
  // The record and the sent calls agree, and both miss the one negative prompt: still a failure.
  const both = calls.map((c) => (c.arguments.endpoint_id === KLING ? { ...c, arguments: { ...c.arguments, input: { ...c.arguments.input, negative_prompt: "text" } } } : c));
  assert.equal(check(reportOf(dir, both), dir).stdout, "SENT FAIL clips: media/clips.json's negative_prompt is \"text\", not the one exact string\n");
  const bare = sentRun();
  for (const f of ["clips.json", "stills.json"]) spawnSync("mv", [join(bare.dir, "media", f), join(bare.dir, "media", f + ".gone")]);
  const r = check(reportOf(bare.dir, bare.calls), bare.dir);
  assert.equal(r.status, 1);
  assert.equal(r.stdout, "SENT FAIL stills: the run left no media/stills.json (and 1 more)\n");
});

test("the sent check is VOID (exit 2), not a fail, when it can't find its inputs", () => {
  const { dir, calls } = sentRun();
  const check = checkRaw;
  const voids = [
    [[], /^SENT VOID usage: node \.github\/eval-checks\/music-video-sent\.mjs <report\.json> \[<the run's work folder or the serve's data folder>\]/],
    [[join(dir, "nope.json"), dir], /^SENT VOID no report at /],
    [[reportOf(dir, calls), join(dir, "nowhere")], /^SENT VOID no folder at /],
    [[reportOf(dir, calls, { name: "live", runs: [{ run: 1, agent_id: "a", run_id: "r", mcp_calls: [] }] }), dir], /^SENT VOID no fake log: live runs aren't checked/],
    [[reportOf(dir, calls, { name: "user-ceiling" }), dir], /^SENT VOID case user-ceiling has no clips-negative grader \(templates\/music-video\/evals\/user-ceiling\/graders\/clips-negative\.md\): this check covers the fake-fal cases that make a film$/m],
    [[reportOf(dir, calls)], /^SENT VOID the report names no server\.data folder/],
    [[reportOf(dir, calls, { data: join(root, "data-moved") })], new RegExp(`^SENT VOID no folder at ${join(root, "data-moved").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\n$`)],
    [[reportOf(dir, calls, { runs: [{ run: 1, agent_id: "a", run_id: "r", mcp_calls: calls }, { run: 2, agent_id: "a", run_id: "s", mcp_calls: calls }] }), dir], /^SENT VOID the report holds 2 runs; this check takes a report of one run$/m],
    [[reportOf(dir, calls, { runs: [{ run: 1, agent_id: "a", run_id: "r" }] }), dir], /^SENT VOID no fake log: live runs aren't checked \(case short-song has no mcp_calls in the report\)$/m],
    [[reportOf(dir, calls), mkdtempSync(join(root, "empty-"))], /^SENT VOID .* holds no media\/ and no disk\/agents\/<agent>\/runs\/01aa-run\/work/m],
  ];
  for (const [args, why] of voids) {
    const r = check(...args);
    assert.equal(r.status, 2, `${args}: ${r.stdout}${r.stderr}`);
    assert.match(r.stdout, why);
  }
});

// ---------- review: a stills run again keeps the record; the sent check reads only the fields it knows ----------
test("stills run again on a resumed run keeps media/stills.json: the remake's record and the remake count survive", () => {
  const dir = stillsDir({ shots: [5, 5, 5, 5] });
  assert.equal(stillsOf(dir).status, 0);
  assert.equal(kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "2", "--picture", "a calm teal quay").status, 0);
  const before = recordOf(dir, "stills.json");
  const again = stillsOf(dir);
  assert.equal(again.status, 0, again.stderr);
  assert.equal(recordOf(dir, "stills.json"), before, "the record is kept as it was");
  assert.equal(sent(again.stdout).length, 4, "the first takes are printed as before");
  assert.equal(kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "3", "--picture", "a teal harbor wall").status, 0);
  const third = kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "4", "--picture", "a quay");
  assert.equal(third.status, 2, "the run's two remakes still count after stills ran again");
  assert.match(third.stderr, /two remakes are the most a run makes/);
});

test("stills refuses, naming the shot, to replace a record whose inputs changed", () => {
  const dir = stillsDir();
  assert.equal(stillsOf(dir).status, 0);
  const before = recordOf(dir, "stills.json");
  const board = join(dir, "storyboard.md");
  const text = readFileSync(board, "utf8");
  writeFileSync(board, text.replace("picture: a paper ferry 2 on teal water, wide", "picture: a red paper ferry"));
  const picture = stillsOf(dir);
  assert.equal(picture.status, 2, picture.stderr);
  assert.match(picture.stderr, /^shot 2: media\/stills\.json already holds its still with another picture \("a paper ferry 2 on teal water, wide"\)/);
  assert.equal(picture.stdout.trim(), "");
  assert.equal(recordOf(dir, "stills.json"), before, "the sent record is never overwritten");
  writeFileSync(board, text.replace(`Style: ${STYLE}`, "Style: risograph print"));
  const style = stillsOf(dir);
  assert.equal(style.status, 2, style.stderr);
  assert.match(style.stderr, /^media\/stills\.json already holds the stills with another style \("cut paper with soft shadows, teal and amber"\)/);
  assert.equal(recordOf(dir, "stills.json"), before);
  writeFileSync(board, text);
  const stem = stillsOf(dir, "zzzz9999");
  assert.equal(stem.status, 2);
  assert.match(stem.stderr, /^shot 1: media\/stills\.json already holds its still with another key \("mu-abcd1234-still-1"\)/);
});

test("the sent check fails a shared field it doesn't know: an every_still or every_clip field never stands in for a built one", () => {
  const { dir, calls } = sentRun();
  const stillsPath = join(dir, "media", "stills.json");
  const stillsRecord = JSON.parse(readFileSync(stillsPath, "utf8"));
  stillsRecord.every_still.prompt = "a famous singer's face";
  writeFileSync(stillsPath, JSON.stringify(stillsRecord));
  const sentSo = calls.map((c) => (c.arguments.endpoint_id === NANO ? { ...c, arguments: { ...c.arguments, input: { ...c.arguments.input, prompt: "a famous singer's face" } } } : c));
  const r = check(reportOf(dir, sentSo), dir);
  assert.equal(r.status, 1, r.stdout);
  assert.equal(r.stdout, "SENT FAIL stills: media/stills.json's every_still has a field prompt; its fields are num_images, aspect_ratio, resolution, output_format, enable_web_search\n");
  const clip = sentRun();
  const clipsPath = join(clip.dir, "media", "clips.json");
  const clipsRecord = JSON.parse(readFileSync(clipsPath, "utf8"));
  clipsRecord.every_clip.prompt = "a new scene";
  writeFileSync(clipsPath, JSON.stringify(clipsRecord));
  const clipSent = clip.calls.map((c) => (c.arguments.endpoint_id === KLING ? { ...c, arguments: { ...c.arguments, input: { ...c.arguments.input, prompt: "a new scene" } } } : c));
  const c = check(reportOf(clip.dir, clipSent), clip.dir);
  assert.equal(c.status, 1, c.stdout);
  assert.equal(c.stdout, "SENT FAIL clips: media/clips.json's every_clip has a field prompt; its fields are generate_audio, negative_prompt\n");
});

test("the sent check gives one verdict line for a record of the wrong shape, never an uncaught throw", () => {
  const shapes = [
    ["stills.json", "null", /^SENT FAIL stills: media\/stills\.json is not a JSON object/],
    ["stills.json", "[]", /^SENT FAIL stills: media\/stills\.json is not a JSON object/],
    ["clips.json", "7", /^SENT FAIL clips: media\/clips\.json is not a JSON object/],
    ["stills.json", (r) => ({ ...r, stills: "all of them" }), /^SENT FAIL stills: media\/stills\.json's stills is not a list/],
    ["clips.json", (r) => { const { clips, ...rest } = r; return rest; }, /^SENT FAIL clips: media\/clips\.json's clips is not a list/],
    ["stills.json", (r) => ({ ...r, every_still: null }), /^SENT FAIL stills: media\/stills\.json's every_still is not an object/],
    ["clips.json", (r) => ({ ...r, every_clip: "none" }), /^SENT FAIL clips: media\/clips\.json's every_clip is not an object/],
    ["stills.json", (r) => ({ ...r, stills: r.stills.map((s, i) => (i === 1 ? null : s)) }), /^SENT FAIL stills: media\/stills\.json's stills item 2 is not \{n, key, picture\[, remake\]\}/],
    ["stills.json", (r) => ({ ...r, stills: r.stills.map((s, i) => (i === 2 ? { n: s.n, key: s.key } : s)) }), /^SENT FAIL stills: media\/stills\.json's stills item 3 is not \{n, key, picture\[, remake\]\}/],
    ["clips.json", (r) => ({ ...r, clips: r.clips.map((s, i) => (i === 0 ? { ...s, duration: 6 } : s)) }), /^SENT FAIL clips: media\/clips\.json's clips item 1 is not \{n, key, duration, prompt, start_image_url\}/],
    ["clips.json", (r) => ({ ...r, clips: r.clips.map((s, i) => (i === 0 ? { ...s, generate_audio: true } : s)) }), /^SENT FAIL clips: media\/clips\.json's clips item 1 is not \{n, key, duration, prompt, start_image_url\}/],
  ];
  for (const [file, change, why] of shapes) {
    const { dir, calls } = sentRun();
    const path = join(dir, "media", file);
    writeFileSync(path, typeof change === "string" ? change : JSON.stringify(change(JSON.parse(readFileSync(path, "utf8")))));
    const r = checkRaw(reportOf(dir, calls), dir);
    assert.equal(r.status, 1, `${file} ${change}: exit ${r.status} ${r.stdout}${r.stderr}`);
    assert.match(r.stdout, why);
    assert.equal(r.stdout.trim().split("\n").length, 1);
    assert.equal(r.stderr, "");
  }
  // A report whose fake log holds something that is not a call: no verdict.
  const { dir, calls } = sentRun();
  const r = checkRaw(reportOf(dir, [...calls, null]), dir);
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stdout, /^SENT VOID the report's mcp_calls item \d+ is not a call$/m);
});

// ---------- price: the user's ceiling, and never a cheaper plan ----------
function priceDir() {
  const dir = stillsDir({ shots: [6, 4, 6] });
  const planPath = join(dir, "film", "plan.json");
  const plan = JSON.parse(readFileSync(planPath, "utf8"));
  plan.song.minutes = 1.25;
  writeFileSync(planPath, JSON.stringify(plan));
  return dir;
}
const RATES = "isolation=0.1,transcript=0.03,still=0.15,clip=0.14";
// 1.25 min x (0.10 + 0.03) + (3 stills + 2 in reserve) x 0.15 + (6 + 4 + 6) s x 0.14 = 0.1625 + 0.75 + 2.24
const PLAN_USD = 3.153;
test("price: with no ceiling nothing is over; with one, a plan above it is OVER YOUR CEILING and one at or below it FITS; never a cheaper plan", () => {
  const cases = [
    [[], true, `plan_usd: ${PLAN_USD} (no ceiling set)`],
    [["--max", "0"], false, `plan_usd: ${PLAN_USD} (your ceiling, max_fal_usd 0): OVER YOUR CEILING`],
    [["--max", "3.15"], false, `plan_usd: ${PLAN_USD} (your ceiling, max_fal_usd 3.15): OVER YOUR CEILING`],
    [["--max", String(PLAN_USD)], true, `plan_usd: ${PLAN_USD} (your ceiling, max_fal_usd ${PLAN_USD}): FITS`],
    [["--max", "1000"], true, `plan_usd: ${PLAN_USD} (your ceiling, max_fal_usd 1000): FITS`],
  ];
  for (const [max, fits, line] of cases) {
    const dir = priceDir();
    const r = kit(dir, "price", "--film", "film", "--rates", RATES, ...max);
    assert.equal(r.status, 0, `${max}: ${r.stderr}`);
    const out = r.stdout.trim().split("\n");
    assert.equal(out.at(-2), line, `${max}`);
    assert.equal(out.at(-1), `answer fields (copy each into the answer exactly as printed): {"plan_usd":${PLAN_USD}}`);
    const priced = JSON.parse(readFileSync(join(dir, "film", "price.json"), "utf8"));
    assert.equal(priced.fits, fits, `${max}`);
    assert.equal(priced.plan_usd, PLAN_USD);
    assert.equal(priced.max_fal_usd, max.length ? Number(max[1]) : null);
    assert.equal(priced.lines.filter((l) => l.reserve).length, 2);
    // Caps out: no downgrade. Nothing prices or names a cheaper plan, whatever the ceiling.
    assert.doesNotMatch(r.stdout, /cheaper/i);
    assert.equal(Object.keys(priced).some((k) => /cheaper/i.test(k)), false);
    assert.doesNotMatch(JSON.stringify(priced), /cheaper/i);
  }
  const negative = kit(priceDir(), "price", "--film", "film", "--rates", RATES, "--max", "-1");
  assert.equal(negative.status, 2);
  assert.match(negative.stderr, /--max is max_fal_usd, 0 or more/);
});

// ---------- the kit's gates: the ceiling, the rates, a rerun, a corrupt record ----------
const GATE = "the plan is over the ceiling you set (or not priced yet): nothing is built";
test("stills, remake and clips build nothing when the plan is over the user's ceiling or not priced", () => {
  const dir = priceDir();
  assert.equal(kit(dir, "price", "--film", "film", "--rates", RATES).status, 0);
  assert.equal(stillsOf(dir).status, 0, "a plan priced with no ceiling fits");
  const stillsBefore = recordOf(dir, "stills.json");
  const over = kit(dir, "price", "--film", "film", "--rates", RATES, "--max", "0");
  assert.equal(over.status, 0);
  assert.match(over.stdout, /OVER YOUR CEILING/);
  const urls = [1, 2, 3].map((n) => `https://v3.fal.media/files/rabbit/still${n}.png`).join(",");
  const refused = {
    stills: () => stillsOf(dir),
    remake: () => kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "2", "--picture", "a calm quay"),
    clips: () => kit(dir, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", urls, "--file", "media/clips.json"),
  };
  for (const [name, run] of Object.entries(refused)) {
    const r = run();
    assert.equal(r.status, 2, `${name}: ${r.stdout}${r.stderr}`);
    assert.equal(r.stdout, "", `${name} prints nothing to send`);
    assert.equal(r.stderr.trim(), GATE, name);
  }
  assert.equal(recordOf(dir, "stills.json"), stillsBefore, "remake added nothing");
  assert.equal(recordOf(dir, "clips.json"), undefined, "clips wrote nothing");
  // Never priced: no film/price.json at all.
  const bare = priceDir();
  spawnSync("rm", [join(bare, "film", "price.json")]);
  for (const [name, r] of [["stills", stillsOf(bare)], ["clips", kit(bare, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", urls, "--file", "media/clips.json")]]) {
    assert.equal(r.status, 2, `${name}: ${r.stdout}${r.stderr}`);
    assert.equal(r.stdout, "");
    assert.equal(r.stderr.trim(), GATE);
  }
  writeFileSync(join(bare, "media", "stills.json"), JSON.stringify({ stills: [{ n: 1, key: "mu-abcd1234-still-1", picture: "a quay" }] }));
  const remake = kit(bare, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "1", "--picture", "a calm quay");
  assert.equal(remake.status, 2);
  assert.equal(remake.stdout, "");
  assert.equal(remake.stderr.trim(), GATE);
});

// List prices the bands are based on: isolation $0.10 a minute, speech-to-text $0.03 a minute, a 1K still $0.15, a clip
// $0.112 a second (audio off). The band is the list price to four times it: a rate under list prices a plan below what
// fal bills, the failure a ceiling is there to stop; one over it only prices high.
const BANDS = { isolation: [0.1, 0.4], transcript: [0.03, 0.12], still: [0.15, 0.6], clip: [0.112, 0.448] };
const ENDPOINTS = { isolation: "fal-ai/elevenlabs/audio-isolation", transcript: "fal-ai/elevenlabs/speech-to-text", still: "fal-ai/nano-banana-pro", clip: "fal-ai/kling-video/v3/pro/image-to-video" };
test("price refuses a rate outside its endpoint's band, naming the endpoint and the band; both edges are inside", () => {
  const base = { isolation: 0.1, transcript: 0.03, still: 0.15, clip: 0.14 };
  const rates = (k, v) => Object.entries({ ...base, [k]: v }).map(([a, b]) => `${a}=${b}`).join(",");
  for (const [k, [low, high]] of Object.entries(BANDS)) {
    for (const v of [low, high]) {
      const r = kit(priceDir(), "price", "--film", "film", "--rates", rates(k, v));
      assert.equal(r.status, 0, `${k}=${v} is on the band's edge: ${r.stderr}`);
    }
    for (const v of [low * 0.99, high * 1.01, 0]) {
      const r = kit(priceDir(), "price", "--film", "film", "--rates", rates(k, v));
      assert.equal(r.status, 2, `${k}=${v}: ${r.stdout}`);
      assert.equal(r.stdout, "");
      assert.match(r.stderr, new RegExp(`^--rates ${k}=${String(v).replace(".", "\\.")}: ${ENDPOINTS[k]}'s rate is outside ${String(low).replace(".", "\\.")} to ${String(high).replace(".", "\\.")} USD`));
    }
  }
  // A model that misreads get_pricing's clip rate by a factor of ten is refused, not priced under the user's ceiling.
  const slip = kit(priceDir(), "price", "--film", "film", "--rates", rates("clip", 0.0112), "--max", "1");
  assert.equal(slip.status, 2);
  // Kling copied at $0.03 a second (a quarter of list and a bit): refused, not priced under an $8 ceiling it is over.
  const low = kit(priceDir(), "price", "--film", "film", "--rates", rates("clip", 0.03), "--max", "8");
  assert.equal(low.status, 2, low.stdout);
  assert.match(low.stderr, /^--rates clip=0\.03: fal-ai\/kling-video\/v3\/pro\/image-to-video's rate is outside 0\.112 to 0\.448 USD/);
});

test("clips run again on a resumed run keeps an identical media/clips.json, and refuses changed inputs naming the shot", () => {
  const { dir, r } = clipsRun();
  assert.equal(r.status, 0, r.stderr);
  const before = recordOf(dir, "clips.json");
  const urls = [1, 2, 3].map((n) => `https://v3.fal.media/files/rabbit/still${n}.png`);
  const clipsAgain = (list) => kit(dir, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", list.join(","), "--file", "media/clips.json");
  const again = clipsAgain(urls);
  assert.equal(again.status, 0, again.stderr);
  assert.equal(again.stdout, r.stdout, "the same calls, printed again");
  assert.equal(recordOf(dir, "clips.json"), before);
  const moved = clipsAgain(urls.map((u, i) => (i === 1 ? "https://v3.fal.media/files/rabbit/other2.png" : u)));
  assert.equal(moved.status, 2, moved.stdout);
  assert.equal(moved.stdout, "");
  assert.match(moved.stderr, /^shot 2: media\/clips\.json already holds its clip with another start_image_url \("https:\/\/v3\.fal\.media\/files\/rabbit\/still2\.png"\)/);
  assert.equal(recordOf(dir, "clips.json"), before, "the sent record is never overwritten");
  const board = join(dir, "storyboard.md");
  writeFileSync(board, readFileSync(board, "utf8").replace("motion: slow push in 3", "motion: fast whip pan"));
  const motion = clipsAgain(urls);
  assert.equal(motion.status, 2);
  assert.match(motion.stderr, /^shot 3: media\/clips\.json already holds its clip with another prompt \("slow push in 3, the scene as it is"\)/);
  writeFileSync(join(dir, "media", "clips.json"), "{not json");
  const corrupt = clipsAgain(urls);
  assert.equal(corrupt.status, 2);
  assert.match(corrupt.stderr, /^media\/clips\.json is there and is not the record clips wrote/);
});

test("remake and stills give a corrupt media/stills.json an error in words, never a stack", () => {
  const corrupt = [
    ["{not json", /^media\/stills\.json is there and is not the record stills wrote/],
    ["null", /^media\/stills\.json is there and is not the record stills wrote/],
    [JSON.stringify({ stills: [null] }), /^media\/stills\.json is there and is not the record stills wrote/],
    [JSON.stringify({ stills: [{ n: 1, key: "mu-abcd1234-still-1", picture: "a quay" }, 7] }), /^media\/stills\.json is there and is not the record stills wrote/],
  ];
  for (const [text, why] of corrupt) {
    const dir = stillsDir();
    writeFileSync(join(dir, "media", "stills.json"), text);
    for (const r of [kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "1", "--picture", "a calm quay"), stillsOf(dir)]) {
      assert.equal(r.status, 2, `${text}: ${r.stdout}${r.stderr}`);
      assert.equal(r.stdout, "");
      assert.match(r.stderr, why);
      assert.doesNotMatch(r.stderr, /\n\s+at |TypeError|SyntaxError: /, "an error in words, not a stack");
      assert.equal(readFileSync(join(dir, "media", "stills.json"), "utf8"), text, "left as it was");
    }
  }
});

// ---------- the sent check rebuilds the records the kit would build ----------
// The calls a run would send for the records on disk, so only the records' own content is under test.
function callsFrom(dir) {
  const st = JSON.parse(readFileSync(join(dir, "media", "stills.json"), "utf8"));
  const cl = JSON.parse(readFileSync(join(dir, "media", "clips.json"), "utf8"));
  const stills = st.stills.map((s) => ({ endpoint_id: NANO, submission_key: s.key, input: { prompt: `${st.style}. ${s.picture}. ${ENDING}`, ...st.every_still } }));
  const clips = cl.clips.map((c) => ({ endpoint_id: KLING, submission_key: c.key, input: { prompt: c.prompt, start_image_url: c.start_image_url, duration: c.duration, ...cl.every_clip } }));
  return [...stills, ...clips].map((a) => ({ tool: "mcp:fal/submit_job", arguments: a }));
}
function rewrite(dir, name, change) {
  const path = join(dir, "media", name);
  const record = JSON.parse(readFileSync(path, "utf8"));
  change(record);
  writeFileSync(path, JSON.stringify(record));
}
test("the sent check fails a record in the kit's shape, its calls sent to match, that the kit would not have built", () => {
  const cases = [
    ["a picture not in the storyboard", (d) => rewrite(d, "stills.json", (r) => (r.stills[2].picture = "a famous singer on stage")), /^SENT FAIL stills: media\/stills\.json's shot 3 is not what the kit builds from film\/plan\.json, storyboard\.md and media\/run-keys\.json: picture "a famous singer on stage", the kit's "a paper ferry 3 on teal water, wide"/],
    ["a duplicate n", (d) => rewrite(d, "stills.json", (r) => (r.stills[1].n = 1)), /^SENT FAIL stills: media\/stills\.json's shot 2 is not what the kit builds .*: n 1, the kit's 2/],
    ["a wrong key stem", (d) => { rewrite(d, "stills.json", (r) => r.stills.forEach((s) => (s.key = s.key.replace("abcd1234", "zzzz9999")))); }, /^SENT FAIL stills: media\/stills\.json's shot 1 is not what the kit builds .*: key "mu-zzzz9999-still-1", the kit's "mu-abcd1234-still-1"/],
    ["a remake of a shot with no first take", (d) => rewrite(d, "stills.json", (r) => r.stills.push({ n: 9, key: "mu-abcd1234-still-9-2", picture: "a quay", remake: true })), /^SENT FAIL stills: media\/stills\.json's remake of shot 9 is not one the kit makes: shot 9 is not in /],
    ["a clip duration that isn't the plan's clip seconds", (d) => rewrite(d, "clips.json", (r) => (r.clips[0].duration = "5")), /^SENT FAIL clips: media\/clips\.json's shot 1 is not what the kit builds .*: duration "5", the kit's "4"/],
    ["a clip prompt not from the storyboard", (d) => rewrite(d, "clips.json", (r) => (r.clips[4].prompt = "a slow push in, a city skyline")), /^SENT FAIL clips: media\/clips\.json's shot 5 is not what the kit builds .*: prompt "a slow push in, a city skyline", the kit's "slow push in 5, the scene as it is"/],
    ["a missing shot, every count still right", (d) => rewrite(d, "clips.json", (r) => (r.clips[7] = { ...r.clips[6], key: "mu-abcd1234-clip-8b" })), /^SENT FAIL clips: media\/clips\.json's shot 7 is not what the kit builds|^SENT FAIL clips: media\/clips\.json's shot 8 is not what the kit builds/],
  ];
  for (const [what, change, why] of cases) {
    const { dir } = sentRun();
    change(dir);
    const r = check(reportOf(dir, callsFrom(dir)), dir);
    assert.equal(r.status, 1, `${what}: ${r.stdout}${r.stderr}`);
    assert.match(r.stdout, why, what);
  }
  // The kit's own records, sent as printed, still pass; so does a remake the kit made.
  const { dir } = sentRun();
  assert.equal(kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "3", "--picture", "a teal quay at dusk").status, 0);
  costed(dir);
  assert.equal(check(reportOf(dir, callsFrom(dir)), dir).stdout, "SENT PASS n=17\n");
  // No media/run-keys.json: the records can't be tied to the run's stem.
  const nokeys = sentRun();
  spawnSync("rm", [join(nokeys.dir, "media", "run-keys.json")]);
  const r = check(reportOf(nokeys.dir, nokeys.calls), nokeys.dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^SENT FAIL stills: the run left no media\/run-keys\.json/);
});

test("the sent check fails a top-level record field it doesn't know, and an each_prompt that isn't the kit's", () => {
  const cases = [
    ["stills.json", (r) => (r.note = "x"), "SENT FAIL stills: media/stills.json has a field note; its fields are endpoint_id, style, each_prompt, every_still, stills\n"],
    ["clips.json", (r) => (r.style = "x"), "SENT FAIL clips: media/clips.json has a field style; its fields are endpoint_id, every_clip, clips\n"],
    ["stills.json", (r) => (r.each_prompt = "<style>. <picture>."), `SENT FAIL stills: media/stills.json's each_prompt is "<style>. <picture>.", not "<style>. <picture>. ${ENDING}"\n`],
  ];
  for (const [file, change, line] of cases) {
    const { dir, calls } = sentRun();
    rewrite(dir, file, change);
    const r = check(reportOf(dir, calls), dir);
    assert.equal(r.status, 1, r.stdout);
    assert.equal(r.stdout, line);
  }
});

// ---------- a price holds only for the plan it priced ----------
// A synthetic song for the kit's own plan: 100 s at 120 BPM (a click every 0.5 s, a bass note every bar), louder after
// 40 s, so a 30 s cut and a 90 s cut are different plans.
function songDir() {
  const dir = join(root, `song-${++runs}`);
  mkdirSync(join(dir, "film"), { recursive: true });
  mkdirSync(join(dir, "media"));
  cpSync(join(KIT, "beats.mjs"), join(dir, "film", "beats.mjs"));
  const r = spawnSync("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "aevalsrc='(lt(mod(t-0.25,0.5),0.03)*sin(2*PI*180*t)+lt(mod(t-0.25,2),0.08)*sin(2*PI*55*t))*(0.3+0.7*gt(t,40))':s=8000:d=100", "-ac", "1", join(dir, "media", "song.wav")], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  writeFileSync(join(dir, "media", "run-keys.json"), JSON.stringify({ stem: "abcd1234" }) + "\n");
  return dir;
}
const planAt = (dir, cut) => kit(dir, "plan", "--song", "media/song.wav", "--film", "film", "--cut", String(cut));
// A storyboard of the plan's shots as they are now.
function boardFor(dir) {
  const shots = JSON.parse(readFileSync(join(dir, "film", "plan.json"), "utf8")).cut.shots;
  writeFileSync(join(dir, "storyboard.md"), [`Style: ${STYLE}`, ...shots.map((s) => `${s.n} | ${s.seconds} s | lyric: "none" | picture: a paper ferry ${s.n} | motion: slow push in ${s.n}`)].join("\n") + "\n");
  return shots;
}
const CHANGED = "the plan changed since it was priced: run price again (nothing is built)";
test("a plan made again after price builds nothing until it is priced again", () => {
  const dir = songDir();
  assert.equal(planAt(dir, 30).status, 0);
  boardFor(dir);
  const priced30 = kit(dir, "price", "--film", "film", "--rates", RATES, "--max", "100");
  assert.match(priced30.stdout, /: FITS\n/);
  assert.equal(stillsOf(dir).status, 0, "the 30 s plan, priced, builds its stills");
  const replanned = planAt(dir, 90);
  assert.equal(replanned.status, 0, replanned.stderr);
  const shots = boardFor(dir);
  assert.ok(shots.length > 6, `the 90 s plan has more shots: ${shots.length}`);
  const urls = shots.map((s) => `https://v3.fal.media/files/rabbit/still${s.n}.png`).join(",");
  const runs90 = {
    stills: () => kit(dir, "stills", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--file", "media/stills-90.json"),
    remake: () => kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "1", "--picture", "a calm quay"),
    clips: () => kit(dir, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", urls, "--file", "media/clips.json"),
  };
  for (const [name, run] of Object.entries(runs90)) {
    const r = run();
    assert.equal(r.status, 2, `${name} ran on a price of another plan: ${r.stdout}`);
    assert.equal(r.stdout, "", name);
    assert.ok([GATE, CHANGED].includes(r.stderr.trim()), `${name}: ${r.stderr}`);
  }
  assert.equal(existsSync(join(dir, "media", "clips.json")), false);
  // Priced again (it fits the same ceiling): the stills are built.
  assert.match(kit(dir, "price", "--film", "film", "--rates", RATES, "--max", "100").stdout, /: FITS\n/);
  const built = runs90.stills();
  assert.equal(built.status, 0, built.stderr);
  assert.equal(sent(built.stdout).length, shots.length);
  // Priced again under a ceiling the longer plan is over: still nothing. A run's ceiling is its first --max, so this
  // is a run of its own.
  const tight = songDir();
  planAt(tight, 30);
  assert.match(kit(tight, "price", "--film", "film", "--rates", RATES, "--max", "6").stdout, /: FITS\n/);
  planAt(tight, 90);
  const tightShots = boardFor(tight);
  assert.match(kit(tight, "price", "--film", "film", "--rates", RATES, "--max", "6").stdout, /OVER YOUR CEILING/);
  const over = kit(tight, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", tightShots.map((s) => `https://v3.fal.media/files/rabbit/still${s.n}.png`).join(","), "--file", "media/clips.json");
  assert.equal(over.status, 2);
  assert.equal(over.stderr.trim(), GATE);
});

test("plan removes a price of another plan, and says so; the same plan again keeps it", () => {
  const dir = songDir();
  assert.equal(planAt(dir, 30).status, 0);
  assert.equal(kit(dir, "price", "--film", "film", "--rates", RATES).status, 0);
  const priced = readFileSync(join(dir, "film", "price.json"), "utf8");
  const same = planAt(dir, 30);
  assert.equal(same.status, 0);
  assert.doesNotMatch(same.stdout, /price\.json/);
  assert.equal(readFileSync(join(dir, "film", "price.json"), "utf8"), priced, "the same plan keeps its price");
  const other = planAt(dir, 90);
  assert.equal(other.status, 0);
  assert.match(other.stdout, /^film\/price\.json removed: the plan changed since it was priced; run price again$/m);
  assert.equal(existsSync(join(dir, "film", "price.json")), false);
});

test("a price.json that doesn't carry the plan's hash builds nothing: an old one, or a plan edited by hand", () => {
  const dir = priceDir();
  assert.equal(kit(dir, "price", "--film", "film", "--rates", RATES).status, 0);
  const priced = JSON.parse(readFileSync(join(dir, "film", "price.json"), "utf8"));
  assert.match(priced.plan_sha256, /^[0-9a-f]{64}$/);
  assert.equal(priced.plan_sha256, createHash("sha256").update(readFileSync(join(dir, "film", "plan.json"))).digest("hex"));
  assert.equal(priced.max_fal_usd, null, "the ceiling it judged against");
  assert.equal(stillsOf(dir).status, 0);
  const { plan_sha256, ...old } = priced;
  writeFileSync(join(dir, "film", "price.json"), JSON.stringify(old));
  const urls = [1, 2, 3].map((n) => `https://v3.fal.media/files/rabbit/still${n}.png`).join(",");
  const runs = [
    () => kit(dir, "stills", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--file", "media/stills-2.json"),
    () => kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "1", "--picture", "a calm quay"),
    () => kit(dir, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", urls, "--file", "media/clips.json"),
  ];
  for (const run of runs) {
    const r = run();
    assert.equal(r.status, 2, r.stdout);
    assert.equal(r.stdout, "");
    assert.equal(r.stderr.trim(), CHANGED);
  }
  writeFileSync(join(dir, "film", "price.json"), JSON.stringify(priced));
  const planPath = join(dir, "film", "plan.json");
  writeFileSync(planPath, readFileSync(planPath, "utf8") + " ");
  for (const run of runs) {
    const r = run();
    assert.equal(r.status, 2, r.stdout);
    assert.equal(r.stdout, "");
    assert.equal(r.stderr.trim(), CHANGED);
  }
});

// ---------- the answer, built by code from the run's files ----------
// answer.mjs reads what the run left (the plan, its price, the storyboard, the records, the lyrics, place's read-back,
// the check, the cost, the film) and prints the whole answer, report_markdown included, as one fenced json block. The
// model writes only what no file holds (media/answer-facts.json): the song as given, the status in fal's words, the
// kept warnings and review fixes, the renders, the instructions in the lyrics, notes.
const SCHEMA = JSON.parse(readFileSync(new URL("../templates/music-video/music-video.schema.json", import.meta.url), "utf8"));
// The schema's own rules, enough of JSON Schema for this one: type, enum, const, required, additionalProperties,
// properties, items, maxItems, maxLength, minimum, maximum and pattern. A length counts characters (code points), as JSON
// Schema does, and a pattern is an unanchored ECMA-262 expression.
function schemaProblems(s, v, at = "answer") {
  const out = [];
  const typeOf = (x) => (x === null ? "null" : Array.isArray(x) ? "array" : Number.isInteger(x) ? "integer" : typeof x);
  if (s.type) {
    const types = [s.type].flat();
    const t = typeOf(v);
    if (!types.includes(t) && !(t === "integer" && types.includes("number"))) return [`${at}: ${t}, not ${types.join("|")}`];
  }
  if (s.enum && !s.enum.includes(v)) out.push(`${at}: ${JSON.stringify(v)} is not one of ${JSON.stringify(s.enum)}`);
  if ("const" in s && v !== s.const) out.push(`${at}: ${JSON.stringify(v)} is not ${JSON.stringify(s.const)}`);
  if (typeof v === "string" && s.maxLength !== undefined && [...v].length > s.maxLength) out.push(`${at}: longer than ${s.maxLength}`);
  if (typeof v === "string" && s.pattern && !new RegExp(s.pattern, "u").test(v)) out.push(`${at}: ${JSON.stringify(v)} doesn't match ${s.pattern}`);
  if (typeof v === "number" && s.minimum !== undefined && v < s.minimum) out.push(`${at}: under ${s.minimum}`);
  if (typeof v === "number" && s.maximum !== undefined && v > s.maximum) out.push(`${at}: over ${s.maximum}`);
  if (Array.isArray(v)) {
    if (s.maxItems !== undefined && v.length > s.maxItems) out.push(`${at}: more than ${s.maxItems} items`);
    if (s.items) v.forEach((x, i) => out.push(...schemaProblems(s.items, x, `${at}[${i}]`)));
  } else if (v && typeof v === "object") {
    for (const k of s.required ?? []) if (!(k in v)) out.push(`${at}.${k} is missing`);
    for (const [k, x] of Object.entries(v)) {
      if (s.properties?.[k]) out.push(...schemaProblems(s.properties[k], x, `${at}.${k}`));
      else if (s.additionalProperties === false) out.push(`${at}.${k} is not in the schema`);
    }
  }
  return out;
}
const TABLE = "| Shot | Film time (s) | Bars | Lyric | Picture (as storyboarded) | Used |";
const SONG_URL = "https://media.example.com/masters/paper-ferry.wav";
const answerOf = (dir) => spawnSync(process.execPath, [join(KIT, "answer.mjs"), "--facts", "media/answer-facts.json"], { cwd: dir, encoding: "utf8" });
const factsAt = (dir, facts) => writeFileSync(join(dir, "media", "answer-facts.json"), JSON.stringify(facts, null, 1) + "\n");
const DONE = { status: "completed", failed_step: null, error: null, song: { url: SONG_URL, rights: "own", duration_s: 100 }, renders: 1, max_fal_usd: null };
// The reply: exactly one fenced json block, nothing before or after it.
function replyOf(r) {
  assert.equal(r.status, 0, `answer.mjs exited ${r.status}: ${r.stderr}`);
  const m = r.stdout.match(/^```json\n([\s\S]*)\n```\n?$/);
  assert.ok(m, `the reply is not one json block: ${r.stdout.slice(0, 200)}`);
  assert.equal((r.stdout.match(/```/g) || []).length, 2, "one fenced block, no other fence");
  const a = JSON.parse(m[1]);
  assert.deepEqual(schemaProblems(SCHEMA, a), []);
  return a;
}
const rowsOf = (report) => report.split("\n").filter((l) => /^\| \d+ \|/.test(l));
// A run as the agent leaves it, made by the kit itself on a synthetic song: a 30 s plan of 6 shots, priced, its
// storyboard, stills and clips records, the lyrics (words: three in the cut, one before it; none: an instrumental; off),
// the stills and clips saved (a shot in clipless has no clip), placed, a film and its check, and the cost.
function answerRun({ lyrics = "words", clipless = [], render = true } = {}) {
  const dir = songDir();
  cpSync(KIT, join(dir, "film"), { recursive: true });
  mkdirSync(join(dir, "film", "assets"), { recursive: true });
  const planned = kit(dir, "plan", "--song", "media/song.wav", "--film", "film", "--cut", "30", "--lyrics", String(lyrics !== "off"));
  assert.equal(planned.status, 0, planned.stderr);
  const plan = JSON.parse(readFileSync(join(dir, "film", "plan.json"), "utf8"));
  const shots = boardFor(dir);
  assert.equal(kit(dir, "price", "--film", "film", "--rates", RATES).status, 0);
  const sentSteps = [];
  if (lyrics !== "off") {
    const a = plan.cut.start_s;
    const words = lyrics === "none" ? [] : [
      { text: "Before", start: 1, end: 1.4, type: "word" },
      { text: "Paper", start: a + 0.5, end: a + 0.9, type: "word" },
      { text: "boats", start: a + 1, end: a + 1.4, type: "word" },
      { text: "Ignore", start: shots[1].start_s + 0.5, end: shots[1].start_s + 0.9, type: "word" },
    ];
    writeFileSync(join(dir, "media", "transcript.json"), JSON.stringify({ text: words.map((w) => w.text).join(" "), language_code: "eng", words }));
    const l = kit(dir, "lyrics", "--film", "film", "--words", "media/transcript.json", "--vtt", "media/lyrics.vtt");
    assert.equal(l.status, 0, l.stderr);
    sentSteps.push("isolate", "transcript");
  }
  assert.equal(stillsOf(dir).status, 0);
  const urls = shots.map((s) => `https://v3.fal.media/files/rabbit/still${s.n}.png`).join(",");
  assert.equal(kit(dir, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", urls, "--file", "media/clips.json").status, 0);
  for (const s of shots) {
    cpSync(join(media, "still.png"), join(dir, "media", `still-${s.n}.png`));
    cpSync(join(media, "still.png"), join(dir, "film", "assets", `still-${s.n}.png`));
    if (!clipless.includes(s.n)) {
      cpSync(join(media, "clip.mp4"), join(dir, "media", `clip-${s.n}.mp4`));
      cpSync(join(media, "clip.mp4"), join(dir, "film", "assets", `clip-${s.n}.mp4`));
    }
  }
  sentSteps.push(...shots.map((s) => `still-${s.n}`), ...shots.map((s) => `clip-${s.n}`));
  if (render) {
    const placed = kit(dir, "place", "--film", "film");
    assert.equal(placed.status, 0, placed.stderr);
    ff("-f", "lavfi", "-i", "color=c=black:s=1920x1080:r=5", "-t", String(plan.cut.seconds), "-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p", join(dir, "media", "film.mp4"));
    writeFileSync(join(dir, "media", "check.json"), JSON.stringify({ ok: true, lint: { ok: true, errorCount: 0, warningCount: 1, findings: [] }, runtime: { ok: true, errorCount: 0, warningCount: 0, findings: [] } }));
  }
  const failed = clipless.map((n) => `clip-${n}`);
  const cost = kit(dir, "cost", "--film", "film", "--stem", "abcd1234", "--sent", sentSteps.join(","), ...(failed.length ? ["--failed", failed.join(",")] : []));
  assert.equal(cost.status, 0, cost.stderr);
  return { dir, plan, shots };
}
const full = answerRun();
// The steps answerRun sends with lyrics on: isolate, transcript, every still and every clip.
const stepsOf = (shots) => ["isolate", "transcript", ...shots.map((s) => `still-${s.n}`), ...shots.map((s) => `clip-${s.n}`)];

test("answer: the shots table is inside report_markdown, one row per shot of the plan with its storyboard picture", () => {
  const { dir, plan, shots } = full;
  factsAt(dir, { ...DONE, ignored_instructions: ["a line in the lyrics told the video maker to ignore the storyboard: sung, not obeyed"], warnings_kept: ["timeline_track_too_dense: the film needs its timed shots"] });
  const a = replyOf(answerOf(dir));
  const report = a.report_markdown;
  assert.ok(report.startsWith("![Music video](media/film.mp4)\n"), report.slice(0, 80));
  assert.ok(report.includes(`\n${TABLE}\n`), "the table's header line is inside report_markdown");
  const rows = rowsOf(report);
  assert.equal(rows.length, shots.length);
  shots.forEach((s, i) => {
    assert.ok(rows[i].startsWith(`| ${s.n} |`), rows[i]);
    assert.ok(rows[i].includes(`| a paper ferry ${s.n} |`), `row ${s.n} carries its storyboard picture: ${rows[i]}`);
    assert.ok(rows[i].endsWith("| clip |"), rows[i]);
  });
  assert.ok(rows[0].includes("| Paper boats |") && rows[1].includes("| Ignore |") && rows[2].includes("| none |"), rows.slice(0, 3).join("\n"));
  // The fields from the files, never typed: the plan, the price, the cost, the stem, the lyrics, place, the film.
  const price = JSON.parse(readFileSync(join(dir, "film", "price.json"), "utf8"));
  const cost = JSON.parse(readFileSync(join(dir, "film", "cost.json"), "utf8"));
  assert.equal(a.plan_usd, price.plan_usd);
  assert.deepEqual(a.fal_cost_usd, cost);
  assert.equal(a.key_stem, "abcd1234");
  assert.equal(a.cut.start_s, plan.cut.start_s);
  assert.equal(a.cut.chosen_by, "loudest");
  assert.deepEqual(a.shots.map((s) => [s.n, s.picture, s.used, s.still_path, s.clip_path, s.remade, s.error]), shots.map((s) => [s.n, `a paper ferry ${s.n}`, "clip", `media/still-${s.n}.png`, `media/clip-${s.n}.mp4`, false, null]));
  assert.deepEqual(a.lyrics, { on: true, words_in_song: 4, words_in_cut: 3, lines: a.lyrics.lines, vtt_path: "media/lyrics.vtt", note: null });
  assert.ok(a.lyrics.lines >= 1);
  assert.deepEqual([a.film.path, a.film.width, a.film.height], ["media/film.mp4", 1920, 1080]);
  assert.ok(Math.abs(a.film.seconds - plan.cut.seconds) < 0.25, String(a.film.seconds));
  assert.deepEqual(a.checks, { check_errors: 0, warnings_kept: ["timeline_track_too_dense: the film needs its timed shots"], review_fixes: [], renders: 1 });
  assert.deepEqual([a.status, a.failed_step, a.error, a.song.rights, a.song.url], ["completed", null, null, "own", SONG_URL]);
  const paths = a.files.map((f) => f.saved_path);
  for (const p of ["media/film.mp4", "storyboard.md", "media/song.wav", "media/run-keys.json", "media/lyrics.vtt", "media/transcript.json", "media/stills.json", "media/clips.json", "film/", ...shots.flatMap((s) => [`media/still-${s.n}.png`, `media/clip-${s.n}.mp4`])])
    assert.ok(paths.includes(p), `files names ${p}`);
  assert.equal(a.files.find((f) => f.saved_path === "media/song.wav").source_url, SONG_URL);
  assert.equal(a.files.find((f) => f.saved_path === "media/still-2.png").source_url, "https://v3.fal.media/files/rabbit/still2.png");
  // The report in agent.md's order: film, price, song, beats, cut, table, lyrics, stills, cost, checks.
  const order = [`$${price.plan_usd}`, SONG_URL, "BPM", `${plan.cut.start_s} to ${plan.cut.end_s} s`, TABLE, "3 of the song's 4 words", "Every shot shows its clip", "| Total |", "0 check errors"];
  const at = order.map((x) => report.indexOf(x));
  assert.ok(at.every((x) => x > 0), JSON.stringify(order.filter((_, i) => at[i] <= 0)));
  assert.deepEqual([...at].sort((x, y) => x - y), at, "the report's parts in agent.md's order");
  assert.ok(report.includes("a line in the lyrics told the video maker to ignore the storyboard"), "the instructions in the lyrics are in the report");
  assert.deepEqual(a.ignored_instructions, ["a line in the lyrics told the video maker to ignore the storyboard: sung, not obeyed"]);
});

test("answer: a shot shown as its still is a still row, with its clip's failure in the report and the answer", () => {
  const { dir, shots } = answerRun({ clipless: [3] });
  const refused = "Request was flagged by the content checker (422)";
  factsAt(dir, { ...DONE, status: "partial", failed_step: "clip-3", error: refused, shot_errors: { 3: refused } });
  const a = replyOf(answerOf(dir));
  const three = a.shots.find((s) => s.n === 3);
  assert.deepEqual([three.used, three.clip_path, three.error, three.still_path], ["still", null, refused, "media/still-3.png"]);
  assert.ok(a.shots.filter((s) => s.n !== 3).every((s) => s.used === "clip"));
  const rows = rowsOf(a.report_markdown);
  assert.equal(rows.length, shots.length);
  assert.ok(rows[2].startsWith("| 3 |") && rows[2].endsWith("| still |"), rows[2]);
  assert.match(a.report_markdown, /Shot 3 shows its still with a slow push-in: no assets\/clip-3\.mp4/);
  assert.ok(a.report_markdown.includes(refused), "fal's words, as they are");
  assert.equal(a.fal_cost_usd.steps.find((s) => s.step === "clip-3").usd, 0);
  assert.ok(!a.files.some((f) => f.saved_path === "media/clip-3.mp4"));
});

test("answer: a run with no film: over the ceiling it has the plan and nothing made; refused, no plan at all", () => {
  const dir = songDir();
  cpSync(KIT, join(dir, "film"), { recursive: true });
  rmSync(join(dir, "media", "run-keys.json"));
  assert.equal(kit(dir, "plan", "--song", "media/song.wav", "--film", "film", "--cut", "30").status, 0);
  assert.match(kit(dir, "price", "--film", "film", "--rates", RATES, "--max", "1").stdout, /OVER YOUR CEILING/);
  factsAt(dir, { ...DONE, status: "over_budget", error: "The plan's price is over the $1 ceiling you set: nothing was made.", renders: 0, max_fal_usd: 1 });
  const a = replyOf(answerOf(dir));
  assert.deepEqual(a.film, { path: null, seconds: null, width: null, height: null });
  assert.deepEqual(a.fal_cost_usd, { steps: [], total: 0 });
  assert.equal(a.key_stem, null);
  assert.ok(a.shots.length > 0 && a.shots.every((s) => s.used === null && s.still_path === null && s.clip_path === null));
  assert.ok(!a.report_markdown.includes("![Music video]"), "no film, no embed");
  assert.match(a.report_markdown, /over the \$1 ceiling you set \(max_fal_usd\)/);
  assert.match(a.report_markdown, /nothing was made and nothing was paid/);
  assert.equal(rowsOf(a.report_markdown).length, a.shots.length, "the plan's shots, in the table");
  assert.equal(a.checks.check_errors, null);
  // Something was paid: the over_budget report says nothing was, so the status is refused.
  writeFileSync(join(dir, "film", "cost.json"), JSON.stringify({ steps: [{ step: "isolate", key: null, endpoint_id: "fal-ai/elevenlabs/audio-isolation", units: 1.6667, unit: "minutes", rate_usd: 0.1, usd: 0.167, pending: false }], total: 0.167 }));
  assert.match(lineOf(refusedBy(answerOf(dir), "over_budget with a cost"), "over_budget"), /film\/cost\.json/);
  rmSync(join(dir, "film", "cost.json"));

  const none = join(root, `refused-${++runs}`);
  mkdirSync(join(none, "media"), { recursive: true });
  const why = "The film puts the song under its pictures, so it is made only for a song you own or hold a license for: set song_rights to own or licensed.";
  factsAt(none, { status: "refused", failed_step: "rights", error: why, song: { url: SONG_URL, rights: null, duration_s: null }, renders: 0, lyrics_on: true, max_fal_usd: null });
  const r = replyOf(answerOf(none));
  assert.deepEqual([r.beats, r.cut, r.shots, r.plan_usd, r.key_stem], [null, null, [], null, null]);
  assert.deepEqual(r.fal_cost_usd, { steps: [], total: 0 });
  assert.ok(r.report_markdown.includes(why));
  assert.ok(!r.report_markdown.includes(TABLE), "no plan, no shots table");
});

test("answer: missing lyrics say why: lyrics off, no words in the song, the isolation step failed", () => {
  const off = answerRun({ lyrics: "off" });
  factsAt(off.dir, DONE);
  const a = replyOf(answerOf(off.dir));
  assert.deepEqual([a.lyrics.on, a.lyrics.words_in_song, a.lyrics.vtt_path], [false, null, null]);
  assert.match(a.lyrics.note, /lyrics were off/i);
  assert.match(a.report_markdown, /lyrics were off/i);
  assert.ok(!a.files.some((f) => f.saved_path === "media/lyrics.vtt"));
  assert.ok(rowsOf(a.report_markdown).every((row) => row.includes("| none |")), "no lyric under any shot");

  const instrumental = answerRun({ lyrics: "none" });
  factsAt(instrumental.dir, DONE);
  const b = replyOf(answerOf(instrumental.dir));
  assert.deepEqual([b.lyrics.on, b.lyrics.words_in_song, b.lyrics.words_in_cut, b.lyrics.lines, b.lyrics.vtt_path], [true, 0, 0, 0, null]);
  assert.match(b.lyrics.note, /no words/i);
  assert.match(b.report_markdown, /no words/i);

  // Isolation failed: no transcript and no lyrics file; the run went on without captions.
  const failed = join(root, `isolate-${++runs}`);
  cpSync(off.dir, failed, { recursive: true });
  const planPath = join(failed, "film", "plan.json");
  writeFileSync(planPath, readFileSync(planPath, "utf8").replace('"lyrics_on": false', '"lyrics_on": true'));
  assert.equal(kit(failed, "price", "--film", "film", "--rates", RATES).status, 0);
  const said = "Audio isolation failed: the file could not be decoded";
  factsAt(failed, { ...DONE, status: "partial", failed_step: "isolate", error: said });
  const c = replyOf(answerOf(failed));
  assert.deepEqual([c.lyrics.on, c.lyrics.words_in_song, c.lyrics.words_in_cut, c.lyrics.lines, c.lyrics.vtt_path], [true, null, null, null, null]);
  assert.match(c.lyrics.note, /isolat/i);
  assert.ok(c.report_markdown.includes(said));
});

// A copy of a finished run for a test that changes it. film/assets (the joined shots.mp4 and the clips and stills place
// read, about 126 MB a copy) is left out: only place reads it, and no test runs place on a copy.
const copyRun = (from, dir) => cpSync(from, dir, { recursive: true, filter: (src) => src !== join(from, "film", "assets") });

test("answer: unreadable or missing input exits non-zero with words and prints no answer", () => {
  const variant = (name, change) => {
    const dir = join(root, `broken-${name}-${++runs}`);
    copyRun(full.dir, dir);
    factsAt(dir, DONE);
    change(dir);
    const r = answerOf(dir);
    assert.notEqual(r.status, 0, `${name}: exited 0`);
    assert.equal(r.stdout, "", `${name}: an answer was printed`);
    assert.ok(r.stderr.trim().length > 0, `${name}: no words`);
    return r.stderr;
  };
  assert.match(variant("facts-not-json", (d) => writeFileSync(join(d, "media", "answer-facts.json"), "{status: completed")), /answer-facts\.json/);
  assert.match(variant("facts-missing", (d) => rmSync(join(d, "media", "answer-facts.json"))), /answer-facts\.json/);
  assert.match(variant("facts-unknown-field", (d) => factsAt(d, { ...DONE, report_markdown: "| Shot | ... my own table |" })), /report_markdown/);
  assert.match(variant("plan-not-json", (d) => writeFileSync(join(d, "film", "plan.json"), "{")), /plan\.json/);
  assert.match(variant("lyrics-not-json", (d) => writeFileSync(join(d, "film", "lyrics.json"), "[}")), /lyrics\.json/);
  assert.match(variant("placed-of-another-plan", (d) => rewriteJson(join(d, "film", "placed.json"), (p) => ({ ...p, shots: p.shots.slice(1) }))), /placed\.json/);
  assert.match(variant("cost-missing", (d) => rmSync(join(d, "film", "cost.json"))), /cost/);
  assert.match(variant("film-unreadable", (d) => writeFileSync(join(d, "media", "film.mp4"), "not a video")), /film\.mp4/);
  assert.match(variant("storyboard-of-another-plan", (d) => writeFileSync(join(d, "storyboard.md"), `Style: ${STYLE}\n1 | 5 s | lyric: "none" | picture: a quay | motion: still\n`)), /storyboard/);
});
const rewriteJson = (path, change) => writeFileSync(path, JSON.stringify(change(JSON.parse(readFileSync(path, "utf8")))));

// ---------- the answer against the schema, and the remakes ----------
// The answer is checked against the schema before it is printed, rule by rule as the schema file states them. Fal's
// words (a shot's error, the error of a failed fal step) and the transcript's lyric are the kit's to carry: over a
// limit they are cut, with a marker naming where the whole text is. What the model wrote in the facts is its own to
// shorten: over a limit it is refused, naming the field and the limit, and nothing is printed.
const KIT_SCHEMA = join(KIT, "music-video.schema.json");
const copyOf = (name, from = full.dir) => {
  const dir = join(root, `${name}-${++runs}`);
  copyRun(from, dir);
  return dir;
};
const refusedBy = (r, name) => {
  assert.notEqual(r.status, 0, `${name}: exited 0`);
  assert.equal(r.stdout, "", `${name}: an answer was printed`);
  return r.stderr;
};
const lineOf = (stderr, field) => stderr.split("\n").find((l) => l.includes(field)) ?? "";
const cutMarker = (max, where) => `… (cut at ${max} characters; the whole text is in ${where})`;

test("answer: the kit's music-video.schema.json is the template's, byte for byte", () => {
  assert.ok(existsSync(KIT_SCHEMA), "the kit ships the schema answer.mjs checks against (a run holds only the skill's folder)");
  assert.equal(readFileSync(KIT_SCHEMA, "utf8"), readFileSync(new URL("../templates/music-video/music-video.schema.json", import.meta.url), "utf8"));
});

test("answer: fal's words over a field's limit are cut with a marker naming the whole text's file, and the answer fits the schema", () => {
  const dir = copyOf("long-words");
  // Characters outside the BMP: a length counts code points, and a cut never splits one.
  const shotWords = "Kling refused the job 🎬 ".repeat(80);
  const stepWords = "fal answered 500 Internal Server Error 🎵 ".repeat(70);
  rewriteJson(join(dir, "film", "lyrics.json"), (l) => ({ ...l, under_shots: l.under_shots.map((u) => (u.n === 2 ? { ...u, lyric: "la ".repeat(300) } : u)) }));
  factsAt(dir, { ...DONE, status: "partial", failed_step: "clip-3", error: stepWords, shot_errors: { 3: shotWords } });
  const r = answerOf(dir);
  const a = replyOf(r);
  const three = a.shots.find((s) => s.n === 3), two = a.shots.find((s) => s.n === 2);
  assert.ok(three.error.endsWith(cutMarker(600, "media/answer-facts.json")), three.error.slice(-120));
  assert.ok(three.error.startsWith(shotWords.slice(0, 200)), "the start of fal's words, as they are");
  assert.ok([...three.error].length <= 600 && three.error.isWellFormed());
  assert.ok(a.error.endsWith(cutMarker(2000, "media/answer-facts.json")), a.error.slice(-120));
  assert.ok([...a.error].length <= 2000 && a.error.isWellFormed());
  assert.ok(two.lyric.endsWith(cutMarker(600, "film/lyrics.json")), two.lyric.slice(-120));
  assert.ok(a.report_markdown.includes(cutMarker(2000, "media/answer-facts.json")), "the report shows the cut");
  assert.match(r.stderr, /cut/, "and says so");
  // Under the limit nothing is cut.
  factsAt(dir, { ...DONE, status: "partial", failed_step: "clip-3", error: "fal: 422", shot_errors: { 3: "fal: 422" } });
  const b = replyOf(answerOf(dir));
  assert.deepEqual([b.error, b.shots.find((s) => s.n === 3).error], ["fal: 422", "fal: 422"]);
});

test("answer: the model's facts over the schema's limits are refused, naming each field and its limit", () => {
  const dir = copyOf("long-facts");
  const many = (what) => Array.from({ length: 21 }, (_, i) => `${what} ${i + 1}`);
  factsAt(dir, { ...DONE, warnings_kept: many("a warning kept"), review_fixes: many("a review fix"), ignored_instructions: many("an instruction in the lyrics") });
  const e = refusedBy(answerOf(dir), "21 of each");
  for (const field of ["warnings_kept", "review_fixes", "ignored_instructions"]) assert.match(lineOf(e, field), /\b20\b/, `${field}: ${e}`);
  factsAt(dir, { ...DONE, ignored_instructions: ["x".repeat(401)] });
  assert.match(lineOf(refusedBy(answerOf(dir), "a long instruction"), "ignored_instructions"), /\b400\b/);
  factsAt(dir, { ...DONE, song: { ...DONE.song, url: `${SONG_URL}?${"q".repeat(2000)}` } });
  assert.match(lineOf(refusedBy(answerOf(dir), "a long song url"), "song.url"), /\b2000\b/);
  // A refusal's own words are the model's: refused, never cut.
  const none = join(root, `refused-long-${++runs}`);
  mkdirSync(join(none, "media"), { recursive: true });
  factsAt(none, { status: "refused", failed_step: "rights", error: "Set song_rights to own or licensed. ".repeat(60), song: { url: SONG_URL, rights: null, duration_s: null }, renders: 0, lyrics_on: true, max_fal_usd: null });
  assert.match(lineOf(refusedBy(answerOf(none), "a long refusal"), "error"), /\b2000\b/);
});

test("answer: the check is the schema file's: a tightened limit in the kit's copy refuses, and a keyword it doesn't check stops it", () => {
  const kitCopy = join(root, `kit-${++runs}`);
  cpSync(KIT, kitCopy, { recursive: true });
  const schemaAt = join(kitCopy, "music-video.schema.json");
  const schema = JSON.parse(readFileSync(KIT_SCHEMA, "utf8"));
  const run = (s) => {
    writeFileSync(schemaAt, JSON.stringify(s));
    factsAt(full.dir, DONE);
    return spawnSync(process.execPath, [join(kitCopy, "answer.mjs"), "--facts", "media/answer-facts.json"], { cwd: full.dir, encoding: "utf8" });
  };
  const tight = structuredClone(schema);
  tight.properties.shots.items.properties.picture.maxLength = 5;
  assert.match(lineOf(refusedBy(run(tight), "picture at 5"), "picture"), /\b5\b/);
  const unknown = structuredClone(schema);
  unknown.properties.shots.items.properties.picture.minLength = 1;
  assert.match(refusedBy(run(unknown), "an unknown keyword"), /minLength/);
  assert.equal(run(schema).status, 0, "the copy as shipped passes");
});

test("answer: a failed remake is a failed attempt and the first take; a borrowed still only when both takes are missing; one line per shot", () => {
  const dir = copyOf("remade");
  const r = kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "2", "--picture", "a paper ferry on teal water, seen from far behind");
  assert.equal(r.status, 0, r.stderr);
  // The clips were built before this remake, from shot 2's first take.
  const url2 = "https://v3.fal.media/files/rabbit/still2.png";
  const linesOf = (report, n) => report.split("\n").filter((l) => new RegExp(`^- Shot ${n}\\b`).test(l));
  const sourceOf = (a, path) => a.files.find((f) => f.saved_path === path)?.source_url;
  const costWith = (...failed) => {
    const c = kit(dir, "cost", "--film", "film", "--stem", "abcd1234", "--sent", [...stepsOf(full.shots), "still-2-2"].join(","), ...(failed.length ? ["--failed", failed.join(",")] : []));
    assert.equal(c.status, 0, c.stderr);
  };

  // The remake failed: nothing at media/still-2-2.png, so the film uses the first take.
  costWith("still-2-2");
  const failed = { ...DONE, status: "partial", failed_step: "still-2", error: "fal: the remake failed", shot_errors: { 2: "fal: the remake failed" } };
  factsAt(dir, failed);
  const a = replyOf(answerOf(dir));
  const two = a.shots.find((s) => s.n === 2);
  assert.deepEqual([two.remade, two.still_path], [false, "media/still-2.png"]);
  assert.equal(linesOf(a.report_markdown, 2).length, 1, a.report_markdown);
  assert.match(linesOf(a.report_markdown, 2)[0], /remake of its still tried, which failed/);
  assert.doesNotMatch(a.report_markdown, /second take/);
  assert.equal(sourceOf(a, "media/still-2.png"), url2);

  // Fal made the remake (billed in full) and its save failed: made, not saved, never "failed".
  costWith();
  factsAt(dir, { ...DONE, failed_saves: [{ what: "still", source_url: null }] });
  const m = replyOf(answerOf(dir));
  assert.deepEqual([m.shots.find((s) => s.n === 2).remade, m.shots.find((s) => s.n === 2).still_path], [false, "media/still-2.png"]);
  assert.equal(linesOf(m.report_markdown, 2).length, 1, m.report_markdown);
  assert.match(linesOf(m.report_markdown, 2)[0], /made, not saved/);
  assert.doesNotMatch(linesOf(m.report_markdown, 2)[0], /failed/);

  // The remake saved: the film uses the second take. The clips' URL is shot 2's first take (they were built before
  // the remake), so it is credited to media/still-2.png when the run's sources say so, and never to the remake's file.
  cpSync(join(media, "still.png"), join(dir, "media", "still-2-2.png"));
  factsAt(dir, DONE);
  const b = replyOf(answerOf(dir));
  const two2 = b.shots.find((s) => s.n === 2);
  assert.deepEqual([two2.remade, two2.still_path], [true, "media/still-2-2.png"]);
  assert.equal(linesOf(b.report_markdown, 2).length, 1);
  assert.match(linesOf(b.report_markdown, 2)[0], /second take/);
  assert.deepEqual([sourceOf(b, "media/still-2-2.png"), sourceOf(b, "media/still-2.png")], [null, null]);
  factsAt(dir, { ...DONE, sources: { "media/still-2.png": url2 } });
  const b2 = replyOf(answerOf(dir));
  assert.deepEqual([sourceOf(b2, "media/still-2-2.png"), sourceOf(b2, "media/still-2.png")], [null, url2]);
  // Sources that give the first take another URL: the clips' URL is the remake's.
  const first2 = "https://v3.fal.media/files/rabbit/first2.png";
  factsAt(dir, { ...DONE, sources: { "media/still-2.png": first2 } });
  const b3 = replyOf(answerOf(dir));
  assert.deepEqual([sourceOf(b3, "media/still-2-2.png"), sourceOf(b3, "media/still-2.png")], [url2, first2]);

  // Both takes missing: it borrows shot 1's still, in one line, and no take of its own is said to be used.
  rmSync(join(dir, "media", "still-2-2.png"));
  rmSync(join(dir, "media", "still-2.png"));
  factsAt(dir, { ...failed, borrowed: { 2: 1 } });
  const c = replyOf(answerOf(dir));
  const two3 = c.shots.find((s) => s.n === 2);
  assert.deepEqual([two3.remade, two3.still_path], [false, "media/still-1.png"]);
  assert.equal(linesOf(c.report_markdown, 2).length, 1, c.report_markdown);
  assert.match(linesOf(c.report_markdown, 2)[0], /shot 1's/);
  assert.doesNotMatch(c.report_markdown, /second take/);

  // A shot whose own still is saved borrows nothing.
  cpSync(join(media, "still.png"), join(dir, "media", "still-2.png"));
  assert.match(refusedBy(answerOf(dir), "borrowed with a still of its own"), /borrowed/);
});

// ---------- review: the ceiling rests on the kit's numbers, not the model's ----------
// price refuses a rate under list (above), records the run's first --max in film/ceiling.json (which plan never
// removes) and refuses a missing or different --max once a ceiling is recorded; stills, remake and clips judge the
// price again from the plan and its rates against that ceiling, never by its fits flag.
test("price records the run's first --max in film/ceiling.json, which plan leaves; after a ceiling, a missing or different --max is refused", () => {
  const dir = songDir();
  const ceilingOf = (d) => JSON.parse(readFileSync(join(d, "film", "ceiling.json"), "utf8"));
  const pricePath = join(dir, "film", "price.json");
  assert.equal(planAt(dir, 30).status, 0);
  assert.equal(kit(dir, "price", "--film", "film", "--rates", RATES, "--max", "8").status, 0);
  assert.deepEqual(ceilingOf(dir), { max_fal_usd: 8 });
  const priced8 = readFileSync(pricePath, "utf8");
  for (const max of [[], ["--max", "9"], ["--max", "0"]]) {
    const r = kit(dir, "price", "--film", "film", "--rates", RATES, ...max);
    assert.equal(r.status, 2, `${max}: ${r.stdout}`);
    assert.equal(r.stdout, "");
    assert.match(r.stderr, /film\/ceiling\.json records max_fal_usd 8/, `${max}`);
    assert.equal(readFileSync(pricePath, "utf8"), priced8, "the price is left as it was");
    assert.deepEqual(ceilingOf(dir), { max_fal_usd: 8 });
  }
  // A new plan removes the price, never the ceiling.
  assert.equal(planAt(dir, 90).status, 0);
  assert.equal(existsSync(pricePath), false);
  assert.deepEqual(ceilingOf(dir), { max_fal_usd: 8 });
  assert.equal(kit(dir, "price", "--film", "film", "--rates", RATES).status, 2, "a re-plan doesn't drop the ceiling");
  assert.equal(kit(dir, "price", "--film", "film", "--rates", RATES, "--max", "8").status, 0);
  // Priced first with no ceiling: a ceiling given later is recorded, and from then on holds.
  const open = songDir();
  assert.equal(planAt(open, 30).status, 0);
  assert.equal(kit(open, "price", "--film", "film", "--rates", RATES).status, 0);
  assert.deepEqual(ceilingOf(open), { max_fal_usd: null });
  assert.equal(kit(open, "price", "--film", "film", "--rates", RATES).status, 0, "no ceiling again is the same");
  assert.equal(kit(open, "price", "--film", "film", "--rates", RATES, "--max", "5").status, 0);
  assert.deepEqual(ceilingOf(open), { max_fal_usd: 5 });
  assert.equal(kit(open, "price", "--film", "film", "--rates", RATES).status, 2);
});

test("stills, remake and clips judge the price again from the plan and its rates, never by its fits flag or its own ceiling", () => {
  const dir = priceDir();
  assert.match(kit(dir, "price", "--film", "film", "--rates", RATES, "--max", "1").stdout, /OVER YOUR CEILING/);
  const path = join(dir, "film", "price.json");
  const p = JSON.parse(readFileSync(path, "utf8"));
  const urls = [1, 2, 3].map((n) => `https://v3.fal.media/files/rabbit/still${n}.png`).join(",");
  const hand = [
    ["fits true by hand", { ...p, fits: true }],
    ["a plan_usd under the ceiling and fits true", { ...p, plan_usd: 0.9, fits: true }],
    ["no ceiling and fits true", { ...p, max_fal_usd: null, fits: true }],
    ["a ceiling raised by hand", { ...p, max_fal_usd: 1000, fits: true }],
    ["a rate under list", { ...p, rates: { ...p.rates, clip: 0.001, still: 0.001 }, plan_usd: 0.5, fits: true }],
  ];
  for (const [what, price] of hand) {
    writeFileSync(path, JSON.stringify(price, null, 1) + "\n");
    for (const [name, r] of [["stills", stillsOf(dir)], ["clips", kit(dir, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", urls, "--file", "media/clips.json")]]) {
      assert.equal(r.status, 2, `${what}, ${name}: ${r.stdout}`);
      assert.equal(r.stdout, "", `${what}, ${name}`);
    }
  }
  assert.equal(recordOf(dir, "clips.json"), undefined);
});

// ---------- review: the cost bills each recorded still and clip once ----------
test("cost bills each still and clip the kit recorded exactly once: a duplicate, a missing or an unknown key is refused, naming the key", () => {
  const dir = copyOf("cost-keys");
  const costPath = join(dir, "film", "cost.json");
  const before = readFileSync(costPath, "utf8");
  const costOf = (steps) => kit(dir, "cost", "--film", "film", "--stem", "abcd1234", "--sent", steps.join(","));
  const steps = stepsOf(full.shots);
  const cases = [
    ["a still twice", [...steps, "still-1"], /mu-abcd1234-still-1/],
    ["a clip left out", steps.filter((s) => s !== "clip-3"), /mu-abcd1234-clip-3/],
    ["a remake the record doesn't hold", [...steps, "still-2-2"], /mu-abcd1234-still-2-2/],
    ["the isolation twice", [...steps, "isolate"], /mu-abcd1234-isolate/],
  ];
  for (const [what, sent, key] of cases) {
    const r = costOf(sent);
    assert.equal(r.status, 2, `${what}: ${r.stdout}`);
    assert.equal(r.stdout, "", what);
    assert.match(r.stderr, key, what);
    assert.equal(readFileSync(costPath, "utf8"), before, `${what}: film/cost.json is left as it was`);
  }
  const ok = costOf(steps);
  assert.equal(ok.status, 0, ok.stderr);
});

test("answer: film/cost.json bills each recorded still and clip once: a duplicate, a missing or an unknown step is refused, naming the key", () => {
  const dir = copyOf("answer-cost-keys");
  factsAt(dir, DONE);
  const path = join(dir, "film", "cost.json");
  const c = JSON.parse(readFileSync(path, "utf8"));
  const step = (name) => c.steps.find((s) => s.step === name);
  const variants = [
    ["a still twice", { ...c, steps: [...c.steps, step("still-1")] }, "mu-abcd1234-still-1"],
    ["a clip left out", { ...c, steps: c.steps.filter((s) => s.step !== "clip-3") }, "mu-abcd1234-clip-3"],
    ["a remake the record doesn't hold", { ...c, steps: [...c.steps, { ...step("still-2"), step: "still-2-2", key: "mu-abcd1234-still-2-2" }] }, "mu-abcd1234-still-2-2"],
  ];
  for (const [what, cost, key] of variants) {
    writeFileSync(path, JSON.stringify(cost));
    assert.match(lineOf(refusedBy(answerOf(dir), what), key), /film\/cost\.json/, what);
  }
});

// ---------- review: the input's max_fal_usd is a fact the price and the recorded ceiling must agree with ----------
test("answer: max_fal_usd is the input's, a fact, and must be the ceiling the price used and the run recorded", () => {
  const dir = copyOf("answer-max");
  factsAt(dir, { ...DONE, max_fal_usd: 8 });
  assert.match(lineOf(refusedBy(answerOf(dir), "a ceiling the price never used"), "max_fal_usd"), /film\/price\.json/);
  const { max_fal_usd, ...none } = DONE;
  factsAt(dir, none);
  assert.match(refusedBy(answerOf(dir), "no max_fal_usd fact"), /max_fal_usd/);
  rewriteJson(join(dir, "film", "price.json"), (p) => ({ ...p, max_fal_usd: 100 }));
  factsAt(dir, { ...DONE, max_fal_usd: 100 });
  assert.match(lineOf(refusedBy(answerOf(dir), "a price whose ceiling isn't the recorded one"), "max_fal_usd"), /film\/ceiling\.json/);
});

// ---------- review: an over-long report names what holds its length ----------
test("answer: an over-long report_markdown names the storyboard's pictures in the shots table", () => {
  const kitCopy = join(root, `kit-${++runs}`);
  cpSync(KIT, kitCopy, { recursive: true });
  const schema = JSON.parse(readFileSync(KIT_SCHEMA, "utf8"));
  schema.properties.report_markdown.maxLength = 200;
  writeFileSync(join(kitCopy, "music-video.schema.json"), JSON.stringify(schema));
  factsAt(full.dir, DONE);
  const r = spawnSync(process.execPath, [join(kitCopy, "answer.mjs"), "--facts", "media/answer-facts.json"], { cwd: full.dir, encoding: "utf8" });
  assert.match(lineOf(refusedBy(r, "report over 200"), "report_markdown"), /storyboard\.md/);
});

// ---------- review: the sent check ties each clip to its shot's still, and reads the price ----------
// The clips' still URLs are the one input the kit takes from outside. The fake log holds each call's arguments, never
// fal's answer, so the check reads the answers from the case's own fake (its fixtures/fal-mcp.json in this repo):
// shot n's still is its remake's output when media/still-<n>-2.png was saved, else its first take's.
function remadeRun(urlFor3) {
  const dir = stillsDir({ shots: Array(SHORT).fill(4) });
  assert.equal(stillsOf(dir).status, 0);
  assert.equal(kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", "3", "--picture", "a teal quay at dusk").status, 0);
  writeFileSync(join(dir, "media", "still-3-2.png"), "png");
  const urls = SHORT_STILLS.map((u, i) => (i === 2 ? urlFor3 : u));
  const c = kit(dir, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", urls.join(","), "--file", "media/clips.json");
  assert.equal(c.status, 0, c.stderr);
  costed(dir);
  return dir;
}
test("the sent check ties each clip's still URL to its shot's still as the fake fal made it: the remake's when it was saved", () => {
  const remade = remadeRun(SHORT_REMAKE_3);
  assert.equal(check(reportOf(remade, callsFrom(remade)), remade).stdout, "SENT PASS n=17\n");
  // Clips built before the remake: shot 3's clip starts from its first take, not the still the film uses.
  const early = remadeRun(SHORT_STILLS[2]);
  const r = check(reportOf(early, callsFrom(early)), early);
  assert.equal(r.status, 1, r.stdout);
  assert.equal(r.stdout, `SENT FAIL clips: shot 3's clip starts from "${SHORT_STILLS[2]}", not shot 3's still as the fake fal made it: "${SHORT_REMAKE_3}" (its remake, saved as media/still-3-2.png)\n`);
  // Shot 1's clip given shot 3's still, its call sent to match: the kit rebuilds the same record from that URL.
  const { dir } = sentRun();
  rewrite(dir, "clips.json", (rec) => (rec.clips[0].start_image_url = SHORT_STILLS[2]));
  const swapped = check(reportOf(dir, callsFrom(dir)), dir);
  assert.equal(swapped.status, 1, swapped.stdout);
  assert.equal(swapped.stdout, `SENT FAIL clips: shot 1's clip starts from "${SHORT_STILLS[2]}", not shot 1's still as the fake fal made it: "${SHORT_STILLS[0]}" (its first take)\n`);
});

test("the sent check reads film/price.json: there, of the plan rebuilt, fitting its ceiling, and the calls sent within it", () => {
  const pricePath = (d) => join(d, "film", "price.json");
  const cases = [
    ["no price", (d) => rmSync(pricePath(d)), "SENT FAIL price: the run left no film/price.json\n"],
    ["a plan edited after its price", (d) => writeFileSync(join(d, "film", "plan.json"), readFileSync(join(d, "film", "plan.json"), "utf8") + " "), "SENT FAIL price: film/price.json's plan_sha256 is not film/plan.json's: the price is of another plan\n"],
    ["fits false", (d) => rewriteJson(pricePath(d), (p) => ({ ...p, fits: false })), "SENT FAIL price: film/price.json's fits is false, not true\n"],
    // The user's ceiling is the case's (its prompt.md input, here 1); the run's price and record say 1 by hand.
    ["fits true over its ceiling", (d) => {
      rewriteJson(pricePath(d), (p) => ({ ...p, max_fal_usd: 1 }));
      writeFileSync(join(d, "film", "ceiling.json"), JSON.stringify({ max_fal_usd: 1 }) + "\n");
    }, /^SENT FAIL price: film\/price\.json's plan_usd 6\.153 is over the case's max_fal_usd 1 \(its prompt\.md input\) \(and 1 more\)\n$/, 1],
  ];
  for (const [what, change, line, max] of cases) {
    const { dir, calls } = sentRun();
    change(dir);
    const r = checkAt(max === undefined ? CHECK : checkWithCeiling(max), reportOf(dir, calls), dir);
    assert.equal(r.status, 1, `${what}: ${r.stdout}`);
    if (typeof line === "string") assert.equal(r.stdout, line, what);
    else assert.match(r.stdout, line, what);
  }
  // Priced at a ceiling equal to the plan, the case's input: the calls the records hold fit; five isolations sent go
  // over it (each at its line's price, as cost bills it: 8 x 0.15 + 32 x 0.14 + 5 x 0.133).
  const { dir, calls } = sentRun();
  const plan = JSON.parse(readFileSync(pricePath(dir), "utf8")).plan_usd;
  const at = checkWithCeiling(plan);
  assert.match(kit(dir, "price", "--film", "film", "--rates", RATES, "--max", String(plan)).stdout, /: FITS\n/);
  assert.equal(checkAt(at, reportOf(dir, calls), dir).stdout, "SENT PASS n=16\n");
  const isolate = { tool: "mcp:fal/submit_job", arguments: { endpoint_id: "fal-ai/elevenlabs/audio-isolation", submission_key: "mu-abcd1234-isolate", input: { audio_url: SONG_URL } } };
  const over = checkAt(at, reportOf(dir, [...calls, ...Array(5).fill(isolate)]), dir);
  assert.equal(over.status, 1, over.stdout);
  assert.match(over.stdout, new RegExp(`^SENT FAIL price: the calls sent come to \\$6\\.345 at film/price\\.json's rates, over the case's max_fal_usd ${String(plan).replace(".", "\\.")}\\n$`));
});

// ---------- review of the sent check's price: it prices the calls sent from the plan, never from the file's lines ----------
// film/price.json's lines are the run's to write. The check prices the plan again from film/plan.json and the file's
// rates (in their bands), with the repo's kit, and prices each call sent from those lines: a file with no lines, a line
// that isn't a number, lines under the plan's price at rates in band, rates under list, or a call the plan has no line
// for all fail.
const ISOLATE_CALL = (key = "mu-abcd1234-isolate") => ({ tool: "mcp:fal/submit_job", arguments: { endpoint_id: "fal-ai/elevenlabs/audio-isolation", submission_key: key, input: { audio_url: SONG_URL } } });
// A run priced at a ceiling equal to its plan, the case's input: the calls the records hold fit it exactly.
function fittedRun() {
  const run = sentRun();
  const plan = JSON.parse(readFileSync(join(run.dir, "film", "price.json"), "utf8")).plan_usd;
  const at = checkWithCeiling(plan);
  assert.match(kit(run.dir, "price", "--film", "film", "--rates", RATES, "--max", String(plan)).stdout, /: FITS\n/);
  assert.equal(checkAt(at, reportOf(run.dir, run.calls), run.dir).stdout, "SENT PASS n=16\n");
  return { ...run, at, path: join(run.dir, "film", "price.json") };
}
function sentFails(dir, calls, first, more, at = CHECK) {
  const r = checkAt(at, reportOf(dir, calls), dir);
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, first);
  if (more) assert.match(r.stdout, more);
}
test("the sent check: a price.json with no lines fails, and the calls sent are priced from the plan, over its ceiling", () => {
  const { dir, calls, at, path } = fittedRun();
  rewriteJson(path, (p) => ({ ...p, lines: [] }));
  sentFails(dir, [...calls, ...Array(5).fill(ISOLATE_CALL())], /^SENT FAIL price: film\/price\.json's lines are not the plan's at its rates/, /\(and 1 more\)/, at);
});
test("the sent check: a price line whose usd is not a number fails, naming its step", () => {
  const { dir, calls, at, path } = fittedRun();
  rewriteJson(path, (p) => ({ ...p, lines: p.lines.map((l) => (l.step === "still-1" ? { ...l, usd: "0.15" } : l)) }));
  sentFails(dir, calls, /^SENT FAIL price: film\/price\.json's lines are not the plan's at its rates: still-1 /, undefined, at);
});
test("the sent check: lines under the plan's price at rates in band fail, and the plan's own price is over the file's ceiling", () => {
  const { dir, calls, at, path } = fittedRun();
  rewriteJson(path, (p) => {
    const lines = p.lines.map((l) => (l.step.startsWith("clip-") ? { ...l, usd: Math.round(l.usd * 100) / 1000 } : l));
    const low = Math.round(lines.reduce((t, l) => t + l.usd, 0) * 1000) / 1000;
    return { ...p, lines, plan_usd: low, max_fal_usd: low };
  });
  sentFails(dir, calls, /^SENT FAIL price: film\/price\.json's lines are not the plan's at its rates: clip-1 /, /\(and [1-9]\d* more\)/, at);
});
test("the sent check: rates under list fail, naming the rate, even with lines and a ceiling worked out from them", () => {
  const { dir, calls, at, path } = fittedRun();
  rewriteJson(path, (p) => {
    const lines = p.lines.map((l) => (l.step.startsWith("clip-") ? { ...l, rate_usd: 0.03, usd: Math.round(l.units * 0.03 * 1000) / 1000 } : l));
    const total = Math.round(lines.reduce((t, l) => t + l.units * l.rate_usd, 0) * 1000) / 1000;
    return { ...p, rates: { ...p.rates, clip: 0.03 }, lines, plan_usd: total, max_fal_usd: total };
  });
  sentFails(dir, calls, /^SENT FAIL price: film\/price\.json's rates: --rates clip=0\.03: fal-ai\/kling-video\/v3\/pro\/image-to-video's rate is outside 0\.112 to 0\.448 USD/, undefined, at);
});
test("the sent check: a call sent under the run's stem that the plan has no line for fails, naming the call", () => {
  const { dir, calls, at } = fittedRun();
  sentFails(dir, [...calls, ISOLATE_CALL("mu-abcd1234-isolate-2")], /^SENT FAIL price: the call sent as mu-abcd1234-isolate-2 has no line in the plan's price/, undefined, at);
});

// ---------- review of #48: the ceiling is the case's, cost bills what the plan prices, unsent steps, one remake at once ----------
// The run's first price records whatever --max the model gave it, none included, so the sent check reads the user's
// ceiling from the case's own prompt.md in this repo (never the run's copy): film/price.json's max_fal_usd, and
// film/ceiling.json's when it is there, must be that input's (null only when it sets none), and the plan and the calls
// sent are held to it.
test("the sent check holds the run to the case's own max_fal_usd from its prompt.md, never the run's record of it", () => {
  // The case sets 6 and the run's first price left --max out: priced with no ceiling, $6.153 built and sent.
  const six = sentRun();
  const r6 = checkAt(checkWithCeiling(6), reportOf(six.dir, six.calls), six.dir);
  assert.equal(r6.status, 1, r6.stdout);
  assert.match(r6.stdout, /^SENT FAIL price: film\/price\.json's plan_usd 6\.153 is over the case's max_fal_usd 6 \(its prompt\.md input\) \(and \d+ more\)\n$/);
  // The case sets 7, which the plan fits, and the price was still judged against no ceiling.
  const seven = sentRun();
  const at7 = checkWithCeiling(7);
  const r7 = checkAt(at7, reportOf(seven.dir, seven.calls), seven.dir);
  assert.equal(r7.status, 1, r7.stdout);
  assert.match(r7.stdout, /^SENT FAIL price: film\/price\.json's max_fal_usd is null, not the case's input max_fal_usd 7 \(its prompt\.md\)/);
  // Priced at 7, as the run should: it passes. film/ceiling.json then says another ceiling: it fails, naming the file.
  assert.match(kit(seven.dir, "price", "--film", "film", "--rates", RATES, "--max", "7").stdout, /: FITS\n/);
  assert.equal(checkAt(at7, reportOf(seven.dir, seven.calls), seven.dir).stdout, "SENT PASS n=16\n");
  writeFileSync(join(seven.dir, "film", "ceiling.json"), JSON.stringify({ max_fal_usd: null }) + "\n");
  const ceiled = checkAt(at7, reportOf(seven.dir, seven.calls), seven.dir);
  assert.equal(ceiled.status, 1, ceiled.stdout);
  assert.equal(ceiled.stdout, "SENT FAIL price: film/ceiling.json records max_fal_usd null, not the case's input max_fal_usd 7 (its prompt.md)\n");
  // short-song sets none: a price at a ceiling the user never set is not the input's.
  const none = sentRun();
  assert.match(kit(none.dir, "price", "--film", "film", "--rates", RATES, "--max", "100").stdout, /: FITS\n/);
  const r0 = check(reportOf(none.dir, none.calls), none.dir);
  assert.equal(r0.status, 1, r0.stdout);
  assert.match(r0.stdout, /^SENT FAIL price: film\/price\.json's max_fal_usd is 100, not the case's input max_fal_usd null \(its prompt\.md\)/);
  // A prompt.md whose max_fal_usd is not a number: no verdict.
  const r = spawnSync(process.execPath, [checkWithCeiling("six"), reportOf(none.dir, none.calls), none.dir], { encoding: "utf8" });
  assert.equal(r.status, 2, r.stdout);
  assert.match(r.stdout, /^SENT VOID .*prompt\.md.*max_fal_usd/);
});

// cost bills from the plan priced again at film/price.json's rates, after the checks stills, remake and clips make
// (the plan's hash, the rates in band, the recorded ceiling, the plan fitting it): never from the file's own lines.
test("cost bills the plan's price at the price's rates after the same checks the builders make, never the file's lines", () => {
  const steps = stepsOf(full.shots);
  const costOf = (dir) => kit(dir, "cost", "--film", "film", "--stem", "abcd1234", "--sent", steps.join(","));
  const pricePath = (dir) => join(dir, "film", "price.json");
  const costPath = (dir) => join(dir, "film", "cost.json");
  const real = readFileSync(costPath(full.dir), "utf8");
  // The clip lines at $0 by hand, the hash, rates, max and fits untouched: billed at the plan's price all the same.
  const zero = copyOf("cost-zero-lines");
  rewriteJson(pricePath(zero), (p) => ({ ...p, lines: p.lines.map((l) => (l.step.startsWith("clip-") ? { ...l, usd: 0 } : l)) }));
  const z = costOf(zero);
  assert.equal(z.status, 0, z.stderr);
  assert.deepEqual(JSON.parse(readFileSync(costPath(zero), "utf8")), JSON.parse(real));
  const refused = [
    ["no lines", (d) => rewriteJson(pricePath(d), ({ lines, ...p }) => p), /film\/price\.json/],
    ["not JSON", (d) => writeFileSync(pricePath(d), "{"), /film\/price\.json/],
    ["a plan edited after its price", (d) => writeFileSync(join(d, "film", "plan.json"), readFileSync(join(d, "film", "plan.json"), "utf8") + " "), /the plan changed since it was priced/],
    ["rates under list", (d) => rewriteJson(pricePath(d), (p) => ({ ...p, rates: { ...p.rates, clip: 0.03 } })), /--rates clip=0\.03/],
    ["a ceiling the run never recorded", (d) => rewriteJson(pricePath(d), (p) => ({ ...p, max_fal_usd: 1000 })), /film\/ceiling\.json/],
    ["fits false", (d) => rewriteJson(pricePath(d), (p) => ({ ...p, fits: false })), /over the ceiling you set/],
  ];
  for (const [what, change, why] of refused) {
    const dir = copyOf("cost-judged");
    change(dir);
    const before = readFileSync(costPath(dir), "utf8");
    const r = costOf(dir);
    assert.equal(r.status, 2, `${what}: ${r.status} ${r.stdout}${r.stderr}`);
    assert.equal(r.stdout, "", what);
    assert.match(r.stderr, why, what);
    assert.doesNotMatch(r.stderr, /TypeError|at file:/, `${what}: an error in words, never a stack`);
    assert.equal(readFileSync(costPath(dir), "utf8"), before, `${what}: film/cost.json is left as it was`);
  }
});

// A run that stops after a builder wrote its record, before every call was sent, says which recorded steps were never
// sent: --unsent bills them nothing and keeps them out of --sent. The answer never calls them paid, and the sent check
// ties film/cost.json's steps to the calls sent.
test("cost --unsent names a recorded still or clip the run never sent: billed nothing, never also --sent, only recorded ones", () => {
  const steps = stepsOf(full.shots);
  const last = `clip-${full.shots.at(-1).n}`;
  const billed = JSON.parse(readFileSync(join(full.dir, "film", "cost.json"), "utf8"));
  const dir = copyOf("cost-unsent");
  const costPath = join(dir, "film", "cost.json");
  const r = kit(dir, "cost", "--film", "film", "--stem", "abcd1234", "--sent", steps.filter((s) => s !== last).join(","), "--unsent", last);
  assert.equal(r.status, 0, r.stderr);
  const c = JSON.parse(readFileSync(costPath, "utf8"));
  assert.equal(c.steps.some((s) => s.step === last), false);
  assert.deepEqual(c.unsent, [last]);
  assert.equal(c.total, Math.round((billed.total - billed.steps.find((s) => s.step === last).usd) * 1000) / 1000);
  // The answer field it prints is the schema's: steps and total.
  const printed = JSON.parse(r.stdout.slice(r.stdout.indexOf("{")));
  assert.deepEqual(Object.keys(printed.fal_cost_usd).sort(), ["steps", "total"]);
  const written = readFileSync(costPath, "utf8");
  const cases = [
    ["in both --sent and --unsent", ["--sent", steps.join(","), "--unsent", last], new RegExp(`mu-abcd1234-${last}`)],
    ["a still the records don't hold", ["--sent", steps.join(","), "--unsent", "still-99"], /mu-abcd1234-still-99/],
    ["the isolation, which no record holds", ["--sent", steps.filter((s) => s !== "isolate").join(","), "--unsent", "isolate"], /mu-abcd1234-isolate/],
    ["named twice", ["--sent", steps.filter((s) => s !== last).join(","), "--unsent", `${last},${last}`], new RegExp(`mu-abcd1234-${last}`)],
  ];
  for (const [what, flags, key] of cases) {
    const no = kit(dir, "cost", "--film", "film", "--stem", "abcd1234", ...flags);
    assert.equal(no.status, 2, `${what}: ${no.stdout}`);
    assert.equal(no.stdout, "", what);
    assert.match(no.stderr, key, what);
    assert.equal(readFileSync(costPath, "utf8"), written, `${what}: film/cost.json is left as it was`);
  }
});

test("answer: a step film/cost.json lists as never sent is billed nothing and never called paid", () => {
  const dir = copyOf("answer-unsent");
  factsAt(dir, DONE);
  const last = `clip-${full.shots.at(-1).n}`;
  const path = join(dir, "film", "cost.json");
  const c = JSON.parse(readFileSync(path, "utf8"));
  const gone = c.steps.find((s) => s.step === last);
  const unsentCost = { steps: c.steps.filter((s) => s !== gone), total: Math.round((c.total - gone.usd) * 1000) / 1000, unsent: [last] };
  writeFileSync(path, JSON.stringify(unsentCost));
  const a = replyOf(answerOf(dir));
  assert.deepEqual(a.fal_cost_usd, { steps: unsentCost.steps, total: unsentCost.total });
  assert.doesNotMatch(a.report_markdown, new RegExp(`^\\| ${last} \\|`, "m"), "no cost row for it");
  assert.match(a.report_markdown, new RegExp(`never sent[^\\n]*mu-abcd1234-${last}`));
  const variants = [
    ["listed as never sent and billed", { ...c, unsent: [last] }],
    ["a step the records don't hold", { ...unsentCost, unsent: [last, "still-99"] }],
  ];
  for (const [what, cost] of variants) {
    writeFileSync(path, JSON.stringify(cost));
    assert.match(refusedBy(answerOf(dir), what), /film\/cost\.json/, what);
  }
});

test("the sent check reads film/cost.json: every step it bills was sent under its key, and every call sent under the run's stem is billed there", () => {
  const costPath = (d) => join(d, "film", "cost.json");
  const cases = [
    ["no cost", (d) => rmSync(costPath(d)), /^SENT FAIL cost: the run left no film\/cost\.json/],
    ["a call sent that cost leaves out", (d) => rewriteJson(costPath(d), (c) => ({ ...c, steps: c.steps.filter((s) => s.step !== "clip-2") })), /^SENT FAIL cost: the call sent as mu-abcd1234-clip-2 is not in film\/cost\.json's steps\n$/],
    ["a step billed that was never sent", (d) => rewriteJson(costPath(d), (c) => ({ ...c, steps: [...c.steps, { ...c.steps[0], step: "isolate", key: "mu-abcd1234-isolate" }] })), /^SENT FAIL cost: film\/cost\.json bills mu-abcd1234-isolate as sent, and no call was sent under that key\n$/],
  ];
  for (const [what, change, line] of cases) {
    const { dir, calls } = sentRun();
    change(dir);
    const r = check(reportOf(dir, calls), dir);
    assert.equal(r.status, 1, `${what}: ${r.stdout}`);
    assert.match(r.stdout, line, what);
  }
});

// A step film/cost.json lists as never sent was not sent: an entry it also bills, or one a call was sent under, is a
// record that contradicts itself, and each entry is a step's name. One no call was sent under, and not billed, holds.
test("the sent check fails a film/cost.json that lists a step as never sent and bills it, or a call was sent under it; each entry a string", () => {
  const costPath = (d) => join(d, "film", "cost.json");
  const cases = [
    ["billed and listed as never sent, a call sent under it", (c) => ({ ...c, unsent: ["clip-2"] }), /^SENT FAIL cost: film\/cost\.json both bills clip-2 and lists it as never sent( \(and \d+ more\))?\n$/],
    ["not billed and listed as never sent, a call sent under it", (c) => ({ ...c, steps: c.steps.filter((s) => s.step !== "clip-2"), unsent: ["clip-2"] }), /^SENT FAIL cost: the call sent as mu-abcd1234-clip-2 is listed as never sent in film\/cost\.json( \(and \d+ more\))?\n$/],
    ["an entry that is not a step's name", (c) => ({ ...c, unsent: [7] }), /^SENT FAIL cost: film\/cost\.json is not what the kit's cost writes\n$/],
  ];
  for (const [what, change, line] of cases) {
    const { dir, calls } = sentRun();
    rewriteJson(costPath(dir), change);
    const r = check(reportOf(dir, calls), dir);
    assert.equal(r.status, 1, `${what}: ${r.stdout}`);
    assert.match(r.stdout, line, what);
  }
  // Listed as never sent, with no call sent under it and not billed: it holds. (A step the records hold that no call
  // was sent under fails before the cost is read, as "is in media/... and was never sent", so this one is a remake the
  // run never made.)
  const { dir, calls } = sentRun();
  rewriteJson(costPath(dir), (c) => ({ ...c, unsent: ["still-2-2"] }));
  const r = check(reportOf(dir, calls), dir);
  assert.equal(r.stdout, "SENT PASS n=16\n");
  assert.equal(r.status, 0);
});

// Two remakes at once both read the record before either wrote it: both pass the limit and the second write drops the
// first one's entry. remake takes media/stills.json.lock (an exclusive create) for its read and write, and removes it
// when done; a lock that is there refuses, naming it, with nothing sent or written.
test("remake takes an exclusive lock on media/stills.json: a lock held refuses with nothing printed or written, and remake always removes its own", () => {
  const dir = stillsDir({ shots: [4, 4, 4, 4] });
  assert.equal(stillsOf(dir).status, 0);
  const file = join(dir, "media", "stills.json");
  const lock = `${file}.lock`;
  const before = readFileSync(file, "utf8");
  const remakeOf = (n) => kit(dir, "remake", "--film", "film", "--file", "media/stills.json", "--shot", String(n), "--picture", "a teal quay at dusk");
  writeFileSync(lock, "");
  const held = remakeOf(1);
  assert.equal(held.status, 2, held.stdout);
  assert.equal(held.stdout, "", "nothing to send");
  assert.match(held.stderr, /media\/stills\.json\.lock/);
  assert.equal(readFileSync(file, "utf8"), before, "the record is left as it was");
  assert.ok(existsSync(lock), "another run's lock is never removed");
  rmSync(lock);
  assert.equal(remakeOf(1).status, 0);
  assert.equal(existsSync(lock), false, "a remake done removes its lock");
  const again = remakeOf(1);
  assert.equal(again.status, 2, "never a second remake of a shot");
  assert.equal(existsSync(lock), false, "a remake refused removes its lock");
});

// A run makes its stem before the first paid call, so a run over its ceiling can hold media/run-keys.json; answer then
// needs film/cost.json. cost on a price over the recorded ceiling, with nothing sent, writes no steps and $0: every
// other check of the price still holds, and a step in --sent is still refused (nothing is billed).
test("cost over the recorded ceiling with nothing sent writes no steps and $0, so an over_budget run with a stem answers", () => {
  const dir = songDir();
  cpSync(KIT, join(dir, "film"), { recursive: true });
  assert.equal(kit(dir, "plan", "--song", "media/song.wav", "--film", "film", "--cut", "30").status, 0);
  assert.match(kit(dir, "price", "--film", "film", "--rates", RATES, "--max", "1").stdout, /OVER YOUR CEILING/);
  const costPath = join(dir, "film", "cost.json");
  for (const [what, sent] of [["the isolation", "isolate"], ["the transcript", "transcript"]]) {
    const no = kit(dir, "cost", "--film", "film", "--stem", "abcd1234", "--sent", sent);
    assert.equal(no.status, 2, `${what} sent over the ceiling: ${no.stdout}`);
    assert.equal(no.stdout, "", what);
    assert.match(no.stderr, /over the ceiling you set/, what);
    assert.equal(existsSync(costPath), false, `${what}: no film/cost.json`);
  }
  const r = kit(dir, "cost", "--film", "film", "--stem", "abcd1234");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(readFileSync(costPath, "utf8")), { steps: [], total: 0 });
  factsAt(dir, { ...DONE, status: "over_budget", error: "The plan's price is over the $1 ceiling you set: nothing was made.", renders: 0, max_fal_usd: 1 });
  const a = replyOf(answerOf(dir));
  assert.equal(a.status, "over_budget");
  assert.equal(a.key_stem, "abcd1234");
  assert.deepEqual(a.fal_cost_usd, { steps: [], total: 0 });
  assert.match(a.report_markdown, /nothing was made and nothing was paid/);
  // Over the ceiling, the price is still checked: a plan changed since it was priced refuses, with nothing written.
  rmSync(costPath);
  writeFileSync(join(dir, "film", "plan.json"), readFileSync(join(dir, "film", "plan.json"), "utf8") + " ");
  const changed = kit(dir, "cost", "--film", "film", "--stem", "abcd1234");
  assert.equal(changed.status, 2, changed.stdout);
  assert.match(changed.stderr, /the plan changed since it was priced/);
  assert.equal(existsSync(costPath), false);
});

// ---------- the grouped read's handles: the repo check holds them, from the case's own fake ----------
// A grader's prompt is cut to its cap, and the fake's calls lose their middles first: a submit_job's answer (its
// request_id, status_url and response_url) is the part a cut takes. The repo check reads the fake's answers whole from
// the case's fixtures/fal-mcp.json in this repo. The first wait_for_jobs that reads a still lists every still's own
// three handles exactly as its submit_job answered them, and any read of a job lists that job's own handles.
const SHORT_FAKE = JSON.parse(readFileSync(new URL("../templates/music-video/evals/short-song/fixtures/fal-mcp.json", import.meta.url), "utf8"));
// short-song's fake answer to a submit_job, as the fake picks it: the answer whose when matches the endpoint and key.
function answered(endpoint_id, key) {
  const a = SHORT_FAKE.tools.submit_job.answers.find((x) => x.when.endpoint_id === endpoint_id && new RegExp(`^(?:${x.when.submission_key.$pattern})$`).test(key));
  const { request_id, status_url, response_url } = JSON.parse(a.result.content[0].text);
  return { endpoint_id, request_id, status_url, response_url };
}
// The run's calls with its grouped read of the stills right after the last still is sent: every still, in shot order.
function withStillRead(calls) {
  const stills = calls.filter((c) => c.tool === "mcp:fal/submit_job" && c.arguments.endpoint_id === NANO);
  const at = calls.indexOf(stills.at(-1)) + 1;
  const read = { tool: "mcp:fal/wait_for_jobs", arguments: { jobs: stills.map((c, index) => ({ index, ...answered(NANO, c.arguments.submission_key) })) } };
  return [...calls.slice(0, at), read, ...calls.slice(at)];
}
const firstStillRead = (calls) => calls.find((c) => c.tool === "mcp:fal/wait_for_jobs" && c.arguments.jobs.some((j) => j.endpoint_id === NANO));
const changeJob = (calls, key, change) => {
  const read = structuredClone(firstStillRead(calls));
  const { request_id } = answered(NANO, key);
  read.arguments.jobs = change(read.arguments.jobs, read.arguments.jobs.findIndex((j) => j.request_id === request_id));
  return calls.map((c) => (c === firstStillRead(calls) ? read : c));
};
test("the sent check holds the first wait_for_jobs that reads a still to every still's own handles as its submit_job answered them", () => {
  const { dir, calls } = sentRun();
  const read = withStillRead(calls);
  assert.equal(check(reportOf(dir, read), dir).stdout, "SENT PASS n=16\n", "every still's own handles: it holds");
  const three = answered(NANO, "mu-abcd1234-still-3");
  const cases = [
    ["shot 3's response_url changed", changeJob(read, "mu-abcd1234-still-3", (jobs, i) => jobs.with(i, { ...jobs[i], response_url: `${three.response_url}x` })),
      `SENT FAIL read: the first wait_for_jobs that reads a still gives shot 3's response_url as ${JSON.stringify(`${three.response_url}x`)}, not ${JSON.stringify(three.response_url)} as its submit_job answered\n`],
    ["shot 3's status_url changed", changeJob(read, "mu-abcd1234-still-3", (jobs, i) => jobs.with(i, { ...jobs[i], status_url: `${three.status_url}x` })),
      `SENT FAIL read: the first wait_for_jobs that reads a still gives shot 3's status_url as ${JSON.stringify(`${three.status_url}x`)}, not ${JSON.stringify(three.status_url)} as its submit_job answered\n`],
    ["shot 3's request_id changed", changeJob(read, "mu-abcd1234-still-3", (jobs, i) => jobs.with(i, { ...jobs[i], request_id: "00000000-0000-0000-0000-000000000000" })),
      `SENT FAIL read: the first wait_for_jobs that reads a still gives shot 3's request_id as "00000000-0000-0000-0000-000000000000", not ${JSON.stringify(three.request_id)} as its submit_job answered\n`],
    ["shot 5's still left out", changeJob(read, "mu-abcd1234-still-5", (jobs, i) => jobs.toSpliced(i, 1)),
      `SENT FAIL read: the first wait_for_jobs that reads a still leaves out shot 5's still (request ${answered(NANO, "mu-abcd1234-still-5").request_id})\n`],
  ];
  for (const [what, sentCalls, line] of cases) {
    const r = check(reportOf(dir, sentCalls), dir);
    assert.equal(r.status, 1, `${what}: ${r.stdout}`);
    assert.equal(r.stdout, line, what);
  }
  // A later read of one job (a clip still pending, read alone) lists its own handles too.
  const clip2 = answered(KLING, "mu-abcd1234-clip-2");
  const alone = (job) => [...read, { tool: "mcp:fal/wait_for_jobs", arguments: { jobs: [{ index: 0, ...job }] } }];
  assert.equal(check(reportOf(dir, alone(clip2)), dir).stdout, "SENT PASS n=16\n", "a clip read alone with its own handles: it holds");
  const r = check(reportOf(dir, alone({ ...clip2, status_url: `${clip2.status_url}x` })), dir);
  assert.equal(r.status, 1, r.stdout);
  assert.equal(r.stdout, `SENT FAIL read: a wait_for_jobs reads mu-abcd1234-clip-2 (request ${clip2.request_id}) with its status_url ${JSON.stringify(`${clip2.status_url}x`)}, not ${JSON.stringify(clip2.status_url)} as its submit_job answered\n`);
});

// ---------- the storyboard against the plan: the repo check holds it ----------
// A grader's prompt is cut to its cap, and on a sixty-second film's run the files are cut too: the storyboard's middle
// and the plan's shots. The repo check reads the run's storyboard.md and film/plan.json whole, with the kit's own
// storyboard parser: the style line first, then one line per shot of the case in order, each line's times and seconds
// the plan's (film times: its start_s and end_s less cut.start_s); and where film/lyrics.json has no words under a
// shot, its lyric is empty, none or (no words): no lyric made up.
const boardPath = (dir) => join(dir, "storyboard.md");
function editBoard(dir, change) {
  const lines = readFileSync(boardPath(dir), "utf8").split("\n");
  writeFileSync(boardPath(dir), change(lines).join("\n"));
}
const shotLineAt = (lines, n) => lines.findIndex((l) => l.startsWith(`${n} |`));
// Each edit on its own copy of one built run: its records and calls stay the kit's, so only the storyboard differs.
function boardCase(edit) {
  const { dir, calls } = sentRun();
  edit(dir);
  return check(reportOf(dir, calls), dir);
}
test("the sent check holds storyboard.md to the case's shots in order, each line's times and seconds the plan's", () => {
  // short-song's 8 shots of 4 s (2 bars of 2 s), from 8.254 s of the song: shot n is film time 4(n-1) to 4n.
  assert.equal(boardCase(() => {}).stdout, "SENT PASS n=16\n", "the storyboard as written: it holds");
  const exact = [
    ["shot 8 a bar late", (lines) => lines.with(shotLineAt(lines, 8), lines[shotLineAt(lines, 8)].replace("8 | 28-32 s", "8 | 30-32 s")),
      "SENT FAIL storyboard: shot 8's start is 30 s, not the plan's 28 s (film/plan.json: its start_s 36.254 less cut.start_s 8.254)\n"],
    ["shot 8 ends a bar early", (lines) => lines.with(shotLineAt(lines, 8), lines[shotLineAt(lines, 8)].replace("8 | 28-32 s | 4 s", "8 | 28-30 s | 4 s")),
      "SENT FAIL storyboard: shot 8's end is 30 s, not the plan's 32 s (film/plan.json: its end_s 40.254 less cut.start_s 8.254)\n"],
    ["shot 8's seconds a bar short", (lines) => lines.with(shotLineAt(lines, 8), lines[shotLineAt(lines, 8)].replace("8 | 28-32 s | 4 s", "8 | 28-32 s | 2 s")),
      "SENT FAIL storyboard: shot 8's seconds is 2 s, not the plan's 4 s (film/plan.json: its seconds)\n"],
    ["shots 3 and 4's times swapped, their numbers in place", (lines) => lines.with(shotLineAt(lines, 3), lines[shotLineAt(lines, 3)].replace("3 | 8-12 s", "3 | 12-16 s")).with(shotLineAt(lines, 4), lines[shotLineAt(lines, 4)].replace("4 | 12-16 s", "4 | 8-12 s")),
      "SENT FAIL storyboard: shot 3's start is 12 s, not the plan's 8 s (film/plan.json: its start_s 16.254 less cut.start_s 8.254) (and 3 more)\n"],
    ["the style line after shot 1", (lines) => [lines[1], lines[0], ...lines.slice(2)],
      "SENT FAIL storyboard: storyboard.md's first line is not its style line (`Style: <one look for every shot>`)\n"],
  ];
  for (const [what, change, line] of exact) {
    const r = boardCase((dir) => editBoard(dir, change));
    assert.equal(r.status, 1, `${what}: ${r.stdout}`);
    assert.equal(r.stdout, line, what);
  }
  // A line too many, a line missing, two lines swapped whole and no storyboard: the kit can't rebuild the stills from
  // that storyboard either, so more reasons follow; the storyboard's comes first, naming the shot.
  const first = [
    ["a 13th line", (lines) => lines.toSpliced(shotLineAt(lines, 8) + 1, 0, '13 | 32-36 s | 4 s | lyric: "none" | picture: a paper ferry 13 on teal water, wide | motion: slow push in 13'),
      /^SENT FAIL storyboard: storyboard\.md has a line for shot 13; the case has 8 shots \(and \d+ more\)\n$/],
    ["shot 5's line missing", (lines) => lines.toSpliced(shotLineAt(lines, 5), 1), /^SENT FAIL storyboard: storyboard\.md has no line for shot 5 \(and \d+ more\)\n$/],
    ["shots 3 and 4 swapped whole", (lines) => lines.with(shotLineAt(lines, 3), lines[shotLineAt(lines, 4)]).with(shotLineAt(lines, 4), lines[shotLineAt(lines, 3)]),
      /^SENT FAIL storyboard: storyboard\.md's line for shot 4 comes before shot 3's \(and \d+ more\)\n$/],
    ["shot 6 twice", (lines) => lines.toSpliced(shotLineAt(lines, 6) + 1, 0, lines[shotLineAt(lines, 6)]), /^SENT FAIL storyboard: storyboard\.md has 2 lines for shot 6 \(and \d+ more\)\n$/],
  ];
  for (const [what, change, line] of first) {
    const r = boardCase((dir) => editBoard(dir, change));
    assert.equal(r.status, 1, `${what}: ${r.stdout}`);
    assert.match(r.stdout, line, what);
  }
  const none = boardCase((dir) => rmSync(boardPath(dir)));
  assert.equal(none.status, 1, none.stdout);
  assert.match(none.stdout, /^SENT FAIL storyboard: the run left no storyboard\.md \(and \d+ more\)\n$/);
});
test("the sent check: where film/lyrics.json has no words under a shot, its storyboard lyric is empty, none or (no words)", () => {
  // As the kit writes it when speech-to-text found no words: every shot's lyric empty.
  const noWords = (dir) => writeFileSync(join(dir, "film", "lyrics.json"), JSON.stringify({ words_in_song: 0, words_in_cut: 0, lines: [], under_shots: Array.from({ length: SHORT }, (_, i) => ({ n: i + 1, lyric: "" })) }));
  assert.equal(boardCase(noWords).stdout, "SENT PASS n=16\n", "every lyric none: it holds");
  const forms = boardCase((dir) => {
    noWords(dir);
    editBoard(dir, (lines) => lines.map((l) => l.replace('2 | 4-8 s | 4 s | lyric: "none"', '2 | 4-8 s | 4 s | lyric: ""').replace('3 | 8-12 s | 4 s | lyric: "none"', '3 | 8-12 s | 4 s | lyric: "(no words)"')));
  });
  assert.equal(forms.stdout, "SENT PASS n=16\n", "empty and (no words), as the kit prints a shot with no words: it holds");
  const made = boardCase((dir) => {
    noWords(dir);
    editBoard(dir, (lines) => lines.map((l) => l.replace('2 | 4-8 s | 4 s | lyric: "none"', '2 | 4-8 s | 4 s | lyric: "dancing in the rain"')));
  });
  assert.equal(made.status, 1, made.stdout);
  assert.equal(made.stdout, 'SENT FAIL storyboard: shot 2\'s lyric is "dancing in the rain"; film/lyrics.json has no words under shot 2, so its lyric is empty, none or (no words)\n');
});
