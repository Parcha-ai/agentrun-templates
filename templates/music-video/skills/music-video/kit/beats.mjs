#!/usr/bin/env node
// beats.mjs: every number of the music video, worked out by code from the song itself. The agent never judges timing:
// this script decodes the song with FFmpeg, finds its beats, tempo and bar lines, measures each bar's energy, picks
// the cut, splits it into shots on bar lines, prices the plan from fal's rates, maps the lyrics' word times into the
// cut, writes the film's scene list and reads it back. Nothing here guesses a figure it cannot work out: that is an
// error, never an estimate. It uses only node's fs, path, url and child_process, and runs only ffmpeg and ffprobe. A
// check may import it for buildStills, addRemake and buildClips (to rebuild what the kit builds), and answer.mjs for the
// plan's own words; then it runs no command.
//
//   node beats.mjs plan   --song media/song.mp3 --film film [--cut 60] [--start 42.5] [--aspect 16:9] [--lyrics true]
//   node beats.mjs price  --film film --rates isolation=0.1,transcript=0.03,still=0.15,clip=0.14 [--max 20]
//   node beats.mjs lyrics --film film --words media/transcript.json --vtt media/lyrics.vtt
//   node beats.mjs place  --film film
//   node beats.mjs stem   --file media/run-keys.json
//   node beats.mjs stills --film film --storyboard storyboard.md --stem <stem> --file media/stills.json
//   node beats.mjs remake --film film --file media/stills.json --shot <n> --picture "<the fixed picture>"
//   node beats.mjs clips  --film film --storyboard storyboard.md --stem <stem> --stills <url-1>,...,<url-N> --file media/clips.json
//   node beats.mjs cost   --film film --stem <stem> --sent isolate,transcript,still-1,...,clip-12 [--failed clip-5,...] [--pending clip-7,...]
//
// plan    decodes the song (mono, 11025 Hz), builds an onset curve from three frequency bands, finds the tempo by
//         autocorrelation (60 to 200 BPM, weighted toward 120), fits a beat grid to the whole song, snaps it to the
//         onsets, keeps the steady grid when the song holds its tempo, picks the bar's first beat (4/4) by where the low
//         band's onsets are strongest, measures each bar's energy, and picks the cut: the song whole when it is shorter
//         than --cut; else the whole bars nearest --cut from the bar line nearest --start; else the loudest run of those
//         bars that starts on a bar line. Then the shots: whole bars (the first and last shot of a whole song also hold
//         its lead-in and its tail), each 3 to 10 s, as even as the bars allow, the longer ones where the song is
//         quieter, together exactly the cut. It writes film/plan.json, which every later command reads.
// price   the plan priced from get_pricing's rates (isolation and transcript per minute of the song, a still per image,
//         a clip per second), with two stills held in reserve for remakes. --max is the user's own ceiling
//         (max_fal_usd), given only when they set one: a plan over it prints OVER YOUR CEILING. Without --max nothing is
//         over. It writes film/price.json. A rate outside its endpoint's band (fal's list price to four times it,
//         RATE_BANDS) is a misread answer: an error naming the endpoint and the band, and nothing is priced. A rate under
//         list would price a plan below what fal bills, so the band has no room below it. The run's first price records
//         its --max (or none) in film/ceiling.json, which plan never removes: once a ceiling is recorded, a price with
//         --max left out or another --max is refused, and a ceiling given after a first price with none is recorded.
// lyrics  speech-to-text's words (fal's answer, written to a file as fal gave it) mapped into the cut: lines, the lyric
//         under each shot, film/lyrics.json, the WebVTT file and film/compositions/lyrics.html (the captions scene).
// place   writes each shot into film/index.html on the cut's clock (its clip, or its still with a slow push-in when
//         there is no usable clip), the song's segment cut by FFmpeg into film/assets/song.m4a as the only audio, the
//         captions host when lyrics are on and there are words; then reads everything back. The clips are joined first
//         into one video, film/assets/shots.mp4, each cut to its shot's frames, one FFmpeg at a time: HyperFrames
//         extracts every video of a film at once, and six clips' extractions together run a 4 GiB sandbox out of memory.
// stem    prints the run's key stem: the one in the file when it holds one (a resumed run), else a new one from the
//         sandbox's random bytes, written there first. A model never makes one.
// stills, remake and clips build nothing until the plan is priced and fits: film/price.json with the sha256 of
//         film/plan.json as priced and the ceiling film/ceiling.json records, its rates in their bands, and the plan's
//         price worked out again from the plan and those rates at or under that ceiling (never its fits flag). Over the
//         user's ceiling, never priced, or priced for a plan since changed, each exits 2 and prints nothing to send.
//         plan removes film/price.json when it writes a different plan.
// stills  every still's submit_job, built from the storyboard and the plan: shot n's prompt is the style line, its
//         storyboard picture word for word and "No text, no lettering, no logos.", with the fixed fields (one image, the
//         plan's aspect, 1K, png, no web search). It prints one `submit_job {...}` line per still, to send as printed,
//         and writes them to --file: the style and fixed fields once, then one short line per still (its key and
//         picture), so the record reaches a grader whole. A storyboard with no style line, lines that aren't the plan's
//         shots in order, or a shot with no picture is an error, and nothing is printed or written.
//         Run again on a resumed run, it keeps --file as it is (its remakes too) when the inputs are the same and
//         prints the first takes again; when they differ it refuses, naming the shot, and never replaces the record.
// remake  one still's second take: the same input with its picture fixed, key `<its key>-2`, added to --file and
//         printed as one `submit_job {...}` line. Never a second remake of a shot, never more than two in a run.
// clips   every clip's submit_job, built from the storyboard and the plan: shot n's prompt is its storyboard motion
//         and ", the scene as it is", its still the n-th of --stills (fal's URL, as fal answered it), its duration the
//         plan's clip seconds, then the fixed fields (no audio, the one negative prompt). It prints one
//         `submit_job {...}` line per clip, to send as printed, and writes them to --file: the fixed fields once, then
//         one short line per clip, so the record reaches a grader whole where a run's calls are cut to fit. A
//         storyboard that doesn't hold the plan's shots in order, a shot with no motion, or a still list that doesn't
//         match the shots is an error, and nothing is printed or written. Run again on a resumed run, it keeps --file
//         when it is the same and prints the same calls; when anything differs it refuses, naming the shot.
// cost    the answer's fal_cost_usd from the steps sent (a failed or refused one at 0; one still pending when the run
//         stopped waiting at its full price, pending true, since fal may yet finish and bill it), at the rates price
//         used, each with its key mu-<stem>-<step>. Every still and clip the kit recorded (media/stills.json,
//         media/clips.json) is in --sent exactly once: a step named twice, a recorded key left out, or a still or clip
//         the records don't hold is an error naming the key, and nothing is written. It writes film/cost.json, which
//         answer.mjs reads.
//
// Exit 2: wrong arguments, or a film whose files don't match the plan (place reads every shot back after writing it;
// the message names the shot); 3: the song can't be decoded, is too short, or has no beat to cut on; 0: done.
import { spawnSync } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SR = 11025; // decode rate: enough for kick, snare and hats
const HOP = 64; // onset frames every 5.8 ms
const WIN = 512; // each frame's energy over 46 ms, ending at the frame's time
const MIN_BPM = 60;
const MAX_BPM = 200;
const SHOT_MIN = 3; // seconds: Kling's shortest clip
const SHOT_MAX = 10;
const SHOT_TARGET = 5;
const CUT_MIN = 10;
const CUT_MAX = 90;
const SONG_MIN = 6;
const SONG_MAX = 10 * 60;
const RESERVE = 2; // stills priced in reserve for remakes
const SIZES = { "16:9": [1920, 1080], "9:16": [1080, 1920] };
const LINE_GAP = 0.6; // a pause this long starts a new lyric line
const LINE_WORDS = 7;
const FPS = 30; // the film's frame rate: HyperFrames renders at 30 by default
const JOIN_THREADS = "2"; // the sandbox's CPUs; FFmpeg's own choice follows the host's CPU count, and its memory with it

