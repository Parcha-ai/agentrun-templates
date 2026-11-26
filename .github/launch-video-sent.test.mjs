// launch-video's sent check (.github/eval-checks/launch-video-sent.mjs): what a launch-video eval run sent, against what
// the case's fake fal answered it. A grader reads a run's calls cut to fit its prompt, and on a big run the cut takes
// fal's answers (each job's handles, the URLs it made) and the run's files, so a rubric condition that compares a call
// to an answer fails on content it never saw. These tests build runs as the template makes them on each case's fake,
// from the case's own fixture in this repo, then change one thing and expect the check to name it.
// Node only; no model, no fal.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRoot } from "./temp-root.mjs";

const CHECK = new URL("./eval-checks/launch-video-sent.mjs", import.meta.url).pathname;
const EVALS = new URL("../templates/launch-video/evals/", import.meta.url).pathname;
const LABEL = " (repo check; serve's grade is separate; stopgap for agentrun #3824)";
const root = tempRoot("lv-sent-");

const KLING = "fal-ai/kling-video/v2.5-turbo/pro/text-to-video";
const HAILUO = "fal-ai/minimax/hailuo-02/standard/text-to-video";
const VOICE = "fal-ai/elevenlabs/tts/eleven-v3";
const MUSIC = "fal-ai/elevenlabs/music";
const COMPOSE = "fal-ai/ffmpeg-api/compose";
// What the fakes make, as the cases' rubrics name it.
const CLIP_URL = (n) => `https://v3.fal.media/files/koala/clip${n}Rk2mVn4pLr7TzH_output.mp4`;
const VO_1 = "https://v3.fal.media/files/zebra/Vo9Lp3Ok9Ij7Uh5Yg1Tf_output.mp3";
const VO_2 = "https://v3.fal.media/files/zebra/Vt2Xc6Bn8Mq4Wr1Ez5Ka_output.mp3";
const MUSIC_URL = "https://v3.fal.media/files/panda/Mb4Qw8Er1Ty4Ui6Hc7Vb_music.mp3";
const CUT_URL = "https://v3.fal.media/files/lion/Ct5Nm2Bv8Cx1Za4Sd7Fg_composed.mp4";
const COMPOSE_REQUEST = "4a3b2c1d-0e9f-48a7-b6c5-d4e3f2a1b0c9";
// The captions' anchors, 0.5 s plus the first letter's start and the last letter's end in each voiceover's timestamps
// (hailuo's rubric: 0.56 and 27.68; the re-voice's last letter ends at 25.363).
const ANCHORS = { [VO_1]: [0.56, 27.681], [VO_2]: [0.56, 25.863], 45: [0.56, 41.483] };
const STEM = "abcd1234";
const K = (step) => `lv-${STEM}-${step}`;
const SCRIPT = "[calm] Kestrel Field Notes is a notebook app for people who work outdoors. Notes, sketches and photos work with no signal and sync on their own when you are back in range. Photos are tagged with location and time and pinned on a map of the site. A day's notes export to CSV or PDF in two taps. Kestrel Field Notes is available for iOS and Android.";
// The re-voice: 51 of the first script's 66 words.
const SCRIPT_2 = "[calm] Kestrel Field Notes is a notebook app for people who work outdoors. Notes, sketches and photos work with no signal and sync on their own when you are back in range. A day's notes export to CSV or PDF in two taps. Kestrel Field Notes is available for iOS and Android.";
const words = (s) => s.replace(/\[[^\]]*\]/g, " ").split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w));

const fixture = (name) => JSON.parse(readFileSync(join(EVALS, name, "fixtures", "fal-mcp.json"), "utf8")).tools;
// The handles the case's fake answers a submit_job (or get_submission) for a step's key with.
function answered(name, tool, endpoint, step) {
  const a = fixture(name)[tool].answers.find((x) => [x.when].flat().some((w) => (!w.endpoint_id || w.endpoint_id === endpoint) && new RegExp(`^(?:${w.submission_key.$pattern})$`).test(K(step))));
  const j = JSON.parse(a.result.content[0].text);
  return { endpoint_id: j.endpoint_id ?? endpoint, request_id: j.request_id, status_url: j.status_url, response_url: j.response_url };
}

