// node review.mjs <out> [snapshot options]: runs `hyperframes snapshot` into <out> (`--review` when no options are
// given), then saves a copy of any sheet larger than 1900 px on a side as <name>-s.jpg, scaled to fit 1900x1900 with
// FFmpeg, because `read` refuses an image over 2000x2000 (the 9:16 beat and phone sheets are taller than that).
// It prints the sheets to `read`, one path per line: the -s copy wherever one was made.
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const MAX = 1900;
const [out, ...options] = process.argv.slice(2);
if (!out || out.startsWith("-")) {
  console.error("usage: node review.mjs <out> [snapshot options, e.g. --at 4.2,11.0]");
  process.exit(2);
}
mkdirSync(out, { recursive: true });
const snap = spawnSync("hyperframes", ["snapshot", ...(options.length ? options : ["--review"]), "-o", out], { encoding: "utf8" });
writeFileSync(join(out, "snapshot.log"), `${snap.stdout ?? ""}${snap.stderr ?? ""}`);
if (snap.status !== 0) {
  console.error(`hyperframes snapshot exited ${snap.status}; the end of ${join(out, "snapshot.log")}:`);
  console.error(`${snap.stdout ?? ""}${snap.stderr ?? ""}`.trim().split("\n").slice(-8).join("\n"));
  process.exit(1);
}

const sheets = readdirSync(out).filter((f) => f.endsWith(".jpg") && !f.endsWith("-s.jpg")).sort();
for (const f of sheets) {
  const path = join(out, f);
  const probe = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", path], { encoding: "utf8" });
  const [w, h] = probe.stdout.trim().split(",").map(Number);
  if (!(w > 0 && h > 0)) {
    console.error(`ffprobe could not size ${path}`);
    process.exit(1);
  }
  if (Math.max(w, h) <= MAX) {
    console.log(path);
    continue;
  }
  const small = path.replace(/\.jpg$/, "-s.jpg");
  const scale = spawnSync("ffmpeg", ["-y", "-v", "error", "-i", path, "-vf", `scale=${MAX}:${MAX}:force_original_aspect_ratio=decrease`, "-q:v", "3", small], { encoding: "utf8" });
  if (scale.status !== 0) {
    console.error(`ffmpeg could not scale ${path}: ${(scale.stderr ?? "").trim()}`);
    process.exit(1);
  }
  console.log(small);
}
