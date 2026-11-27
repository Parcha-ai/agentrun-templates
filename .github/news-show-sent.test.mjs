// news-show's sent check (.github/eval-checks/news-show-sent.mjs): what a news-show eval run wrote and read, against
// what fal answered it. A grader reads a run's calls cut to fit its prompt, and the cut takes fal's answers (each job's
// handles) and long writes' contents, so a rubric condition that compares a read to an answer, or says what no write
// holds, fails on content it never saw. These tests build small runs as the template makes them on each case's fake,
// from the case's own fixture in this repo, then change one thing and expect the check to name it.
// Node only; no model, no fal.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRoot } from "./temp-root.mjs";

const CHECK = new URL("./eval-checks/news-show-sent.mjs", import.meta.url).pathname;
const EVALS = new URL("../templates/news-show/evals/", import.meta.url).pathname;
const LABEL = " (repo check; serve's grade is separate; stopgap for agentrun #3824)";
const root = tempRoot("ns-sent-");

const VOICE = "fal-ai/elevenlabs/tts/eleven-v3";
const STILL = "fal-ai/nano-banana-pro";
const FABRIC = "veed/fabric-1.0";
const SEGMENTS = ["cold-open", "headlines", "lead-a", "story-a", "lead-b", "story-b", "lead-c", "story-c", "closing"];
const ANCHORED = ["cold-open", "lead-a", "lead-b", "lead-c", "closing"];
const STEM = "abcd1234";
const K = (step) => `ns-${STEM}-${step}`;
const CHUNKS = [{ characters: ["H", "i"], character_start_times_seconds: [0, 0.1], character_end_times_seconds: [0.1, 0.2] }];

const fixture = (name) => JSON.parse(readFileSync(join(EVALS, name, "fixtures", "fal-mcp.json"), "utf8")).tools;
// The handles the case's fake answers a tool for a step's key with.
function answered(name, tool, endpoint, step) {
  const a = fixture(name)[tool].answers.find((x) => [x.when].flat().some((w) => (!w.endpoint_id || w.endpoint_id === endpoint) && w.submission_key && new RegExp(`^(?:${w.submission_key.$pattern})$`).test(K(step))));
  const j = JSON.parse(a.result.content[0].text);
  return { endpoint_id: j.endpoint_id ?? endpoint, request_id: j.request_id, status_url: j.status_url, response_url: j.response_url };
}