// Run as a command (node beats.mjs <command> ...), or imported by a check that rebuilds what the kit builds
// (buildStills, addRemake, buildClips): then an error is thrown with its words, never a process exit.
const MAIN = (() => {
  try {
    return import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
})();
function fail(code, message) {
  if (!MAIN) throw Object.assign(new Error(message), { exitCode: code });
  console.error(message);
  process.exit(code);
}

// ---------- arguments ----------
const [command, ...rest] = MAIN ? process.argv.slice(2) : [];
const args = {};
for (let i = 0; i < rest.length; i++) {
  const a = rest[i];
  if (!a.startsWith("--")) fail(2, `unexpected argument ${a}: every option is --name value (the header of this file lists them)`);
  const next = rest[i + 1];
  if (next === undefined || next.startsWith("--")) args[a.slice(2)] = "true";
  else {
    args[a.slice(2)] = next;
    i++;
  }
}
const need = (k) => (args[k] === undefined || args[k] === "true" ? fail(2, `--${k} is required`) : args[k]);
const num = (k, fallback) => {
  if (args[k] === undefined) return fallback;
  const v = Number(args[k]);
  if (!Number.isFinite(v)) fail(2, `--${k} is a number: ${args[k]}`);
  return v;
};
const bool = (k, fallback) => (args[k] === undefined ? fallback : args[k] === "true" ? true : args[k] === "false" ? false : fail(2, `--${k} is true or false`));
const ms = (s) => Math.round(s * 1000);
const r3 = (s) => Math.round(s * 1000) / 1000;
const r2 = (s) => Math.round(s * 100) / 100;
const usd = (v) => Math.round(v * 1000 + 1e-9) / 1000;

// ---------- the song ----------
function probeSeconds(path) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], { encoding: "utf8" });
  const v = Number((r.stdout || "").trim());
  return r.status === 0 && Number.isFinite(v) && v > 0 ? v : undefined;
}
// A video's first stream: its frame count (from the container) and size; undefined when ffprobe can't read it.
function videoOf(path) {
  const r = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=nb_frames,width,height", "-of", "json", path], { encoding: "utf8" });
  if (r.status !== 0) return undefined;
  const s = JSON.parse(r.stdout || "{}").streams?.[0];
  const frames = Number(s?.nb_frames);
  return s && Number.isInteger(frames) ? { frames, width: s.width, height: s.height } : undefined;
}
function decode(path) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-nostdin", "-i", path, "-vn", "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  if (r.error || r.status !== 0) fail(3, `ffmpeg could not decode ${path}: ${String(r.stderr || r.error || "").trim().split("\n").slice(-3).join(" ")}`);
  const n = Math.floor(r.stdout.length / 4);
  return new Float32Array(r.stdout.buffer.slice(r.stdout.byteOffset, r.stdout.byteOffset + n * 4));
}
function onePole(x, fc) {
  const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
  const y = new Float32Array(x.length);
  let v = 0;
  for (let i = 0; i < x.length; i++) {
    v += a * (x[i] - v);
    y[i] = v;
  }
  return y;
}
// Each band's energy over WIN samples ending at each frame, as log energy with a floor 40 dB under the band's loudest.
function bandLogs(band, frames) {
  const cs = new Float64Array(band.length + 1);
  for (let i = 0; i < band.length; i++) cs[i + 1] = cs[i] + band[i] * band[i];
  const e = new Float64Array(frames);
  let hi = 0;
  for (let i = 0; i < frames; i++) {
    const end = i * HOP + WIN;
    e[i] = (cs[end] - cs[end - WIN]) / WIN;
    if (e[i] > hi) hi = e[i];
  }
  const floor = Math.max(hi * 1e-4, 1e-12);
  return e.map((v) => Math.log(v + floor));
}
function rise(logs) {
  const o = new Float64Array(logs.length);
  for (let i = 1; i < logs.length; i++) o[i] = Math.max(0, logs[i] - logs[i - 1]);
  return o;
}
// The curve less its moving average over +-0.2 s, below zero clipped: the onsets that stand out from what's around them.
function standOut(o) {
  const half = Math.round((0.2 * SR) / HOP);
  const cs = new Float64Array(o.length + 1);
  for (let i = 0; i < o.length; i++) cs[i + 1] = cs[i] + o[i];
  return o.map((v, i) => {
    const a = Math.max(0, i - half), b = Math.min(o.length, i + half + 1);
    return Math.max(0, v - (cs[b] - cs[a]) / (b - a));
  });
}
const frameOf = (t) => (t * SR - WIN) / HOP; // a frame's time is its window's end
const timeOf = (f) => (f * HOP + WIN) / SR;
function at(curve, t) {
  const f = frameOf(t);
  const i = Math.floor(f);
  if (i < 0 || i + 1 >= curve.length) return 0;
  return curve[i] + (curve[i + 1] - curve[i]) * (f - i);
}
function peakNear(curve, t, half) {
  let best = -1, when = t;
  const a = Math.max(0, Math.ceil(frameOf(t - half))), b = Math.min(curve.length - 1, Math.floor(frameOf(t + half)));
  for (let i = a; i <= b; i++) if (curve[i] > best) { best = curve[i]; when = timeOf(i); }
  return { value: Math.max(0, best), t: when };
}
function median(values) {
  const s = [...values].sort((x, y) => x - y);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
}

function analyse(path) {
  const x = decode(path);
  const analysed = x.length / SR;
  if (analysed < SONG_MIN) fail(3, `the song decodes to ${r2(analysed)} s: at least ${SONG_MIN} s is needed for a cut`);
  if (analysed > SONG_MAX) fail(3, `the song decodes to ${r2(analysed)} s: at most ${SONG_MAX / 60} minutes`);
  const lo = onePole(x, 150);
  const lp2k = onePole(x, 2000);
  const mid = lp2k.map((v, i) => v - lo[i]);
  const hi = x.map((v, i) => v - lp2k[i]);
  const frames = Math.max(0, Math.floor((x.length - WIN) / HOP) + 1);
  if (frames < 64) fail(3, "the song is too short to find a beat in");
  const lowRise = rise(bandLogs(lo, frames));
  const midRise = rise(bandLogs(mid, frames));
  const hiRise = rise(bandLogs(hi, frames));
  const allRise = lowRise.map((v, i) => v + midRise[i] + hiRise[i]);
  const onset = standOut(allRise);
  const low = standOut(lowRise);

  // Tempo: autocorrelation of the onset curve over 60 to 200 BPM, weighted by a log-normal around 120 BPM (one octave
  // wide), the peak refined by a parabola.
  const fps = SR / HOP;
  const lagLo = Math.floor((fps * 60) / MAX_BPM), lagHi = Math.ceil((fps * 60) / MIN_BPM);
  const ac = new Float64Array(lagHi + 2);
  for (let l = lagLo - 1; l <= lagHi + 1; l++) {
    let s = 0;
    for (let i = 0; i + l < onset.length; i++) s += onset[i] * onset[i + l];
    ac[l] = s / (onset.length - l);
  }
  let bestLag = 0, bestScore = -1;
  for (let l = lagLo; l <= lagHi; l++) {
    const bpm = (fps * 60) / l;
    const w = Math.exp(-0.5 * Math.log2(bpm / 120) ** 2);
    if (ac[l] * w > bestScore) { bestScore = ac[l] * w; bestLag = l; }
  }
  if (!(bestScore > 0)) fail(3, "the song has no beat to cut on: its onsets show no tempo between 60 and 200 BPM");
  const [a0, a1, a2] = [ac[bestLag - 1], ac[bestLag], ac[bestLag + 1]];
  const shift = a0 - 2 * a1 + a2 !== 0 ? (0.5 * (a0 - a2)) / (a0 - 2 * a1 + a2) : 0;
  const bpm0 = (fps * 60) / (bestLag + Math.max(-0.5, Math.min(0.5, shift)));

  // The grid: the tempo within 3% and the phase (5 ms steps) whose beats sit on the most onset over the whole song.
  let grid = { score: -1, bpm: bpm0, phase: 0 };
  for (let bpm = bpm0 * 0.97; bpm <= bpm0 * 1.03; bpm += 0.02) {
    const p = 60 / bpm;
    for (let phase = 0; phase < p; phase += 0.005) {
      let s = 0;
      for (let t = phase; t < analysed; t += p) s += at(onset, t);
      if (s > grid.score) grid = { score: s, bpm, phase };
    }
  }
  let period = 60 / grid.bpm;
  const gridTimes = [];
  for (let t = grid.phase; t < analysed - 0.02; t += period) gridTimes.push(t);
  // Snap each grid beat to the strongest onset within 12% of a beat (at most 60 ms); a beat with an onset at least 35%
  // of the median beat's is strong. A steady song (the strong beats fit a line within 20 ms) keeps the fitted grid.
  const half = Math.min(0.06, 0.12 * period);
  const near = gridTimes.map((t) => peakNear(onset, t, half));
  const typical = median(near.map((n) => n.value));
  const strong = near.map((n) => typical > 0 && n.value >= 0.35 * typical);
  const pts = near.map((n, k) => [k, n.t]).filter((_, k) => strong[k]);
  let beats = gridTimes.slice(), tempo = "steady", residual = 0;
  if (pts.length >= 8) {
    const n = pts.length, sk = pts.reduce((s, p) => s + p[0], 0), st = pts.reduce((s, p) => s + p[1], 0);
    const skk = pts.reduce((s, p) => s + p[0] * p[0], 0), skt = pts.reduce((s, p) => s + p[0] * p[1], 0);
    const slope = (n * skt - sk * st) / (n * skk - sk * sk), icpt = (st - slope * sk) / n;
    residual = Math.sqrt(pts.reduce((s, p) => s + (p[1] - (icpt + slope * p[0])) ** 2, 0) / n);
    if (residual <= 0.02 && slope > 0) {
      period = slope;
      let k0 = Math.ceil(-icpt / slope - 1e-9);
      beats = [];
      for (let k = k0; icpt + k * slope < analysed - 0.02; k++) beats.push(icpt + k * slope);
    } else {
      tempo = "drifting";
      beats = near.map((nb, k) => (strong[k] ? nb.t : gridTimes[k]));
    }
  }
  beats = beats.filter((t) => t >= 0);
  if (beats.length < 8) fail(3, "the song has fewer than 8 beats: no bar to cut on");
  // Confidence: how much more onset sits on the beats than halfway between them, (on - off) / (on + off), 0 at worst.
  // A click track is near 1, steady pop with busy hats nearer 0.3, noise or a beatless pad near 0.
  let on = 0, off = 0;
  for (const t of beats) {
    on += peakNear(onset, t, half).value;
    if (t + period / 2 < analysed) off += peakNear(onset, t + period / 2, half).value;
  }
  const confidence = on + off > 0 ? Math.max(0, Math.round(((on - off) / (on + off)) * 100) / 100) : 0;

  // The bar's first beat (4/4): of the four phases, the one whose beats carry the strongest low-band onsets (the kick,
  // the bass note), with the whole curve as a lighter second.
  let downPhase = 0, downScore = -1;
  for (let p = 0; p < 4; p++) {
    let s = 0, c = 0;
    for (let k = p; k < beats.length; k += 4) {
      s += peakNear(low, beats[k], 0.03).value + 0.5 * peakNear(onset, beats[k], 0.03).value;
      c++;
    }
    if (c && s / c > downScore) { downScore = s / c; downPhase = p; }
  }
  // Bar lines: every fourth beat from the first downbeat, carried on at the bar's length to the song's end.
  const bar = 4 * period;
  const lines = [];
  for (let k = downPhase; k < beats.length; k += 4) lines.push(beats[k]);
  while (lines[lines.length - 1] + bar <= analysed + 1e-6) lines.push(lines[lines.length - 1] + bar);
  const meanSquare = (a, b) => {
    const i = Math.max(0, Math.floor(a * SR)), j = Math.min(x.length, Math.floor(b * SR));
    let s = 0;
    for (let k = i; k < j; k++) s += x[k] * x[k];
    return j > i ? s / (j - i) : 0;
  };
  const bars = [];
  for (let j = 0; j + 1 < lines.length; j++) {
    const m = meanSquare(lines[j], lines[j + 1]);
    bars.push({ n: j + 1, start_s: r3(lines[j]), end_s: r3(lines[j + 1]), energy: m, db: m > 0 ? Math.round(10 * Math.log10(m) * 10) / 10 : -120 });
  }
  return { analysed, beats, period, bpm: 60 / period, tempo, residual, confidence, downPhase, lines, bars, meanSquare };
}

