// The music video kit's place step joins the clips into one video (assets/shots.mp4) so HyperFrames extracts one file:
// it runs every video's extraction at once, and six clips together ran a 4 GiB sandbox out of memory. These tests hold
// what that fix depends on: the join runs one FFmpeg at a time, its peak memory doesn't grow with the number of shots
// (a 12-shot 60 s film against a 6-shot 30 s one), the joined video tiles the cut frame for frame, and a still's part
// shows the still from its first frame.
// They need ffmpeg, ffprobe and python3 on PATH (the evals-parse workflow installs ffmpeg). Media is synthetic: no song, no clip from fal.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const KIT = new URL("../templates/music-video/skills/music-video/kit/", import.meta.url).pathname;
const which = (bin) => spawnSync("sh", ["-c", `command -v ${bin}`], { encoding: "utf8" }).stdout.trim();
const REAL_FFMPEG = which("ffmpeg");
const root = mkdtempSync(join(tmpdir(), "mu-kit-"));

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
  writeFileSync(join(dir, "film", "plan.json"), JSON.stringify({ song: { path: "media/song.wav", seconds: 80 }, cut: { seconds: total, start_s: 8.254, end_s: 8.254 + total, shots: planShots }, aspect: "16:9", width: 1920, height: 1080, lyrics_on: true }));
  let clock = 0;
  const shotLines = lines ?? planShots.map((s) => {
    const line = `${s.n} | ${clock}-${clock + s.seconds} s | ${s.seconds} s | lyric: "none" | picture: a paper ferry ${s.n} on teal water | motion: slow push in ${s.n}`;
    clock += s.seconds;
    return line;
  });
  writeFileSync(join(dir, "storyboard.md"), ["Style: cut paper, teal and amber", ...shotLines].join("\n") + "\n");
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
  writeFileSync(join(dir, "film", "plan.json"), JSON.stringify({ song: { path: "media/song.wav", seconds: 80 }, cut: { seconds: total, start_s: 8.254, end_s: 8.254 + total, shots: planShots }, aspect, width: 1920, height: 1080, lyrics_on: true }));
  let clock = 0;
  const shotLines = lines ?? planShots.map((s) => {
    const line = `${s.n} | ${clock}-${clock + s.seconds} s | ${s.seconds} s | lyric: "none" | picture: a paper ferry ${s.n} on teal water, wide | motion: slow push in ${s.n}`;
    clock += s.seconds;
    return line;
  });
  writeFileSync(join(dir, "storyboard.md"), [style, ...shotLines].filter((l) => l !== null).join("\n") + "\n");
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
  const r = kit(dir, "remake", "--file", "media/stills.json", "--shot", "2", "--picture", "a paper ferry on teal water, seen from far behind");
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
    const no = kit(dir, "remake", "--file", "media/stills.json", ...args);
    assert.equal(no.status, 2, `${args}: ${no.stderr}`);
    assert.match(no.stderr, why);
    assert.equal(no.stdout.trim(), "");
  }
  assert.equal(kit(dir, "remake", "--file", "media/stills.json", "--shot", "3", "--picture", "a calm teal harbor").status, 0);
  const third = kit(dir, "remake", "--file", "media/stills.json", "--shot", "4", "--picture", "a quay");
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
function sentRun({ shots = Array(SHORT).fill(4) } = {}) {
  const dir = stillsDir({ shots });
  const s = stillsOf(dir);
  assert.equal(s.status, 0, s.stderr);
  const urls = shots.map((_, i) => `https://v3.fal.media/files/rabbit/still${i + 1}.png`);
  const c = kit(dir, "clips", "--film", "film", "--storyboard", "storyboard.md", "--stem", "abcd1234", "--stills", urls.join(","), "--file", "media/clips.json");
  assert.equal(c.status, 0, c.stderr);
  const calls = [...sent(s.stdout), ...sent(c.stdout)].map((args) => ({ tool: "mcp:fal/submit_job", arguments: args }));
  return { dir, calls: [{ tool: "mcp:fal/get_pricing", arguments: {} }, ...calls, { tool: "mcp:fal/wait_for_jobs", arguments: { jobs: [] } }] };
}
function reportOf(dir, calls, { name = "short-song", runs, data } = {}) {
  const report = join(dir, `report-${++runs_}.json`);
  writeFileSync(report, JSON.stringify({ package: { name: "music-video" }, ...(data ? { server: { kind: "in_process", data } } : {}), cases: [{ name, runs: runs ?? [{ run: 1, agent_id: "01aa-agent", run_id: "01aa-run", mcp_calls: calls }] }] }));
  return report;
}
let runs_ = 0;
const checkRaw = (...args) => spawnSync(process.execPath, [CHECK, ...args], { encoding: "utf8" });
// Every verdict line ends with the label that says it is the repo's check; the tests below match what comes before it.
const check = (...args) => {
  const r = checkRaw(...args);
  if (r.status !== 2) assert.ok(r.stdout.endsWith(`${LABEL}\n`), `no label: ${r.stdout}`);
  return { ...r, stdout: r.stdout.replace(LABEL, "") };
};
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
  const r = kit(dir, "remake", "--file", "media/stills.json", "--shot", "3", "--picture", "a teal quay at dusk");
  assert.equal(r.status, 0, r.stderr);
  const remake = { tool: "mcp:fal/submit_job", arguments: sent(r.stdout)[0] };
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
  assert.match(twelve.stdout, /^SENT FAIL stills: media\/stills\.json holds 8 first takes, the case 12 shots \(and 1 more\)\n$/);
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
  assert.equal(kit(dir, "remake", "--file", "media/stills.json", "--shot", "2", "--picture", "a calm teal quay").status, 0);
  const before = recordOf(dir, "stills.json");
  const again = stillsOf(dir);
  assert.equal(again.status, 0, again.stderr);
  assert.equal(recordOf(dir, "stills.json"), before, "the record is kept as it was");
  assert.equal(sent(again.stdout).length, 4, "the first takes are printed as before");
  assert.equal(kit(dir, "remake", "--file", "media/stills.json", "--shot", "3", "--picture", "a teal harbor wall").status, 0);
  const third = kit(dir, "remake", "--file", "media/stills.json", "--shot", "4", "--picture", "a quay");
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