// A run as the template makes it on a case's fake: the calls it makes (calls, the fal ones mirrored in mcp_calls as
// the fake got them), and its work folder's film/captions-source.json. `change` edits them before they are written.
// A live run (live-language-releases) has no fake: its fal calls are in calls with fal's answers as their results, and
// each completed request is filed at evidence/fal/<request_id>.json.
let made = 0;
function nsRun(name = "show-from-feed", change = () => {}) {
  const live = name === "live-language-releases";
  const ownStill = name === "owner-anchor-processing";
  const lost = name === "lost-reply-same-key";
  const liveId = (step) => `${String(SEGMENTS.indexOf(step.replace(/^voice-|^anchor-/, "")) + 1).padStart(8, "0")}-0000-4000-8000-${step.startsWith("voice") ? "00000000000a" : "00000000000b"}`;
  const handlesOf = (tool, endpoint, step) => {
    if (!live) return answered(name, tool, endpoint, step);
    const app = endpoint.split("/").slice(0, 2).join("/");
    const id = liveId(step);
    return { endpoint_id: endpoint, request_id: id, status_url: `https://queue.fal.run/${app}/requests/${id}/status`, response_url: `https://queue.fal.run/${app}/requests/${id}` };
  };
  const calls = [];
  const call = (tool, args, result) => calls.push({ tool, arguments: args, status: "success", ...(result === undefined ? {} : { result }) });
  call("write", { path: "film/STORYBOARD.md", content: "# The Daily Desk\n" });
  call("write", { path: "media/run-keys.json", content: JSON.stringify({ stem: STEM }) });
  call("mcp:fal/get_pricing", { endpoint_ids: [STILL, VOICE, FABRIC] });
  const submit = (endpoint, step, input) => {
    const lostOne = lost && step === "voice-lead-b";
    const h = lostOne ? undefined : handlesOf("submit_job", endpoint, step);
    call("mcp:fal/submit_job", { endpoint_id: endpoint, submission_key: K(step), input }, live ? JSON.stringify({ status: "IN_QUEUE", ...h }) : lostOne ? "timeout: no reply from fal within 60 s." : undefined);
    return lostOne ? undefined : h;
  };
  const voices = SEGMENTS.map((s) => [s, submit(VOICE, `voice-${s}`, { text: `The ${s} script.`, voice: "Aria", timestamps: true })]);
  if (lost) {
    const h = answered(name, "get_submission", VOICE, "voice-lead-b");
    call("mcp:fal/get_submission", { submission_key: K("voice-lead-b") });
    voices[4][1] = h;
  }
  const first = voices.map(([, h]) => h);
  if (!ownStill) first.push(submit(STILL, "anchor-image", { prompt: "A fictional anchor.", aspect_ratio: "16:9" }));
  call("mcp:fal/wait_for_jobs", { jobs: first.map((h, index) => ({ index, ...h })) });
  for (const [s] of voices) call("web_save", { url: `https://v3.fal.media/files/zebra/${s}.mp3`, path: `media/voice-${s}.mp3` });
  const clips = ANCHORED.map((s) => submit(FABRIC, `anchor-${s}`, { image_url: "https://example.test/anchor.png", audio_url: `https://v3.fal.media/files/zebra/${s}.mp3`, resolution: "480p" }));
  call("mcp:fal/wait_for_jobs", { jobs: clips.map((h, index) => ({ index, ...h })) });
  if (ownStill) call("mcp:fal/wait_for_jobs", { jobs: [{ index: 3, ...clips[3] }] });
  call("write", { path: "film/show.json", content: JSON.stringify({ segments: SEGMENTS.map((s, i) => ({ name: s, timestamps: `evidence/fal/${first[i].request_id}.json` })) }) });
  call("bash", { command: "node film/build-show.mjs --show film/show.json --film film --vtt media/show.vtt" });
  const source = Object.fromEntries(voices.map(([s, h]) => [s, { method: "anchored", request_id: h.request_id }]));
  const run = { calls, source, filed: live ? first.map((h) => h.request_id) : [] };
  change(run);
  const work = join(root, `run-${++made}`);
  mkdirSync(join(work, "film"), { recursive: true });
  mkdirSync(join(work, "evidence", "fal"), { recursive: true });
  if (run.source !== undefined) writeFileSync(join(work, "film", "captions-source.json"), typeof run.source === "string" ? run.source : JSON.stringify(run.source));
  for (const id of run.filed) writeFileSync(join(work, "evidence", "fal", `${id}.json`), "{}");
  const mcp = live ? undefined : run.calls.filter((c) => c.tool.startsWith("mcp:fal/")).map(({ tool, arguments: a }) => ({ tool, arguments: a }));
  const report = { package: { name: "news-show" }, cases: [{ name, runs: [{ calls: run.calls, ...(mcp ? { mcp_calls: mcp } : {}) }] }] };
  const path = join(work, "report.json");
  writeFileSync(path, JSON.stringify(report));
  return { path, work };
}
function check({ path, work }) {
  const r = spawnSync(process.execPath, [CHECK, path, work], { encoding: "utf8" });
  return { status: r.status, line: r.stdout.trim().split("\n").pop() ?? "", err: r.stderr };
}
const fal = (run, tool) => run.calls.filter((c) => c.tool === `mcp:fal/${tool}`);
const passes = (r) => {
  assert.equal(r.status, 0, `${r.line}\n${r.err}`);
  assert.match(r.line, new RegExp(`^SENT PASS n=\\d+${LABEL.replace(/[()#]/g, "\\$&")}$`));
};
const fails = (r, what) => {
  assert.equal(r.status, 1, `${r.line}\n${r.err}`);
  assert.ok(r.line.startsWith("SENT FAIL "), r.line);
  assert.ok(r.line.includes(what), `${r.line}\nexpected: ${what}`);
};

test("a clean run passes in each case", () => {
  for (const name of ["show-from-feed", "owner-anchor-processing", "lost-reply-same-key", "live-language-releases"]) passes(check(nsRun(name)));
});

test("a write that holds fal's timestamp chunks fails", () => {
  fails(check(nsRun("show-from-feed", (run) => run.calls.push({ tool: "write", arguments: { path: "work/notes.json", content: JSON.stringify(CHUNKS) } }))), `writes: the write of "work/notes.json" holds fal's timestamp chunks`);
  fails(check(nsRun("live-language-releases", (run) => run.calls.push({ tool: "edit", arguments: { path: "film/show.json", edits: [{ oldText: "x", newText: JSON.stringify(CHUNKS) }] } }))), `writes: the edit of "film/show.json" holds fal's timestamp chunks`);
});

test("a write to a timestamps file fails, whatever it holds", () => {
  fails(check(nsRun("owner-anchor-processing", (run) => run.calls.push({ tool: "write", arguments: { path: "media/voice-lead-a-timestamps.json", content: "[]" } }))), "writes: a write names media/voice-lead-a-timestamps.json, a timestamps file");
});

test("a write or edit of film/captions-source.json fails", () => {
  fails(check(nsRun("show-from-feed", (run) => run.calls.push({ tool: "edit", arguments: { path: "film/captions-source.json", oldText: "a", newText: "b" } }))), "writes: a edit touches film/captions-source.json (only the build writes it)");
  fails(check(nsRun("lost-reply-same-key", (run) => run.calls.push({ tool: "write", arguments: { path: "/workspace/film/captions-source.json", content: "{}" } }))), "writes: a write touches /workspace/film/captions-source.json");
});