// ---------- the cut and the shots ----------
// The shots of the cut [a, b] over its bar lines: segments between consecutive lines (a and b included), grouped into N
// contiguous shots of 3 to 10 s, the lengths as even as the bars allow (least squares around (b - a) / N) and, among
// equally even groupings, the longer shots where the bars are quieter (a small term: length squared times the group's
// loudness, 0 for the quietest bar of the cut to 1 for the loudest).
function shotsOf(a, b, inner, loudness) {
  const points = [a, ...inner.filter((t) => t > a + 0.25 && t < b - 0.25), b].map(ms);
  const segs = [];
  for (let i = 0; i + 1 < points.length; i++) segs.push({ a: points[i], b: points[i + 1], len: (points[i + 1] - points[i]) / 1000, loud: loudness(points[i] / 1000, points[i + 1] / 1000) });
  const m = segs.length, total = (points[m] - points[0]) / 1000;
  const solve = (N) => {
    const mean = total / N, LAMBDA = 0.002;
    const best = Array.from({ length: N + 1 }, () => new Float64Array(m + 1).fill(Infinity));
    const from = Array.from({ length: N + 1 }, () => new Int32Array(m + 1).fill(-1));
    best[0][0] = 0;
    for (let k = 1; k <= N; k++) {
      for (let j = 1; j <= m; j++) {
        let len = 0, loud = 0;
        for (let i = j - 1; i >= 0; i--) {
          len += segs[i].len;
          loud += segs[i].len * segs[i].loud;
          if (len > SHOT_MAX + 1e-6) break;
          if (len < SHOT_MIN - 1e-6 || best[k - 1][i] === Infinity) continue;
          const c = best[k - 1][i] + (len - mean) ** 2 + LAMBDA * len * len * (loud / len);
          if (c < best[k][j] - 1e-9) { best[k][j] = c; from[k][j] = i; }
        }
      }
    }
    if (best[N][m] === Infinity) return null;
    const cuts = [m];
    for (let k = N, j = m; k > 0; k--) { j = from[k][j]; cuts.unshift(j); }
    return cuts;
  };
  const n0 = Math.max(1, Math.round(total / SHOT_TARGET));
  for (let d = 0; d <= m; d++) {
    for (const N of d ? [n0 - d, n0 + d] : [n0]) {
      if (N < 1 || N > m) continue;
      const cuts = solve(N);
      if (!cuts) continue;
      return { n: N, groups: cuts.slice(0, -1).map((i, k) => segs.slice(i, cuts[k + 1])) };
    }
  }
  return null;
}
function shotList(groups, bars) {
  return groups.map((g, k) => {
    const a = g[0].a, b = g[g.length - 1].b;
    const seconds = (b - a) / 1000;
    const whole = g.filter((s) => bars.some((x) => ms(x.start_s) === s.a && ms(x.end_s) === s.b)).length;
    return { n: k + 1, start_s: a / 1000, end_s: b / 1000, seconds, bars: whole, partial: whole !== g.length, clip_seconds: Math.max(SHOT_MIN, Math.ceil(seconds - 1e-9)) };
  });
}
function cutOf(song, cutAsked, startAsked, barsWanted) {
  const { bars } = song;
  const seconds = song.seconds;
  const loudnessIn = (lo, hi) => (a, b) => {
    const m = song.meanSquare(a, b);
    const d = m > 0 ? 10 * Math.log10(m) : -120;
    return hi > lo ? Math.max(0, Math.min(1, (d - lo) / (hi - lo))) : 0;
  };
  const range = (from, to) => {
    const ds = bars.filter((x) => x.start_s >= from - 1e-6 && x.end_s <= to + 1e-6).map((x) => x.db);
    return ds.length ? [Math.min(...ds), Math.max(...ds)] : [0, 0];
  };
  const finish = (a, b, chosen) => {
    const [lo, hi] = range(a, b);
    const inner = song.lines.filter((t) => t > a - 1e-6 && t < b + 1e-6);
    const s = shotsOf(a, b, inner, loudnessIn(lo, hi));
    if (!s) return null;
    return { start_s: r3(a), end_s: r3(b), seconds: (ms(b) - ms(a)) / 1000, bars: bars.filter((x) => x.start_s >= a - 1e-6 && x.end_s <= b + 1e-6).length, chosen_by: chosen, shots: shotList(s.groups, bars) };
  };
  if (barsWanted === undefined && seconds < cutAsked) {
    const c = finish(0, Math.min(seconds, song.analysed), "whole_song");
    if (!c) fail(3, `the song (${r2(seconds)} s) can't be split into shots of ${SHOT_MIN} to ${SHOT_MAX} s on its bar lines`);
    return c;
  }
  const barLen = song.period * 4;
  let B = barsWanted ?? Math.round(cutAsked / barLen);
  while (B * barLen > CUT_MAX + 1e-6) B--;
  // The nearest whole bars can fall under the shortest cut (10 s at 100 BPM is 4 bars, 9.6 s): take one bar more.
  while (B * barLen < CUT_MIN - 1e-6 && (B + 1) * barLen <= CUT_MAX + 1e-6) B++;
  B = Math.min(B, bars.length);
  if (startAsked !== undefined) {
    // From the bar line nearest start_s, never moved: a cut that would run past the song's end is shortened to the
    // whole bars left (said in the plan).
    const i0 = bars.reduce((best, x, i) => (Math.abs(x.start_s - startAsked) < Math.abs(bars[best].start_s - startAsked) ? i : best), 0);
    const left = bars.length - i0;
    if (left * barLen < CUT_MIN - 1e-6) fail(3, `from the bar line nearest ${startAsked} s (${bars[i0].start_s} s) only ${left} whole bar${left === 1 ? "" : "s"} (${r2(left * barLen)} s) remain: at least ${CUT_MIN} s is needed; ask for an earlier start_s`);
    for (let b = Math.min(B, left); b >= 1 && b * barLen >= CUT_MIN - 1e-6; b--) {
      const c = finish(bars[i0].start_s, bars[i0 + b - 1].end_s, "start_s");
      if (c) return { ...c, shortened: b < B };
    }
  } else {
    for (; B >= 1 && B * barLen >= CUT_MIN - 1e-6; B--) {
      let best = -1, bi = -1;
      for (let i = 0; i + B <= bars.length; i++) {
        let s = 0;
        for (let j = i; j < i + B; j++) s += bars[j].energy * (bars[j].end_s - bars[j].start_s);
        if (s > best * (1 + 1e-9)) { best = s; bi = i; }
      }
      if (bi < 0) continue;
      const c = finish(bars[bi].start_s, bars[bi + B - 1].end_s, "loudest");
      if (c) return c;
    }
  }
  fail(3, `no run of whole bars of the song fits a cut near ${cutAsked} s with shots of ${SHOT_MIN} to ${SHOT_MAX} s`);
}