// A case's captions, back to back between the anchors, each sentence its share of the words.
function vttOf(script, [a, b]) {
  const sentences = script.replace(/\[[^\]]*\]\s*/g, "").match(/[^.]+\./g).map((s) => s.trim());
  const total = words(script).length;
  const t = (s) => new Date(Math.round(s * 1000)).toISOString().slice(11, 23);
  let at = a;
  let said = 0;
  const cues = sentences.map((s) => {
    said += words(s).length;
    const end = a + (said / total) * (b - a);
    const cue = `${t(at)} --> ${t(end)}\n${s}`;
    at = end;
    return cue;
  });
  return `WEBVTT\n\n${cues.join("\n\n")}\n`;
}

// A run as the template makes it on a case's fake: the calls it sends (mcp_calls), its web_saves (calls), its
// media/run-keys.json and media/launch.vtt. `change` edits any of them before they are written.
const CASES = {
  "launch-from-page": { clips: 6, endpoint: KLING, ms: 5000, length: 30 },
  "hailuo-compose-processing": { clips: 5, endpoint: HAILUO, ms: 6000, length: 30, processing: true },
  "injection-on-page": { clips: 9, endpoint: KLING, ms: 5000, length: 45 },
  "music-refused": { clips: 6, endpoint: KLING, ms: 5000, length: 30, noMusic: true },
  "voiceover-overrun": { clips: 6, endpoint: KLING, ms: 5000, length: 30, revoice: true },
  "lost-reply-same-key": { clips: 6, endpoint: KLING, ms: 5000, length: 30, lostReply: true },
};
let made = 0;
function lvRun(name = "launch-from-page", change = () => {}) {
  const c = CASES[name];
  const L = c.length * 1000;
  const mcp = [{ tool: "mcp:fal/get_pricing", arguments: { endpoint_ids: [c.endpoint, VOICE, MUSIC, COMPOSE] } }];
  const submit = (endpoint, step, input) => mcp.push({ tool: "mcp:fal/submit_job", arguments: { endpoint_id: endpoint, submission_key: K(step), input } });
  const job = (index, endpoint, step, tool = "submit_job") => ({ index, ...answered(name, tool, endpoint, step) });
  for (let n = 1; n <= c.clips; n++) submit(c.endpoint, `clip-${n}`, { prompt: `A mossy rock at dawn, shot ${n}, slow push-in, calm, cinematic, 16:9.`, duration: String(c.ms / 1000) });
  const voice = { voice: "Sarah", stability: 0.65, output_format: "mp3_44100_128", timestamps: true };
  submit(VOICE, "voiceover", { text: SCRIPT, ...voice });
  submit(MUSIC, "music", { prompt: "Sparse calm ambient bed, 70 BPM, no vocals.", music_length_ms: L, force_instrumental: true });
  const clipJobs = Array.from({ length: c.clips }, (_, i) => job(i, c.endpoint, `clip-${i + 1}`));
  if (c.lostReply) {
    mcp.push({ tool: "mcp:fal/get_submission", arguments: { submission_key: K("voiceover") } });
    mcp.push({ tool: "mcp:fal/wait_for_jobs", arguments: { jobs: [...clipJobs, job(c.clips, VOICE, "voiceover", "get_submission"), job(c.clips + 1, MUSIC, "music")] } });
  } else mcp.push({ tool: "mcp:fal/wait_for_jobs", arguments: { jobs: [...clipJobs, job(c.clips, VOICE, "voiceover"), job(c.clips + 1, MUSIC, "music")] } });
  let vo = VO_1;
  let script = SCRIPT;
  if (c.revoice) {
    submit(VOICE, "voiceover-2", { text: SCRIPT_2, ...voice });
    mcp.push({ tool: "mcp:fal/wait_for_jobs", arguments: { jobs: [job(0, VOICE, "voiceover-2")] } });
    vo = VO_2;
    script = SCRIPT_2;
  }
  const tracks = [
    { id: "broll", type: "video", keyframes: Array.from({ length: c.clips }, (_, i) => ({ url: CLIP_URL(i + 1), timestamp: i * c.ms, duration: c.ms })) },
    { id: "voiceover", type: "audio", keyframes: [{ url: vo, timestamp: 500, duration: L - 1000 }] },
  ];
  if (!c.noMusic) tracks.push({ id: "music", type: "audio", keyframes: [{ url: MUSIC_URL, timestamp: 0, duration: L }] });
  mcp.push({ tool: "mcp:fal/run_model", arguments: { endpoint_id: COMPOSE, submission_key: K("cut"), input: { tracks } } });
  if (c.processing) {
    const h = JSON.parse(fixture(name).run_model.answers[0].result.content[0].text);
    mcp.push({ tool: "mcp:fal/wait_for_jobs", arguments: { jobs: [{ index: 0, endpoint_id: COMPOSE, request_id: h.request_id, status_url: h.status_url, response_url: h.response_url }] } });
  }
  const saves = [
    ...Array.from({ length: c.clips }, (_, i) => ({ url: CLIP_URL(i + 1), path: `media/clip-${i + 1}.mp4` })),
    { url: VO_1, path: "media/voiceover.mp3" },
    ...(c.revoice ? [{ url: VO_2, path: "media/voiceover-2.mp3" }] : []),
    ...(c.noMusic ? [] : [{ url: MUSIC_URL, path: "media/music.mp3" }]),
    { url: CUT_URL, path: "media/launch.mp4" },
  ];
  const run = {
    mcp,
    saves,
    keys: { stem: STEM },
    vtt: vttOf(script, c.length === 45 ? ANCHORS[45] : ANCHORS[vo]),
  };
  change(run);
  const dir = join(root, `run-${++made}`);
  mkdirSync(join(dir, "media"), { recursive: true });
  if (run.keys !== null) writeFileSync(join(dir, "media", "run-keys.json"), JSON.stringify(run.keys));
  if (run.vtt !== null) writeFileSync(join(dir, "media", "launch.vtt"), run.vtt);
  const calls = run.saves.map((a) => ({ tool: "web_save", name: "web_save", arguments: a, status: "success" }));
  return { dir, name, run: { run: 1, agent_id: "01aa-agent", run_id: `01aa-run-${made}`, mcp_calls: run.mcp, calls } };
}
function reportOf(dir, name, runs, extra = {}) {
  const path = join(dir, "report.json");
  writeFileSync(path, JSON.stringify({ package: { name: "launch-video" }, ...extra, cases: [{ name, runs }] }));
  return path;
}
// Every verdict line ends with the label that says it is the repo's check; the tests match what comes before it.
function check(...args) {
  const r = spawnSync(process.execPath, [CHECK, ...args], { encoding: "utf8" });
  if (r.status !== 2) assert.ok(r.stdout.endsWith(`${LABEL}\n`), `no label: ${r.stdout}${r.stderr}`);
  return { ...r, stdout: r.stdout.replace(LABEL, "") };
}
function verdict(name, change) {
  const { dir, run } = lvRun(name, change);
  return check(reportOf(dir, name, [run]), dir);
}
const fails = (r, what) => {
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.ok(r.stdout.startsWith("SENT FAIL "), r.stdout);
  assert.ok(r.stdout.includes(what), `${r.stdout} does not name: ${what}`);
};
const reads = (run) => run.mcp.filter((c) => c.tool === "mcp:fal/wait_for_jobs");
const cutOf = (run) => run.mcp.find((c) => c.tool === "mcp:fal/run_model").arguments.input.tracks;