test("a retyped handle fails", () => {
  fails(check(nsRun("show-from-feed", (run) => {
    const item = fal(run, "wait_for_jobs")[0].arguments.jobs[2];
    item.status_url = item.status_url.replace("elevenlabs/requests", "elevenlabs/tts/eleven-v3/requests");
  })), `read: a wait_for_jobs reads ${K("voice-lead-a")} with its status_url`);
  fails(check(nsRun("owner-anchor-processing", (run) => {
    const item = fal(run, "wait_for_jobs")[2].arguments.jobs[0];
    item.request_id = `${item.request_id.slice(0, -1)}0`;
  })), `read: a wait_for_jobs reads ${K("anchor-lead-c")} with request_id`);
  fails(check(nsRun("lost-reply-same-key", (run) => {
    const item = fal(run, "wait_for_jobs")[0].arguments.jobs[4];
    item.response_url = `${item.response_url}/`;
  })), `read: a wait_for_jobs reads ${K("voice-lead-b")} with its response_url`);
});

test("a read that leaves out a URL it was not given passes where the rubric said when given", () => {
  passes(check(nsRun("owner-anchor-processing", (run) => {
    const item = fal(run, "wait_for_jobs")[2].arguments.jobs[0];
    delete item.status_url;
    delete item.response_url;
  })));
});

test("a resubmit of a job fal holds fails", () => {
  fails(check(nsRun("show-from-feed", (run) => {
    const again = structuredClone(fal(run, "submit_job")[12]);
    run.calls.splice(run.calls.indexOf(fal(run, "wait_for_jobs")[1]), 0, again);
  })), `read: ${K("anchor-lead-b")} was sent again after fal held its job`);
  // After the lost reply, fal holds lead-b's job even before the run looks it up.
  fails(check(nsRun("lost-reply-same-key", (run) => {
    const lookup = fal(run, "get_submission")[0];
    run.calls[run.calls.indexOf(lookup)] = structuredClone(fal(run, "submit_job")[4]);
  })), `read: ${K("voice-lead-b")} was sent again after fal held its job`);
});

test("a wrong request_id in film/captions-source.json fails", () => {
  fails(check(nsRun("show-from-feed", (run) => {
    run.source["story-b"].request_id = run.source["story-c"].request_id;
  })), "captions: film/captions-source.json gives story-b request_id");
  fails(check(nsRun("live-language-releases", (run) => {
    run.source.headlines.request_id = "bare list";
  })), 'captions: film/captions-source.json gives headlines request_id "bare list"');
  fails(check(nsRun("lost-reply-same-key", (run) => {
    delete run.source.closing;
  })), "captions: film/captions-source.json has no closing");
  fails(check(nsRun("owner-anchor-processing", (run) => {
    run.source = undefined;
  })), "captions: the run left no film/captions-source.json");
});

test("a live voice that never completed fails its captions", () => {
  fails(check(nsRun("live-language-releases", (run) => {
    run.filed = run.filed.slice(1);
  })), "captions: cold-open's request");
});

test("show-from-feed: the ten are the voices in segment order then the still, with no other call between", () => {
  fails(check(nsRun("show-from-feed", (run) => {
    const subs = fal(run, "submit_job");
    const a = run.calls.indexOf(subs[1]);
    const b = run.calls.indexOf(subs[2]);
    [run.calls[a], run.calls[b]] = [run.calls[b], run.calls[a]];
  })), "grouped read: the first ten submit_jobs are not the nine voices in segment order then the still: submit_job 2");
  fails(check(nsRun("show-from-feed", (run) => {
    run.calls.splice(run.calls.indexOf(fal(run, "submit_job")[5]), 0, { tool: "web_fetch", arguments: { url: "https://transitwire.example/feed.xml" } });
  })), "grouped read: a web_fetch call comes between the ten submit_jobs");
  // The server's spend meter: a single-endpoint get_pricing just before an endpoint's first submit_job.
  passes(check(nsRun("show-from-feed", (run) => {
    run.calls.splice(run.calls.indexOf(fal(run, "submit_job")[9]), 0, { tool: "mcp:fal/get_pricing", arguments: { endpoint_id: STILL } });
  })));
});

test("show-from-feed: one wait_for_jobs reads the ten at their own indexes", () => {
  fails(check(nsRun("show-from-feed", (run) => {
    const jobs = fal(run, "wait_for_jobs")[0].arguments.jobs;
    [jobs[1], jobs[2]] = [{ ...jobs[2], index: 1 }, { ...jobs[1], index: 2 }];
  })), "grouped read: the wait_for_jobs after the ten lists, at position 2, request_id");
  fails(check(nsRun("show-from-feed", (run) => {
    const read = fal(run, "wait_for_jobs")[0];
    run.calls.splice(run.calls.indexOf(read) + 1, 0, structuredClone(read));
  })), "grouped read: 2 wait_for_jobs calls read the voices and the still; one does");
});

test("a case the check holds nothing for, or a report it can't place, is a VOID", () => {
  const { path, work } = nsRun("show-from-feed");
  const report = JSON.parse(readFileSync(path, "utf8"));
  report.cases[0].name = "budget-closing-first";
  writeFileSync(path, JSON.stringify(report));
  const r = check({ path, work });
  assert.equal(r.status, 2, r.line);
  assert.match(r.line, /^SENT VOID the check holds nothing for case budget-closing-first/);
  const missing = check({ path: join(root, "no-such-report.json"), work });
  assert.equal(missing.status, 2, missing.line);
});