function plan() {
  const songPath = need("song"), film = need("film");
  const cutAsked = num("cut", 60);
  if (!(cutAsked >= CUT_MIN && cutAsked <= CUT_MAX)) fail(2, `--cut is ${CUT_MIN} to ${CUT_MAX} seconds`);
  const startAsked = args.start === undefined ? undefined : num("start");
  if (startAsked !== undefined && !(startAsked >= 0)) fail(2, "--start is 0 or more seconds into the song");
  const aspect = args.aspect ?? "16:9";
  if (!SIZES[aspect]) fail(2, `--aspect is ${Object.keys(SIZES).join(" or ")}`);
  const lyricsOn = bool("lyrics", true);
  if (!existsSync(songPath)) fail(2, `${songPath} does not exist: web_save the song first`);
  const probed = probeSeconds(songPath);
  const song = analyse(songPath);
  // The song's length is what FFmpeg decodes, not what the container says: an MP3's header can be off by a frame or
  // more, and the cut, the segment and the fade all work on the decoded audio.
  song.seconds = song.analysed;
  if (startAsked !== undefined && startAsked >= song.seconds) fail(2, `--start ${startAsked} is past the song's end (${r2(song.seconds)} s)`);
  const cut = cutOf(song, cutAsked, song.seconds < cutAsked ? undefined : startAsked);
  const [width, height] = SIZES[aspect];
  const data = {
    song: { path: songPath, seconds: r3(song.seconds), container_s: probed === undefined ? null : r3(probed), minutes: song.seconds / 60 },
    beats: {
      bpm: Math.round(song.bpm * 10) / 10, period_s: Math.round(song.period * 10000) / 10000, meter: "4/4", count: song.beats.length,
      first_beat_s: r3(song.beats[0]), first_downbeat_s: r3(song.lines[0]), bar_s: r3(song.period * 4), tempo: song.tempo,
      fit_ms: Math.round(song.residual * 1000), confidence: song.confidence, times: song.beats.map(r3),
    },
    bars: song.bars.map(({ n, start_s, end_s, db }) => ({ n, start_s, end_s, db })),
    cut: { asked_s: cutAsked, start_asked_s: startAsked ?? null, ...cut, beats: song.beats.filter((t) => t >= cut.start_s - 1e-3 && t < cut.end_s - 1e-3).map((t) => r3(t - cut.start_s)) },
    aspect, width, height, lyrics_on: lyricsOn,
  };
  mkdirSync(film, { recursive: true });
  // A price is of one plan: a plan that changes removes the price of the old one, so price runs again before anything
  // is built (stills, remake and clips also check the plan's hash against the one price recorded).
  const planPath = join(film, "plan.json"), pricePath = join(film, "price.json");
  const bytes = JSON.stringify(data, null, 1) + "\n";
  const changed = !existsSync(planPath) || readFileSync(planPath, "utf8") !== bytes;
  writeFileSync(planPath, bytes);
  const out = [];
  if (changed && existsSync(pricePath)) {
    rmSync(pricePath);
    out.push(`${pricePath} removed: the plan changed since it was priced; run price again`);
  }
  out.push(`song: ${data.song.seconds} s (${songPath})`);
  out.push(`beats: ${data.beats.bpm} BPM, ${data.beats.count} beats, the first at ${data.beats.first_beat_s} s, bar lines (4/4) from ${data.beats.first_downbeat_s} s every ${data.beats.bar_s} s; tempo ${data.beats.tempo} (grid fit ${data.beats.fit_ms} ms, beat confidence ${data.beats.confidence})`);
  const note = weakBeat(data);
  if (note) out.push(note);
  out.push(`bars (dB): ${data.bars.map((b) => `${b.n}@${b.start_s}:${b.db}`).join(" ")}`);
  out.push(`cut: ${cut.start_s} s to ${cut.end_s} s of the song, ${cut.seconds} s, ${cutHow(data)}`);
  for (const s of cut.shots) out.push(`shot ${s.n}: ${r3(s.start_s - cut.start_s)} to ${r3(s.end_s - cut.start_s)} s of the film (${s.start_s} to ${s.end_s} s of the song), ${s.seconds} s, ${s.bars} bar${s.bars === 1 ? "" : "s"}${s.partial ? " with the song's lead-in or tail" : ""}, clip ${s.clip_seconds} s`);
  out.push(`plan: ${cut.shots.length} shots, ${cut.shots.length + RESERVE} stills priced (${RESERVE} in reserve), ${cut.shots.reduce((t, s) => t + s.clip_seconds, 0)} s of clips, film ${cut.seconds} s at ${width}x${height}, lyrics ${lyricsOn ? "on" : "off"}`);
  out.push(`answer fields (copy each into the answer exactly as printed): ${JSON.stringify(answerFields(data))}`);
  console.log(out.join("\n"));
}
// The plan's own words for a weak beat and for how the cut was chosen: plan prints them, answer.mjs puts them in the
// report.
export const weakBeat = (data) => (data.beats.confidence < 0.2 || data.beats.tempo === "drifting" ? "NOTE: the beat is weak or drifts here: the cuts land on the computed grid, which may sit off the music in places; say so in the report" : null);
export function cutHow(data) {
  const cut = data.cut;
  return { whole_song: `the song whole (it is shorter than the ${cut.asked_s} s asked)`, start_s: `from the bar line nearest ${cut.start_asked_s} s${cut.shortened ? `, SHORTENED to the ${cut.bars} whole bars left before the song ends (say so in the answer)` : ""}`, loudest: `the loudest ${cut.bars} bars that start on a bar line` }[cut.chosen_by];
}
export function answerFields(data) {
  return {
    song_seconds: data.song.seconds,
    beats: { bpm: data.beats.bpm, meter: data.beats.meter, count: data.beats.count, first_downbeat_s: data.beats.first_downbeat_s, bar_s: data.beats.bar_s, tempo: data.beats.tempo, confidence: data.beats.confidence },
    cut: { start_s: data.cut.start_s, end_s: data.cut.end_s, seconds: data.cut.seconds, bars: data.cut.bars, chosen_by: data.cut.chosen_by, shortened: data.cut.shortened === true },
    shots: data.cut.shots.map((s) => ({ n: s.n, film_start_s: r3(s.start_s - data.cut.start_s), film_end_s: r3(s.end_s - data.cut.start_s), seconds: s.seconds, bars: s.bars, clip_seconds: s.clip_seconds })),
  };
}
const readPlan = (film) => {
  const path = join(film, "plan.json");
  if (!existsSync(path)) fail(2, `${path} is missing: run plan first`);
  return JSON.parse(readFileSync(path, "utf8"));
};

// ---------- the price ----------
const STEP_RATES = ["isolation", "transcript", "still", "clip"];
// A sanity band per endpoint for the rates the run copies from get_pricing's answer: fal's list price to four times it.
// A rate outside its band is a misread answer, so price refuses it. Under list is the side a ceiling can't afford (a
// slipped digit prices a plan under a ceiling it is over), so the band has no room there; over it, a misread prices
// high, which is safe. List prices: audio-isolation $0.10 a minute, speech-to-text $0.03 a minute, Nano Banana Pro
// $0.15 an image at 1K, Kling 3.0 Pro image to video $0.112 a second with audio off.
const RATE_BANDS = {
  isolation: { endpoint_id: "fal-ai/elevenlabs/audio-isolation", list: 0.1, unit: "a minute" },
  transcript: { endpoint_id: "fal-ai/elevenlabs/speech-to-text", list: 0.03, unit: "a minute" },
  still: { endpoint_id: "fal-ai/nano-banana-pro", list: 0.15, unit: "an image" },
  clip: { endpoint_id: "fal-ai/kling-video/v3/pro/image-to-video", list: 0.112, unit: "a second" },
};
function priceOf(shots, minutes, lyricsOn, r) {
  const lines = [];
  if (lyricsOn) {
    lines.push({ step: "isolate", endpoint_id: "fal-ai/elevenlabs/audio-isolation", units: minutes, unit: "minutes", rate_usd: r.isolation });
    lines.push({ step: "transcript", endpoint_id: "fal-ai/elevenlabs/speech-to-text", units: minutes, unit: "minutes", rate_usd: r.transcript });
  }
  for (const s of shots) lines.push({ step: `still-${s.n}`, endpoint_id: "fal-ai/nano-banana-pro", units: 1, unit: "images", rate_usd: r.still });
  for (let k = 1; k <= RESERVE; k++) lines.push({ step: `reserve-${k}`, endpoint_id: "fal-ai/nano-banana-pro", units: 1, unit: "images", rate_usd: r.still, reserve: true });
  for (const s of shots) lines.push({ step: `clip-${s.n}`, endpoint_id: "fal-ai/kling-video/v3/pro/image-to-video", units: s.clip_seconds, unit: "seconds", rate_usd: r.clip });
  for (const l of lines) {
    l.usd = usd(l.units * l.rate_usd);
    if (l.unit === "minutes") l.units = Math.round(l.units * 10000) / 10000;
  }
  return { lines, total: usd(lines.reduce((t, l) => t + l.units * l.rate_usd, 0)) };
}
// The first rate outside its band, in words; undefined when every rate is in its band.
function offBand(r) {
  for (const k of STEP_RATES) {
    const b = RATE_BANDS[k], low = b.list, high = b.list * 4;
    if (!(typeof r?.[k] === "number" && r[k] >= low - 1e-12 && r[k] <= high + 1e-12)) return `--rates ${k}=${r?.[k]}: ${b.endpoint_id}'s rate is outside ${low} to ${high} USD ${b.unit} (its list price to four times it; under list prices the plan below what fal bills): copy the rate from get_pricing's answer again`;
  }
  return undefined;
}
// The run's ceiling as its first price recorded it (film/ceiling.json): {max_fal_usd: <USD or null>}, or undefined
// before any price. plan never removes it, so a new plan is priced against the same ceiling.
const ceilingPath = (film) => join(film, "ceiling.json");
function recordedCeiling(film) {
  const path = ceilingPath(film);
  if (!existsSync(path)) return undefined;
  let c;
  try {
    c = JSON.parse(readFileSync(path, "utf8"));
  } catch {
    c = null;
  }
  if (!isObj(c) || !(c.max_fal_usd === null || (typeof c.max_fal_usd === "number" && c.max_fal_usd >= 0))) fail(2, `${path} is not what price writes ({"max_fal_usd": <the user's ceiling, or null>}): nothing is priced or built`);
  return c;
}
function price() {
  const film = need("film");
  const data = readPlan(film);
  const r = {};
  for (const pair of need("rates").split(",")) {
    const [k, v] = pair.split("=");
    if (!STEP_RATES.includes(k) || !Number.isFinite(Number(v)) || Number(v) < 0) fail(2, `--rates takes ${STEP_RATES.map((s) => `${s}=<USD>`).join(",")}: ${pair}`);
    r[k] = Number(v);
  }
  for (const k of STEP_RATES) if (r[k] === undefined) fail(2, `--rates is missing ${k}`);
  const off = offBand(r);
  if (off) fail(2, off);
  // --max is max_fal_usd, given only when the user set one: their own ceiling. Without it nothing is refused for
  // price, and the price is information for the answer.
  const max = num("max", null);
  if (max !== null && !(max >= 0)) fail(2, "--max is max_fal_usd, 0 or more; leave it out when the user set none");
  // The user's ceiling holds for the whole run: the first price records it, and once one is recorded a price without
  // it, or with another, is refused (a ceiling the user set is never dropped or moved by a re-price).
  const kept = recordedCeiling(film);
  if (kept && kept.max_fal_usd !== null && max !== kept.max_fal_usd)
    fail(2, `--max ${max === null ? "left out" : max}: film/ceiling.json records max_fal_usd ${kept.max_fal_usd}, this run's ceiling from its first price: give --max ${kept.max_fal_usd} (the user's ceiling never changes in a run); nothing is priced`);
  if (!kept || kept.max_fal_usd !== max) writeFileSync(ceilingPath(film), JSON.stringify({ max_fal_usd: max }) + "\n");
  const minutes = data.song.minutes;
  const p = priceOf(data.cut.shots, minutes, data.lyrics_on, r);
  const fits = max === null || p.total <= max + 1e-9;
  // The plan priced, by its bytes' hash, and the ceiling it was judged against: stills, remake and clips build only on
  // a price of the plan as it is now.
  const out = { rates: r, max_fal_usd: max, lines: p.lines, plan_usd: p.total, fits, plan_sha256: planHash(film) };
  writeFileSync(join(film, "price.json"), JSON.stringify(out, null, 1) + "\n");
  const lines = [];
  for (const l of p.lines) lines.push(`${l.step}${l.reserve ? " (reserve)" : ""}: ${l.units} ${l.unit} x $${l.rate_usd} = $${l.usd}`);
  lines.push(max === null ? `plan_usd: ${p.total} (no ceiling set)` : `plan_usd: ${p.total} (your ceiling, max_fal_usd ${max}): ${fits ? "FITS" : "OVER YOUR CEILING"}`);
  lines.push(`answer fields (copy each into the answer exactly as printed): ${JSON.stringify({ plan_usd: p.total })}`);
  console.log(lines.join("\n"));
}