for (const name of Object.keys(CASES)) {
  test(`the sent check passes ${name} made as the template makes it on that case's fake`, () => {
    const { dir, run } = lvRun(name);
    const r = check(reportOf(dir, name, [run]), dir);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.equal(r.stdout, `SENT PASS n=${run.mcp_calls.length}\n`);
  });
}

// ---------- the reads ----------
test("a read that gives a clip another job's status_url fails, naming the clip and the field", () => {
  fails(verdict("launch-from-page", (run) => (reads(run)[0].arguments.jobs[2].status_url = reads(run)[0].arguments.jobs[3].status_url)), `read: a wait_for_jobs reads ${K("clip-3")} with its status_url "${answered("launch-from-page", "submit_job", KLING, "clip-4").status_url}", not "${answered("launch-from-page", "submit_job", KLING, "clip-3").status_url}" as its submit_job answered`);
});
test("a read whose response_url is cut short fails, naming the job and the field", () => {
  fails(verdict("launch-from-page", (run) => (reads(run)[0].arguments.jobs[6].response_url = reads(run)[0].arguments.jobs[6].response_url.slice(0, -6))), `read: a wait_for_jobs reads ${K("voiceover")} with its response_url`);
});
test("a read that leaves out a queued job fails, naming it", () => {
  fails(verdict("launch-from-page", (run) => reads(run)[0].arguments.jobs.pop()), `read: the first wait_for_jobs leaves out ${K("music")} (request 9e8d7c6b-5a49-4382-a716-f5e4d3c2b1a0), queued before it`);
});
test("a read of a request the fake never answered fails", () => {
  fails(verdict("launch-from-page", (run) => reads(run)[0].arguments.jobs.push({ index: 8, endpoint_id: KLING, request_id: "00000000-0000-4000-8000-000000000000", status_url: "https://queue.fal.run/x/status", response_url: "https://queue.fal.run/x" })), 'read: a wait_for_jobs lists request "00000000-0000-4000-8000-000000000000", which no submit_job, get_submission or run_model was answered with');
});
test("a read that lists one request under two indexes fails", () => {
  fails(verdict("launch-from-page", (run) => reads(run)[0].arguments.jobs.push({ ...reads(run)[0].arguments.jobs[1], index: 8 })), `read: a wait_for_jobs lists ${K("clip-2")} (request ${answered("launch-from-page", "submit_job", KLING, "clip-2").request_id}) at index 1 and index 8`);
});
test("a key sent twice fails", () => {
  fails(verdict("launch-from-page", (run) => run.mcp.splice(2, 0, structuredClone(run.mcp[1]))), `read: ${K("clip-1")} was sent 2 times`);
});
test("a lost reply read back under another key fails, and so does a read of handles no answer gave the run", () => {
  fails(verdict("lost-reply-same-key", (run) => (run.mcp.find((c) => c.tool === "mcp:fal/get_submission").arguments.submission_key = `${K("voiceover")}-b`)), `read: get_submission asks for "${K("voiceover")}-b", which no submit_job sent before it`);
  fails(verdict("lost-reply-same-key", (run) => run.mcp.splice(run.mcp.findIndex((c) => c.tool === "mcp:fal/get_submission"), 1)), 'read: a wait_for_jobs lists request "2d4f6a8c-0e1f-4a3b-8c5d-7e9f0a1b2c3d", which no submit_job, get_submission or run_model was answered with');
});
test("a lost reply found by get_submission and never read fails", () => {
  fails(verdict("lost-reply-same-key", (run) => reads(run)[0].arguments.jobs.splice(6, 1)), `read: get_submission found ${K("voiceover")} (request 2d4f6a8c-0e1f-4a3b-8c5d-7e9f0a1b2c3d), and no wait_for_jobs after it reads that request`);
});

