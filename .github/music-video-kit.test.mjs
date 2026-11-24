// The music video kit's place step joins the clips into one video (assets/shots.mp4) so HyperFrames extracts one file:
// it runs every video's extraction at once, and six clips together ran a 4 GiB sandbox out of memory. These tests hold
// what that fix depends on: the join runs one FFmpeg at a time, its peak memory doesn't grow with the number of shots
// (a 12-shot 60 s film against a 6-shot 30 s one), and the joined video tiles the cut frame for frame.
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

// A film of n 5 s shots: shot 2 has no clip (its still with the push-in), shot 3's clip is short (slowed).
function film(n) {
  const dir = join(root, `film-${n}`);
  mkdirSync(join(dir, "assets"), { recursive: true });
  cpSync(join(KIT, "beats.mjs"), join(dir, "beats.mjs"));
  cpSync(join(KIT, "index.html"), join(dir, "index.html"));
  const shots = Array.from({ length: n }, (_, i) => ({ n: i + 1, start_s: 1 + i * 5, seconds: 5 }));
  const plan = { song: { path: join(media, "song.mp3"), seconds: 61 }, cut: { seconds: n * 5, start_s: 1, end_s: 1 + n * 5, shots }, aspect: "16:9", width: 1920, height: 1080, lyrics_on: false };
  writeFileSync(join(dir, "plan.json"), JSON.stringify(plan));
  for (const s of shots) {
    cpSync(join(media, "still.png"), join(dir, "assets", `still-${s.n}.png`));
    if (s.n !== 2) cpSync(join(media, s.n === 3 ? "short.mp4" : "clip.mp4"), join(dir, "assets", `clip-${s.n}.mp4`));
  }
  const log = join(root, `spawns-${n}.jsonl`);
  const r = spawnSync(process.execPath, [join(dir, "beats.mjs"), "place", "--film", dir], {
    encoding: "utf8",
    env: { ...process.env, PATH: `${shimDir}:${process.env.PATH}`, MU_SPAWN_LOG: log, MU_REAL_FFMPEG: REAL_FFMPEG },
  });
  assert.equal(r.status, 0, `place exited ${r.status}: ${r.stderr}`);
  const spawns = readFileSync(log, "utf8").trim().split("\n").map((l) => JSON.parse(l));
  return { dir, out: JSON.parse(r.stdout.trim().split("\n").pop()), spawns, html: readFileSync(join(dir, "index.html"), "utf8") };
}

const probe = (path) => JSON.parse(spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=nb_frames,width,height,r_frame_rate", "-of", "json", path], { encoding: "utf8" }).stdout).streams[0];
const six = film(6);
const twelve = film(12);

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