// ---------- the lyrics ----------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const stamp = (s) => {
  const t = Math.max(0, Math.round(s * 1000));
  const h = Math.floor(t / 3600000), m = Math.floor((t % 3600000) / 60000), sec = Math.floor((t % 60000) / 1000), milli = t % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(milli).padStart(3, "0")}`;
};
function lyrics() {
  const film = need("film"), wordsPath = need("words"), vtt = args.vtt ?? "media/lyrics.vtt";
  const data = readPlan(film);
  if (!existsSync(wordsPath)) fail(2, `${wordsPath} is missing: write speech-to-text's answer there first`);
  let got;
  try {
    got = JSON.parse(readFileSync(wordsPath, "utf8"));
  } catch (e) {
    fail(2, `${wordsPath} is not JSON: ${e.message}`);
  }
  const list = Array.isArray(got) ? got : Array.isArray(got?.words) ? got.words : null;
  if (!list) fail(2, `${wordsPath} holds neither a words list nor fal's answer with one`);
  const all = list.filter((w) => w && (w.type === undefined || w.type === "word") && typeof w.text === "string" && w.text.trim() && Number.isFinite(w.start) && Number.isFinite(w.end));
  const a = data.cut.start_s, b = data.cut.end_s, C = data.cut.seconds;
  const inCut = all.filter((w) => w.start >= a && w.start < b).map((w) => ({ text: w.text.trim(), start: r3(w.start - a), end: r3(Math.min(Math.max(w.end, w.start), b) - a) }));
  const lyricsHtml = join(film, "compositions", "lyrics.html");
  const result = { words_in_song: all.length, words_in_cut: inCut.length, lines: [], under_shots: [] };
  if (!inCut.length) {
    rmSync(lyricsHtml, { force: true });
    result.under_shots = data.cut.shots.map((s) => ({ n: s.n, lyric: "" }));
    writeFileSync(join(film, "lyrics.json"), JSON.stringify(result, null, 1) + "\n");
    console.log(all.length ? `NO WORDS IN THE CUT: speech-to-text found ${all.length} words in the song, none between ${a} and ${b} s: no lyric captions, no ${vtt}` : `NO WORDS: speech-to-text found no words in the song: no lyric captions, no ${vtt}`);
    console.log(`answer fields (copy each into the answer exactly as printed): ${JSON.stringify({ words_in_song: all.length, words_in_cut: 0, lines: 0, vtt_path: null })}`);
    return;
  }
  // Lines: a pause of LINE_GAP s, a sentence's end or LINE_WORDS words ends one, once it has run 0.2 s (a word sooner
  // than that joins it, so two lines never start closer than 0.2 s). Each line shows from its first word to its last
  // word's end, held at least one beat, then cut short of the next line (by 40 ms) and the film's end: those limits
  // come last. A last line with no time left before the film's end (a word in its final millisecond) is dropped.
  const lines = [];
  let cur = [];
  for (const w of inCut) {
    const prev = cur[cur.length - 1];
    if (prev && w.start - cur[0].start >= 0.2 && (w.start - prev.end >= LINE_GAP || cur.length >= LINE_WORDS || /[.!?]["')\]]*$/.test(prev.text))) {
      lines.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) lines.push(cur);
  const beat = data.beats.period_s;
  result.lines = lines.map((ws, i) => {
    const start = ws[0].start, nextStart = i + 1 < lines.length ? lines[i + 1][0].start : C;
    const end = Math.min(Math.max(ws[ws.length - 1].end, start + beat), i + 1 < lines.length ? nextStart - 0.04 : C, C);
    return { start_s: r3(start), end_s: r3(end), text: ws.map((w) => w.text).join(" ") };
  }).filter((l) => l.end_s > l.start_s).map((l, i) => ({ n: i + 1, ...l }));
  result.under_shots = data.cut.shots.map((s) => {
    const fa = s.start_s - a, fb = s.end_s - a;
    return { n: s.n, lyric: inCut.filter((w) => w.start >= fa - 1e-6 && w.start < fb - 1e-6).map((w) => w.text).join(" ") };
  });
  writeFileSync(join(film, "lyrics.json"), JSON.stringify(result, null, 1) + "\n");
  // WebVTT cue text escapes &, < and > (a lyric is text, never markup).
  const vttText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  writeFileSync(vtt, "WEBVTT\n\n" + result.lines.map((l) => `${l.n}\n${stamp(l.start_s)} --> ${stamp(l.end_s)}\n${vttText(l.text)}\n`).join("\n"));
  // The captions scene: one timed line at a time, set as type over the picture, inside the title-safe area.
  const [W, H] = [data.width, data.height];
  const lineDivs = result.lines.map((l) => `    <div id="ly-${l.n}" class="clip ly-line" data-start="${l.start_s}" data-duration="${r3(l.end_s - l.start_s)}"><span id="ly-${l.n}-t" class="ly-text">${esc(l.text)}</span></div>`);
  const tweens = result.lines.map((l) => `    tl.fromTo("#ly-${l.n}-t", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.14, ease: "power4.out" }, ${l.start_s});`);
  mkdirSync(join(film, "compositions"), { recursive: true });
  writeFileSync(lyricsHtml, `<!-- Lyric captions, written by beats.mjs lyrics from speech-to-text's words: one line at a time, each from its first
     word to its last word's end (held at least a beat). The words are the song's, shown as data: never edit them here,
     restyle them in the style block. -->
<template>
  <style>
    #root { position: absolute; inset: 0; container-type: size; pointer-events: none; z-index: 10; }
    .ly-line { position: absolute; left: 0; right: 0; bottom: 9cqh; display: flex; justify-content: center; overflow: visible; }
    .ly-text { font-family: var(--lyric-font); font-weight: 800; font-size: 5cqh; line-height: 1.15; color: var(--lyric-ink); background: var(--lyric-scrim); padding: 0.18em 0.5em; max-width: 80cqw; text-align: center; }
    @container (max-aspect-ratio: 3/4) {
      .ly-line { bottom: 36cqh; }
      .ly-text { font-size: 3.1cqh; max-width: 72cqw; }
    }
  </style>
  <div id="root" data-composition-id="lyrics" data-width="${W}" data-height="${H}">
${lineDivs.join("\n")}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
${tweens.join("\n")}
    window.__timelines["lyrics"] = tl;
  </script>
</template>
`);
  const out = [`lyrics: ${inCut.length} of the song's ${all.length} words fall in the cut, in ${result.lines.length} lines; ${vtt} and ${lyricsHtml} written`];
  for (const l of result.lines) out.push(`line ${l.n}: ${l.start_s} to ${l.end_s} s: ${l.text}`);
  for (const s of result.under_shots) out.push(`under shot ${s.n}: ${s.lyric || "(no words)"}`);
  out.push(`answer fields (copy each into the answer exactly as printed): ${JSON.stringify({ words_in_song: all.length, words_in_cut: inCut.length, lines: result.lines.length, vtt_path: vtt })}`);
  console.log(out.join("\n"));
}

// ---------- the film ----------
function place() {
  const film = need("film");
  const data = readPlan(film);
  const C = data.cut.seconds, W = data.width, H = data.height;
  const path = join(film, "index.html");
  if (!existsSync(path)) fail(2, `${path} is missing: copy the kit into ${film} first`);
  let html = readFileSync(path, "utf8");
  const markers = [["<!-- MU-SHOTS -->", "<!-- /MU-SHOTS -->"], ["<!-- MU-MEDIA -->", "<!-- /MU-MEDIA -->"], ["// MU-TIMELINE", "// /MU-TIMELINE"]];
  for (const [open, close] of markers) if (html.split(open).length !== 2 || html.split(close).length !== 2) fail(2, `${path} lacks its ${open} ... ${close} markers, or holds them twice: copy the kit's index.html again`);
  // Each shot's picture: its clip when one is saved and readable, else its still (the fallback, with a slow push-in).
  const shots = data.cut.shots.map((s) => {
    const start = r3(s.start_s - data.cut.start_s), dur = s.seconds;
    const clip = join(film, "assets", `clip-${s.n}.mp4`), still = join(film, "assets", `still-${s.n}.png`);
    let use = null, why = null, rate = null;
    if (existsSync(clip)) {
      const len = probeSeconds(clip);
      if (len === undefined) why = `assets/clip-${s.n}.mp4 can't be read`;
      else if (len < dur * 0.8) why = `assets/clip-${s.n}.mp4 runs ${r2(len)} s, too short for a ${dur} s shot`;
      else {
        use = "clip";
        if (len < dur - 0.001) rate = Math.floor((len / dur) * 1000) / 1000;
      }
    } else why = `no assets/clip-${s.n}.mp4`;
    if (!use) {
      if (!existsSync(still)) fail(2, `shot ${s.n}: ${why}, and no assets/still-${s.n}.png to fall back on: copy the shot's saved files into ${join(film, "assets")}`);
      use = "still";
    }
    return { n: s.n, start, dur, use, why: use === "still" ? why : null, rate };
  });
  // The clips joined into one video on the film's frame grid, so HyperFrames extracts one file, not one per shot (it
  // runs every video's extraction at once). Each shot is its own frames [round(start x FPS), round(end x FPS)), the
  // last one to ceil(cut x FPS), the frames HyperFrames renders (a 30.041 s cut is 902), so the parts tile the film
  // exactly and no cut drifts off its bar line. A clip part is the clip from its start (slowed when
  // the clip runs short), scaled to cover the canvas; a still's part is the still, framed as its element frames it at
  // the push-in's start, so where the rounded frame edge and the element's exact start differ the still shows. One
  // FFmpeg at a time (spawnSync), each held to JOIN_THREADS threads, so the step's peak memory is one process's.
  const frameAt = (t) => Math.round(t * FPS);
  const total = Math.ceil(C * FPS - 1e-6);
  const parts = join(film, "join");
  rmSync(parts, { recursive: true, force: true });
  mkdirSync(parts, { recursive: true });
  const enc = ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS), "-g", String(FPS), "-threads", JOIN_THREADS];
  const ffError = (r) => String(r.stderr || r.error || "").trim().split("\n").slice(-3).join(" ");
  for (const s of shots) {
    s.frames = [frameAt(s.start), s === shots[shots.length - 1] ? total : frameAt(s.start + s.dur)];
    const n = s.frames[1] - s.frames[0];
    const input = s.use === "clip"
      ? ["-threads", JOIN_THREADS, "-i", join(film, "assets", `clip-${s.n}.mp4`)]
      : ["-loop", "1", "-framerate", String(FPS), "-i", join(film, "assets", `still-${s.n}.png`)];
    const cover = [`scale=${W}:${H}:force_original_aspect_ratio=increase`, `crop=${W}:${H}`, "setsar=1"];
    const vf = s.use === "clip"
      ? [...(s.rate ? [`setpts=PTS/${s.rate}`] : []), `fps=${FPS}`, ...cover, "tpad=stop_mode=clone:stop_duration=1"].join(",")
      : cover.join(",");
    const out = join(parts, `shot-${s.n}.mp4`);
    const r = spawnSync("ffmpeg", ["-v", "error", "-nostdin", "-y", ...input, "-an", "-vf", vf, "-frames:v", String(n), ...enc, out], { encoding: "utf8" });
    if (r.status !== 0) fail(3, `shot ${s.n}: ffmpeg could not cut its part of the joined video: ${ffError(r)}`);
    const got = videoOf(out);
    if (!got || got.frames !== n) fail(2, `shot ${s.n}: its part of the joined video holds ${got ? got.frames : "no"} frames, not ${n}: check assets/clip-${s.n}.mp4 and run place again`);
  }
  writeFileSync(join(parts, "list.txt"), shots.map((s) => `file 'shot-${s.n}.mp4'`).join("\n") + "\n");
  const joined = join(film, "assets", "shots.mp4");
  const cat = spawnSync("ffmpeg", ["-v", "error", "-nostdin", "-y", "-f", "concat", "-safe", "0", "-i", join(parts, "list.txt"), "-c", "copy", "-movflags", "+faststart", joined], { encoding: "utf8" });
  if (cat.status !== 0) fail(3, `ffmpeg could not join the shots: ${ffError(cat)}`);
  rmSync(parts, { recursive: true, force: true });
  // On screen: the joined video under everything, then one element per shot on the plan's clock: a clip's shot is a
  // clear mark naming its clip (the review's shots and cuts), a still's shot its image with the push-in.
  const els = [
    `      <video id="shots" class="clip mu-shot" src="assets/shots.mp4" data-start="0" data-duration="${C}" data-track-index="0" muted playsinline></video>`,
    ...shots.map((s) =>
      s.use === "clip"
        ? `      <div id="shot-${s.n}" class="clip mu-cut" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1" data-clip="assets/clip-${s.n}.mp4"></div>`
        : `      <div id="shot-${s.n}" class="clip mu-hold" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1"><img id="shot-${s.n}-img" src="assets/still-${s.n}.png" alt="" /></div>`,
    ),
  ];
  const lyricsFile = join(film, "compositions", "lyrics.html");
  const withLyrics = data.lyrics_on && existsSync(lyricsFile);
  // The song's segment, cut by FFmpeg from the saved song: the film's only audio. A cut that ends before the song does
  // fades out over its last 1.5 s; every cut opens with a 20 ms fade so the first frame doesn't click.
  mkdirSync(join(film, "assets"), { recursive: true });
  const seg = join(film, "assets", "song.m4a");
  const endsWithSong = Math.abs(data.cut.end_s - data.song.seconds) < 0.05;
  // atrim cuts on the song's clock and asetpts restarts the segment at 0, so both fades are on the segment's own clock
  // (an output-side -ss trims after the filters, which would fade on the song's clock and leave the end silent).
  const fades = [`atrim=start=${data.cut.start_s}:duration=${C}`, "asetpts=PTS-STARTPTS", `afade=t=in:st=0:d=0.02`, ...(endsWithSong ? [] : [`afade=t=out:st=${r3(Math.max(0, C - 1.5))}:d=1.5`])].join(",");
  const cut = spawnSync("ffmpeg", ["-v", "error", "-nostdin", "-y", "-i", data.song.path, "-vn", "-ac", "2", "-ar", "44100", "-af", fades, "-c:a", "aac", "-b:a", "192k", seg], { encoding: "utf8" });
  if (cut.status !== 0) fail(3, `ffmpeg could not cut the song's segment: ${(cut.stderr || "").trim().split("\n").slice(-3).join(" ")}`);
  const segLen = probeSeconds(seg);
  const media = [
    ...(withLyrics ? [`      <div id="lyrics" data-composition-id="lyrics" data-composition-src="compositions/lyrics.html" data-start="0" data-duration="${C}" data-track-index="2" data-track-kind="captions" data-width="${W}" data-height="${H}"></div>`] : []),
    `      <audio id="song" class="clip" src="assets/song.m4a" data-start="0" data-duration="${C}" data-track-index="3" data-volume="1"></audio>`,
  ];
  const pushes = shots.filter((s) => s.use === "still").map((s) => `      tl.fromTo("#shot-${s.n}-img", { scale: 1 }, { scale: 1.08, duration: ${s.dur}, ease: "none" }, ${s.start});`);
  html = html.replace(/(<!-- MU-SHOTS -->)[\s\S]*?(\s*<!-- \/MU-SHOTS -->)/, `$1\n${els.join("\n")}$2`);
  html = html.replace(/(<!-- MU-MEDIA -->)[\s\S]*?(\s*<!-- \/MU-MEDIA -->)/, `$1\n${media.join("\n")}$2`);
  html = html.replace(/(\/\/ MU-TIMELINE)[\s\S]*?(\s*\/\/ \/MU-TIMELINE)/, `$1\n      const tl = gsap.timeline({ paused: true });\n${pushes.join("\n")}${pushes.length ? "\n" : ""}      window.__timelines["main"] = tl;$2`);
  html = html.replace(/(<div id="root" data-composition-id="main"[^>]*?data-duration=")[0-9.]+(")/, `$1${C}$2`);
  html = html.replace(/(<div id="root" data-composition-id="main"[^>]*?data-width=")[0-9]+(")/, `$1${W}$2`);
  html = html.replace(/(<div id="root" data-composition-id="main"[^>]*?data-height=")[0-9]+(")/, `$1${H}$2`);
  writeFileSync(path, html);

  // Read back what was written: every shot once, on the plan's clock, tiling the cut with no gap and no overlap; the
  // root, the song and the captions host as long as the cut; every file a shot or the song names present.
  const back = readFileSync(path, "utf8");
  const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
  const tagOf = (id) => {
    const all = [...back.matchAll(new RegExp(`<(?:video|div|img|audio)\\b[^>]*\\bid="${id}"[^>]*>`, "g"))];
    return all.length === 1 ? all[0][0] : all.length ? "TWICE" : undefined;
  };
  let clock = 0;
  for (const s of shots) {
    const tag = tagOf(`shot-${s.n}`);
    const said = tag && tag !== "TWICE" ? { start: Number(attr(tag, "data-start")), dur: Number(attr(tag, "data-duration")) } : null;
    if (!said) fail(2, `shot ${s.n}: ${tag === "TWICE" ? "index.html holds it twice" : "index.html has no element for it"}: copy the kit's index.html again and run place again`);
    if (ms(said.start) !== ms(s.start) || ms(said.dur) !== ms(s.dur)) fail(2, `shot ${s.n}: index.html places it at ${said.start} s for ${said.dur} s but the plan has ${s.start} s for ${s.dur} s: copy the kit's index.html again and run place again; never edit a time by hand`);
    if (ms(said.start) !== ms(clock)) fail(2, `shot ${s.n}: it starts at ${said.start} s but the shot before ends at ${r3(clock)} s: copy the kit's index.html again and run place again`);
    clock = said.start + said.dur;
    const src = s.use === "clip" ? attr(tag, "data-clip") : back.match(new RegExp(`<img\\b[^>]*\\bid="shot-${s.n}-img"[^>]*>`))?.[0]?.match(/\bsrc="([^"]*)"/)?.[1];
    if (!src || !existsSync(join(film, src))) fail(2, `shot ${s.n}: its picture ${src ?? "(none)"} is not in ${film}`);
  }
  if (ms(clock) !== ms(C)) fail(2, `the shots end at ${r3(clock)} s but the cut is ${C} s: run plan and place again`);
  const extra = [...back.matchAll(/\bid="shot-(\d+)"/g)].map((m) => Number(m[1])).filter((n) => !shots.some((s) => s.n === n));
  if (extra.length) fail(2, `shot ${extra[0]}: index.html holds a shot the plan doesn't: copy the kit's index.html again and run place again`);
  // The joined video: once, the whole cut, every frame of it on the canvas, and the film's only <video>.
  const shotsTag = tagOf("shots");
  if (!shotsTag || shotsTag === "TWICE" || attr(shotsTag, "src") !== "assets/shots.mp4" || ms(Number(attr(shotsTag, "data-start"))) !== 0 || ms(Number(attr(shotsTag, "data-duration"))) !== ms(C)) fail(2, `the joined video's <video> is missing or not 0 to ${C} s: copy the kit's index.html again and run place again`);
  if ((back.match(/<video\b/g) || []).length !== 1) fail(2, "index.html holds a <video> besides the joined shots: copy the kit's index.html again and run place again");
  const jv = videoOf(joined);
  if (!jv || jv.frames !== total || jv.width !== W || jv.height !== H) fail(2, `assets/shots.mp4 holds ${jv ? `${jv.frames} frames at ${jv.width}x${jv.height}` : "nothing readable"}, not the cut's ${total} frames at ${W}x${H}: run place again`);
  const root = back.match(/<div id="root" data-composition-id="main"[^>]*>/)?.[0];
  if (!root || ms(Number(attr(root, "data-duration"))) !== ms(C)) fail(2, `the root lasts ${root ? attr(root, "data-duration") : "(no root)"} s but the cut is ${C} s: copy the kit's index.html again and run place again`);
  const song = tagOf("song");
  if (!song || song === "TWICE" || ms(Number(attr(song, "data-duration"))) !== ms(C) || !existsSync(seg)) fail(2, `the song's <audio> is missing or not ${C} s long: copy the kit's index.html again and run place again`);
  if (segLen === undefined || Math.abs(segLen - C) > 0.15) fail(2, `the song's segment runs ${segLen ?? "(unreadable)"} s, not the cut's ${C} s: check ${data.song.path} and run place again`);
  if (withLyrics) {
    const host = tagOf("lyrics");
    if (!host || host === "TWICE" || ms(Number(attr(host, "data-duration"))) !== ms(C)) fail(2, `the lyrics host is missing or not ${C} s long: copy the kit's index.html again and run place again`);
  } else if (tagOf("lyrics")) fail(2, "index.html holds a lyrics host but the film has no lyric captions: copy the kit's index.html again and run place again");

  const stills = shots.filter((s) => s.use === "still").map((s) => ({ n: s.n, why: s.why }));
  writeFileSync(join(film, "placed.json"), JSON.stringify({ film_seconds: C, width: W, height: H, lyrics: withLyrics, shots }, null, 1) + "\n");
  for (const s of stills) console.log(`STILL: shot ${s.n} shows its still with a slow push-in (${s.why})`);
  console.log(JSON.stringify({ film_seconds: C, width: W, height: H, lyrics: withLyrics, joined_frames: total, clips: shots.filter((s) => s.use === "clip").length, stills, slowed: shots.filter((s) => s.rate).map((s) => ({ n: s.n, playback_rate: s.rate })) }));
}