// ---------- the cut ----------
test("a cut with two clips swapped fails, naming the keyframe and the clip", () => {
  fails(verdict("launch-from-page", (run) => {
    const f = cutOf(run)[0].keyframes;
    [f[1].url, f[2].url] = [f[2].url, f[1].url];
  }), `cut: the cut's video keyframe 2 has url "${CLIP_URL(3)}", not "${CLIP_URL(2)}" (clip 2, as the fake made it for ${K("clip-2")})`);
});
test("a cut from a saved path, or a clip at the wrong time, fails", () => {
  fails(verdict("launch-from-page", (run) => (cutOf(run)[0].keyframes[0].url = "media/clip-1.mp4")), 'cut: the cut\'s video keyframe 1 has url "media/clip-1.mp4"');
  fails(verdict("hailuo-compose-processing", (run) => (cutOf(run)[0].keyframes[4].timestamp = 25000)), "cut: the cut's video keyframe 5 has timestamp 25000, not 24000 (clip 5)");
  fails(verdict("injection-on-page", (run) => cutOf(run)[0].keyframes.pop()), "cut: the cut's video track has 8 keyframes; the fake made 9 clips");
});
test("a cut with the first voiceover after a re-voice fails, as does a music track the fake refused, or music missing", () => {
  fails(verdict("voiceover-overrun", (run) => (cutOf(run)[1].keyframes[0].url = VO_1)), `cut: 0 audio tracks carry the voiceover (${K("voiceover-2")}) as the fake made it (${VO_2}); one does`);
  fails(verdict("music-refused", (run) => cutOf(run).push({ id: "music", type: "audio", keyframes: [{ url: MUSIC_URL, timestamp: 0, duration: 30000 }] })), `cut: the cut's audio track "music" carries "${MUSIC_URL}", which is not the voiceover (${K("voiceover")}) (the fake refused the music)`);
  fails(verdict("launch-from-page", (run) => cutOf(run).pop()), `cut: 0 audio tracks carry the music (${K("music")})`);
  fails(verdict("launch-from-page", (run) => (cutOf(run)[1].keyframes[0].timestamp = 1500)), `cut: the voiceover (${K("voiceover")})'s keyframe has timestamp 1500 and duration 29000, not timestamp 0 to 1000 and duration at most 30000`);
});
test("a second cut, or compose's processing job never read, fails", () => {
  fails(verdict("launch-from-page", (run) => run.mcp.push(structuredClone(run.mcp.find((c) => c.tool === "mcp:fal/run_model")))), `cut: the run sent 2 run_model calls on ${COMPOSE}; it cuts once`);
  fails(verdict("hailuo-compose-processing", (run) => run.mcp.pop()), `cut: compose answered processing (request ${COMPOSE_REQUEST}), and no wait_for_jobs after it reads that job`);
});

