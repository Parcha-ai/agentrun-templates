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