// ---------- the key stem ----------
// One stem per run, made here from the sandbox's random bytes, never by a model. A resumed run is the same run in the
// same folder, so the file it left gives the stem back.
function stem() {
  const file = need("file");
  let kept = null;
  if (existsSync(file)) {
    try {
      kept = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      kept = null;
    }
  }
  if (kept && typeof kept.stem === "string" && /^[a-z0-9]{8}$/.test(kept.stem)) {
    console.log(JSON.stringify({ stem: kept.stem, made: false }));
    return;
  }
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const made = [...randomBytes(8)].map((b) => letters[b % letters.length]).join("");
  writeFileSync(file, JSON.stringify({ stem: made }) + "\n");
  console.log(JSON.stringify({ stem: made, made: true }));
}

// ---------- the stills ----------
const NANO = "fal-ai/nano-banana-pro";
const ENDING = "No text, no lettering, no logos.";
const REMAKES = 2;
const STEM = /^[a-z0-9]{8}$/;
export const tidy = (text) => text.trim().replace(/[\s.,;:]+$/, "");
// The shot lines of a storyboard (`<n> | ... | picture: <what the still shows> | motion: <move>`), checked against the
// plan's shots: one line per shot, in order.
export function shotLines(board, shots) {
  if (!existsSync(board)) fail(2, `${board} is missing: write the storyboard first`);
  const text = readFileSync(board, "utf8");
  const lines = text.split("\n").filter((l) => /^\s*\d+\s*\|/.test(l));
  if (lines.length !== shots.length) fail(2, `${board} holds ${lines.length} shot lines, the plan ${shots.length}: one line per shot of the plan, in order`);
  lines.forEach((line, i) => {
    const n = Number(line.match(/^\s*(\d+)/)[1]);
    if (n !== shots[i].n) fail(2, `shot line ${i + 1} is shot ${n}: the storyboard's lines are the plan's shots in order`);
  });
  return { text, lines };
}
const stillInput = (record, picture) => ({ prompt: `${record.style}. ${picture}. ${ENDING}`, ...record.every_still });
const stillCall = (record, s) => ({ endpoint_id: record.endpoint_id, submission_key: s.key, input: stillInput(record, s.picture) });
function writeStills(file, record) {
  const head = { endpoint_id: record.endpoint_id, style: record.style, each_prompt: record.each_prompt, every_still: record.every_still };
  const top = Object.entries(head).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(",\n ");
  writeFileSync(file, `{${top},\n "stills": [\n${record.stills.map((s) => `  ${JSON.stringify(s)}`).join(",\n")}\n]}\n`);
}
// Nothing is built for fal until the plan is priced and fits: price writes film/price.json, and stills, remake and
// clips read it first. Over the user's ceiling, or never priced, they print nothing to send. The price is judged again
// here from the plan and its rates against the recorded ceiling, never by the flags a file can be given by hand.
const planHash = (film) => createHash("sha256").update(readFileSync(join(film, "plan.json"))).digest("hex");
function priced(film) {
  const path = join(film, "price.json");
  let p = null;
  try {
    p = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
  } catch {
    p = null;
  }
  if (p === null || typeof p !== "object") fail(2, "the plan is over the ceiling you set (or not priced yet): nothing is built");
  if (!existsSync(join(film, "plan.json")) || p.plan_sha256 !== planHash(film)) fail(2, "the plan changed since it was priced: run price again (nothing is built)");
  const kept = recordedCeiling(film);
  if (!kept || p.max_fal_usd !== kept.max_fal_usd) fail(2, "film/price.json was not judged against the ceiling film/ceiling.json records for this run: run price again with --max <the user's max_fal_usd> (nothing is built)");
  const off = offBand(p.rates);
  if (off) fail(2, `film/price.json: ${off} (nothing is built)`);
  const data = readPlan(film);
  const total = priceOf(data.cut.shots, data.song.minutes, data.lyrics_on, p.rates).total;
  if (!Number.isFinite(total) || (kept.max_fal_usd !== null && total > kept.max_fal_usd + 1e-9) || p.fits !== true) fail(2, "the plan is over the ceiling you set (or not priced yet): nothing is built");
}
const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const never = (what) => `a record of ${what} that may have been sent is never replaced`;
// A record a run already holds: parsed, an object whose `list` is a list of objects; else an error in words.
function readRecord(file, list, command) {
  let kept;
  try {
    kept = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(2, `${file} is there and is not the record ${command} wrote (${error.message.split("\n")[0]}): ${never(list)}`);
  }
  if (!isObj(kept) || !Array.isArray(kept[list]) || !kept[list].every(isObj)) fail(2, `${file} is there and is not the record ${command} wrote (no list of ${list}, each an object): ${never(list)}`);
  return kept;
}
// A storyboard line's picture: what follows "| picture:", up to its last "| motion:".
export function pictureOf(line) {
  const at = line.indexOf("| picture:");
  const end = line.lastIndexOf("| motion:");
  return at < 0 ? "" : tidy(line.slice(at + "| picture:".length, end > at ? end : undefined));
}
// The stills record from the plan and the storyboard: what stills prints and writes, and what a check rebuilds.
export function buildStills(film, board, stem) {
  if (!STEM.test(stem)) fail(2, "--stem is the run's key stem from media/run-keys.json: 8 lowercase letters and digits");
  const plan = readPlan(film);
  const { text, lines } = shotLines(board, plan.cut.shots);
  const styleLine = text.split("\n").find((l) => /^\s*Style:/i.test(l));
  const style = styleLine === undefined ? "" : tidy(styleLine.replace(/^\s*Style:/i, ""));
  if (!style) fail(2, `${board} has no style line: its first line is \`Style: <one look for every shot>\``);
  return {
    endpoint_id: NANO,
    style,
    each_prompt: `<style>. <picture>. ${ENDING}`,
    every_still: { num_images: 1, aspect_ratio: plan.aspect, resolution: "1K", output_format: "png", enable_web_search: false },
    stills: plan.cut.shots.map((s, i) => {
      const picture = pictureOf(lines[i]);
      if (!picture) fail(2, `shot ${s.n}: its storyboard line has no picture (\`| picture: <what the still shows>\`)`);
      return { n: s.n, key: `mu-${stem}-still-${s.n}`, picture };
    }),
  };
}
function stills() {
  const film = need("film"), board = need("storyboard"), file = need("file"), stem = need("stem");
  priced(film);
  const record = buildStills(film, board, stem);
  // A resumed run may run stills again after some stills were sent and remade: the record they were sent with is kept
  // whole (its remakes too, which the remake limits count) when the inputs are the same, and never replaced when not.
  if (existsSync(file)) {
    const kept = readRecord(file, "stills", "stills");
    keptSame(file, kept, record);
    for (const s of kept.stills.filter((t) => !t.remake)) console.log(`submit_job ${JSON.stringify(stillCall(kept, s))}`);
    return;
  }
  writeStills(file, record);
  for (const s of record.stills) console.log(`submit_job ${JSON.stringify(stillCall(record, s))}`);
}
// The record a run already holds against the one stills would write now: the same, or an error naming what differs.
function keptSame(file, kept, record) {
  const no = `${never("stills")}: remake a shot to change its still`;
  if (kept.style !== record.style) fail(2, `${file} already holds the stills with another style (${JSON.stringify(kept.style)}); ${no}`);
  for (const field of ["endpoint_id", "each_prompt", "every_still"]) {
    if (JSON.stringify(kept[field]) !== JSON.stringify(record[field])) fail(2, `${file} already holds the stills with another ${field} (${JSON.stringify(kept[field])}); ${no}`);
  }
  const firsts = kept.stills.filter((s) => !s.remake);
  if (firsts.length !== record.stills.length) fail(2, `${file} already holds ${firsts.length} first takes, the plan ${record.stills.length} shots; ${no}`);
  record.stills.forEach((s, i) => {
    for (const field of ["n", "key", "picture"]) {
      if (firsts[i][field] !== s[field]) fail(2, `shot ${s.n}: ${file} already holds its still with another ${field} (${JSON.stringify(firsts[i][field])}); ${no}`);
    }
  });
}
// One still's second take, added to the record: the remake rules, for the remake command and a check's rebuild.
export function addRemake(record, n, picture, file, shot = String(n)) {
  const first = record.stills.find((s) => s.n === n && !s.remake);
  if (!first) fail(2, `shot ${shot} is not in ${file}: give the shot number of a still it holds`);
  if (!picture) fail(2, "--picture is the fixed picture for the remake: what its still shows, with what broke a rule taken out");
  if (record.stills.some((s) => s.n === n && s.remake)) fail(2, `shot ${n} has had its remake: never a third take of one shot`);
  if (record.stills.filter((s) => s.remake).length >= REMAKES) fail(2, `two remakes are the most a run makes (the reserve the price held)`);
  const again = { n, key: `${first.key}-2`, picture, remake: true };
  record.stills.push(again);
  return again;
}
function remake() {
  const film = need("film"), file = need("file"), shot = need("shot"), picture = tidy(args.picture ?? "");
  priced(film);
  if (!existsSync(file)) fail(2, `${file} is missing: run stills first`);
  const record = readRecord(file, "stills", "stills");
  const again = addRemake(record, Number(shot), picture, file, shot);
  writeStills(file, record);
  console.log(`submit_job ${JSON.stringify(stillCall(record, again))}`);
}