// ---------- the saves ----------
test("a clip saved from another clip's URL, or a cut not saved, fails", () => {
  fails(verdict("launch-from-page", (run) => (run.saves[3].url = CLIP_URL(5))), `save: no web_save saves ${CLIP_URL(4)} to media/clip-4.mp4`);
  fails(verdict("hailuo-compose-processing", (run) => run.saves.pop()), `save: no web_save saves ${CUT_URL} to media/launch.mp4`);
});

// ---------- the re-voice ----------
test("a re-voice sent before the first voiceover was read, too long, or in another voice fails", () => {
  fails(verdict("voiceover-overrun", (run) => {
    const at = run.mcp.findIndex((c) => c.arguments.submission_key === K("voiceover-2"));
    const [revoice] = run.mcp.splice(at, 1);
    run.mcp.splice(run.mcp.findIndex((c) => c.tool === "mcp:fal/wait_for_jobs"), 0, revoice);
    reads(run)[0].arguments.jobs.push({ ...reads(run)[1].arguments.jobs[0], index: 8 });
  }), `re-voice: ${K("voiceover-2")} was sent before any wait_for_jobs read the first voiceover's file_size`);
  const long = words(SCRIPT).slice(0, 58).join(" ");
  fails(verdict("voiceover-overrun", (run) => (run.mcp.find((c) => c.arguments.submission_key === K("voiceover-2")).arguments.input.text = long)), "re-voice: the second script has 58 words; the first has 66: it has fewer, and at most 0.87 × 66 = 57.42");
  fails(verdict("voiceover-overrun", (run) => (run.mcp.find((c) => c.arguments.submission_key === K("voiceover-2")).arguments.input.voice = "Aria")), `re-voice: ${K("voiceover-2")} has voice "Aria", not the first voiceover's "Sarah"`);
});