// ---------- the clips ----------
const KLING = "fal-ai/kling-video/v3/pro/image-to-video";
const NEGATIVE = "text, letters, words, captions, subtitles, logo, watermark, signage, brand, real person, celebrity, blur, distortion, low quality";
// The clips record from the plan, the storyboard and fal's still URLs (in shot order): what clips prints and writes,
// and what a check rebuilds.
export function buildClips(film, board, stem, urls) {
  if (!STEM.test(stem)) fail(2, "--stem is the run's key stem from media/run-keys.json: 8 lowercase letters and digits");
  const shots = readPlan(film).cut.shots;
  // A shot's motion is what follows its line's last "| motion:".
  const { lines } = shotLines(board, shots);
  if (urls.length !== shots.length) fail(2, `--stills holds ${urls.length} URLs, the plan ${shots.length} shots: each shot's still URL, in shot order`);
  const clips = shots.map((s, i) => {
    const at = lines[i].lastIndexOf("| motion:");
    const motion = at < 0 ? "" : tidy(lines[i].slice(at + "| motion:".length));
    if (!motion) fail(2, `shot ${s.n}: its storyboard line has no motion (\`| motion: <the camera or subject move>\` at its end)`);
    if (!/^https:\/\/\S+$/.test(urls[i])) fail(2, `shot ${s.n}: its still URL ${urls[i] || "(empty)"} is not an https URL: give fal's URL for its still, as fal answered it`);
    return { n: s.n, key: `mu-${stem}-clip-${s.n}`, duration: String(s.clip_seconds), prompt: `${motion}, the scene as it is`, start_image_url: urls[i] };
  });
  return { endpoint_id: KLING, every_clip: { generate_audio: false, negative_prompt: NEGATIVE }, clips };
}
const clipCall = (record, c) => ({ endpoint_id: record.endpoint_id, submission_key: c.key, input: { prompt: c.prompt, start_image_url: c.start_image_url, duration: c.duration, ...record.every_clip } });
function clips() {
  const film = need("film"), board = need("storyboard"), file = need("file"), stem = need("stem");
  priced(film);
  const record = buildClips(film, board, stem, need("stills").split(",").map((u) => u.trim()));
  // Run again on a resumed run: the record the clips were sent with is kept when it is the same, never replaced.
  if (existsSync(file)) {
    const kept = readRecord(file, "clips", "clips");
    const no = `${never("clips")}: the clips are sent as recorded`;
    for (const field of ["endpoint_id", "every_clip"]) {
      if (JSON.stringify(kept[field]) !== JSON.stringify(record[field])) fail(2, `${file} already holds the clips with another ${field} (${JSON.stringify(kept[field])}); ${no}`);
    }
    if (kept.clips.length !== record.clips.length) fail(2, `${file} already holds ${kept.clips.length} clips, the plan ${record.clips.length} shots; ${no}`);
    record.clips.forEach((c, i) => {
      for (const field of ["n", "key", "duration", "prompt", "start_image_url"]) {
        if (kept.clips[i][field] !== c[field]) fail(2, `shot ${c.n}: ${file} already holds its clip with another ${field} (${JSON.stringify(kept.clips[i][field])}); ${no}`);
      }
    });
  } else {
    writeFileSync(file, `{"endpoint_id": ${JSON.stringify(record.endpoint_id)},\n "every_clip": ${JSON.stringify(record.every_clip)},\n "clips": [\n${record.clips.map((c) => `  ${JSON.stringify(c)}`).join(",\n")}\n]}\n`);
  }
  for (const c of record.clips) console.log(`submit_job ${JSON.stringify(clipCall(record, c))}`);
}

// ---------- the cost ----------
// The steps the records hold, by step (still-<n>, still-<n>-2, clip-<n>): the key each was built with, and its file.
function recordedSteps(stem) {
  const out = new Map();
  for (const [file, list, command] of [["media/stills.json", "stills", "stills"], ["media/clips.json", "clips", "clips"]]) {
    if (!existsSync(file)) continue;
    const record = readRecord(file, list, command);
    for (const item of record[list]) {
      const m = typeof item.key === "string" ? item.key.match(/^mu-([a-z0-9]{8})-(.+)$/) : null;
      if (!m || (stem !== null && m[1] !== stem)) fail(2, `${file} holds the key ${JSON.stringify(item.key)}, not a key of this run (mu-${stem ?? "<stem>"}-<step>): run cost with the run's --stem`);
      out.set(m[2], { key: item.key, file });
    }
  }
  return out;
}
function cost() {
  const film = need("film");
  const pricePath = join(film, "price.json");
  if (!existsSync(pricePath)) fail(2, `${pricePath} is missing: run price first`);
  const p = JSON.parse(readFileSync(pricePath, "utf8"));
  const list = (k) => (args[k] && args[k] !== "true" ? args[k].split(",").map((s) => s.trim()).filter(Boolean) : []);
  const sent = list("sent"), failed = new Set(list("failed")), pending = new Set(list("pending"));
  const stem = args.stem === undefined ? null : args.stem;
  if (stem !== null && !/^[a-z0-9]{8}$/.test(stem)) fail(2, "--stem is the run's key stem from media/run-keys.json: 8 lowercase letters and digits");
  for (const f of failed) if (!sent.includes(f)) fail(2, `--failed names ${f}, which --sent doesn't`);
  for (const f of pending) if (!sent.includes(f)) fail(2, `--pending names ${f}, which --sent doesn't`);
  for (const f of pending) if (failed.has(f)) fail(2, `${f} is in both --failed and --pending: a job fal failed or refused is --failed; one with no answer yet is --pending`);
  // Every still and clip the kit built is in its record, and each was sent once: --sent names each exactly once, and
  // names no still or clip the records don't hold (isolate and transcript the run sends itself).
  const keyOf = (step) => (stem ? `mu-${stem}-${step}` : step);
  const recorded = recordedSteps(stem);
  const times = new Map();
  for (const step of sent) times.set(step, (times.get(step) ?? 0) + 1);
  for (const [step, n] of times) if (n > 1) fail(2, `--sent names ${keyOf(step)} ${n} times: each step sent is in --sent once`);
  for (const step of times.keys()) if (!recorded.has(step) && !["isolate", "transcript"].includes(step)) fail(2, `--sent names ${keyOf(step)}, which neither media/stills.json nor media/clips.json records: --sent holds the stills and clips the kit built, as their records hold them`);
  for (const [step, { key, file }] of recorded) if (!times.has(step)) fail(2, `--sent leaves out ${key}, which ${file} records: every still and clip the kit built was sent, so each is in --sent once (in --failed too when fal failed or refused it)`);
  const steps = sent.map((step) => {
    const remake = step.match(/^still-(\d+)-2$/);
    const line = p.lines.find((l) => l.step === step && !l.reserve) ?? (remake ? p.lines.find((l) => l.step === `still-${remake[1]}`) : undefined);
    if (!line) fail(2, `--sent names ${step}, which the plan has no line for (its steps: isolate, transcript, still-<n>, still-<n>-2, clip-<n>)`);
    return { step, key: stem ? `mu-${stem}-${step}` : null, endpoint_id: line.endpoint_id, units: line.units, unit: line.unit, rate_usd: line.rate_usd, usd: failed.has(step) ? 0 : line.usd, pending: pending.has(step) };
  });
  const remakes = sent.filter((s) => /^still-\d+-2$/.test(s)).length;
  if (remakes > RESERVE) fail(2, `--sent holds ${remakes} remade stills: at most ${RESERVE}`);
  const total = usd(steps.reduce((t, s) => t + s.usd, 0));
  writeFileSync(join(film, "cost.json"), JSON.stringify({ steps, total }, null, 1) + "\n");
  console.log(`answer fields (copy each into the answer exactly as printed): ${JSON.stringify({ fal_cost_usd: { steps, total } })}`);
}

if (!MAIN);
else if (command === "plan") plan();
else if (command === "price") price();
else if (command === "lyrics") lyrics();
else if (command === "place") place();
else if (command === "stem") stem();
else if (command === "stills") stills();
else if (command === "remake") remake();
else if (command === "clips") clips();
else if (command === "cost") cost();
else fail(2, "usage: node beats.mjs plan|price|lyrics|place|stem|stills|remake|clips|cost ... (the header of this file says each)");