// ---------- the captions ----------
test("captions that end past the narration, run long, drop a word or aren't VTT fail", () => {
  fails(verdict("hailuo-compose-processing", (run) => (run.vtt = run.vtt.replace("00:00:27.681", "00:00:27.900"))), "captions: the last cue ends at 27.9 s, not 27.681 s (0.5 + the last letter's end in the fake's timestamps), within 0.01 s");
  fails(verdict("hailuo-compose-processing", (run) => (run.vtt = run.vtt.replace(/(\n\n00:00:\d\d\.\d{3} --> )00:00:(\d\d\.\d{3})(\n[^\n]*\n\n)00:00:\d\d\.\d{3}/, (m, a, t, b) => `${a}00:00:${(Number(t) + 0.5).toFixed(3).padStart(6, "0")}${b}00:00:${(Number(t) + 0.5).toFixed(3).padStart(6, "0")}`))), "captions: cue 1 lasts");
  fails(verdict("launch-from-page", (run) => (run.vtt = run.vtt.replace("27.681", "28.200"))), "captions: the last cue ends at 28.2 s, not between 26.5 and 27.9 s");
  fails(verdict("voiceover-overrun", (run) => (run.vtt = run.vtt.replace("25.863", "26.400"))), "captions: the last cue ends at 26.4 s, not between 24.5 and 26.1 s");
  fails(verdict("music-refused", (run) => (run.vtt = run.vtt.replace(" in two taps", " in taps"))), `captions: media/launch.vtt's cue words are not the script's (${K("voiceover")}, audio tags removed): word`);
  fails(verdict("launch-from-page", (run) => (run.vtt = run.vtt.replace("WEBVTT", "WEB VTT"))), "captions: media/launch.vtt does not start with WEBVTT");
  fails(verdict("launch-from-page", (run) => (run.vtt = run.vtt.replace("00:00:00.560", "0:00.560"))), 'captions: media/launch.vtt has a cue time "0:00.560 --> ');
  fails(verdict("launch-from-page", (run) => (run.vtt = null)), "captions: the run left no media/launch.vtt");
});
test("cases whose rubric holds no captions don't read them", () => {
  for (const name of ["injection-on-page", "lost-reply-same-key"]) {
    const r = verdict(name, (run) => (run.vtt = null));
    assert.equal(r.status, 0, r.stdout);
  }
});

// ---------- what it reads ----------
test("a run with no media/run-keys.json fails: its keys can't be tied to a stem", () => {
  fails(verdict("launch-from-page", (run) => (run.keys = null)), "keys: the run left no media/run-keys.json");
});
test("a report of two runs checks each, found in the serve's data folder by their ids, and names the run that fails", () => {
  const good = lvRun("launch-from-page");
  const bad = lvRun("launch-from-page", (run) => (reads(run)[0].arguments.jobs[0].request_id = reads(run)[0].arguments.jobs[1].request_id));
  const data = join(root, `data-${++made}`);
  for (const { dir, run } of [good, bad]) {
    const work = join(data, "disk", "agents", `${run.agent_id}-0123abcd`, "runs", run.run_id, "work");
    mkdirSync(work, { recursive: true });
    for (const f of ["run-keys.json", "launch.vtt"]) {
      mkdirSync(join(work, "media"), { recursive: true });
      writeFileSync(join(work, "media", f), readFileSync(join(dir, "media", f)));
    }
  }
  const report = reportOf(good.dir, "launch-from-page", [good.run, bad.run], { server: { kind: "in_process", data } });
  fails(check(report), `run 2: read: a wait_for_jobs reads ${K("clip-1")} with its request_id`);
  const one = reportOf(bad.dir, "launch-from-page", [good.run], { server: { kind: "in_process", data } });
  assert.equal(check(one).stdout, `SENT PASS n=${good.run.mcp_calls.length}\n`);
  const r = check(report, good.dir);
  assert.equal(r.status, 2);
  assert.match(r.stdout, /^SENT VOID .* is one run's work folder, and the report holds 2 runs: give the serve's data folder\n$/);
});
test("a live case, a case that makes no film and a run with no fake log are VOID", () => {
  const { dir, run } = lvRun("launch-from-page");
  for (const [name, why] of [
    ["live-python-release", "case live-python-release has no fake fal"],
    ["user-ceiling", "case user-ceiling has no tool_used clips grader"],
  ]) {
    const r = check(reportOf(dir, name, [run]), dir);
    assert.equal(r.status, 2, r.stdout);
    assert.ok(r.stdout.startsWith(`SENT VOID ${why}`), r.stdout);
  }
  const r = check(reportOf(dir, "launch-from-page", [{ ...run, mcp_calls: [] }]), dir);
  assert.equal(r.status, 2);
  assert.ok(r.stdout.startsWith("SENT VOID no fake log"), r.stdout);
});
