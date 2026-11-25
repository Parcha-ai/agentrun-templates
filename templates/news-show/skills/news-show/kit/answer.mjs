#!/usr/bin/env node
// answer.mjs: the answer's exact work. `cost` works out fal_cost_usd from the steps sent and get_pricing's rates, so
// no sum is added by hand; `check` reads the answer the run wrote to a file and lists what it is missing before it is
// given. Code does the arithmetic and the structural checks; the run writes the words.
//
//   node .agents/skills/news-show/kit/answer.mjs cost --rates still=0.15,voice=0.1,fabric=0.08 \
//        --sent anchor-image,voice-cold-open,...,voice-closing,anchor-cold-open,...,anchor-closing [--failed anchor-lead-b,...]
//   node .agents/skills/news-show/kit/answer.mjs cost --sent none
//   node .agents/skills/news-show/kit/answer.mjs check media/answer.json
//
// Run from the run's folder. Paths: film/show.json (the scripts as sent), media/voice-<segment>.mp3 (each voice, its
// length read with ffprobe), film/cost.json (written by cost, read by check), media/show.mp4 and media/share-card.png.
//
// cost     one step per paid call sent: anchor-image (1 image at the still's rate), voice-<segment> (the script's
//          characters, tags included, in thousands, at the voice rate) and anchor-<segment> (the segment's voice length
//          rounded up to a whole second, at Fabric's 480p rate). A step in --failed (failed or refused) is listed at 0.
//          Each usd is rounded to 3 decimals, and total is the sum of the listed usd. `--sent none`: no paid call, no
//          steps, total 0. It prints the fal_cost_usd JSON to copy into the answer and writes film/cost.json.
// check    the answer file: valid JSON with the schema's fields; fal_cost_usd exactly as cost printed it; when the show
//          is rendered, report_markdown starts with the show's embed and holds the share card; every story's page is
//          linked in report_markdown; `error`, when set, is quoted in report_markdown word for word; a show that was
//          not rendered remembers none of today's stories. It prints "answer ok" (exit 0) or each problem (exit 1).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const ORDER = ["cold-open", "headlines", "lead-a", "story-a", "lead-b", "story-b", "lead-c", "story-c", "closing"];
const ANCHOR = ["cold-open", "lead-a", "lead-b", "lead-c", "closing"];
const STEPS = ["anchor-image", ...ORDER.map((s) => `voice-${s}`), ...ANCHOR.map((s) => `anchor-${s}`)];
const ENDPOINT = { still: "fal-ai/nano-banana-pro", voice: "fal-ai/elevenlabs/tts/eleven-v3", fabric: "veed/fabric-1.0" };
const REQUIRED = ["status", "show_date", "show_name", "beat", "anchor", "stories", "skipped_repeats", "stories_shown", "segments", "disclosure", "plan", "plans_priced", "captions_timing", "film", "checks", "fal_cost_usd", "files", "failed_step", "error", "ignored_instructions", "notes", "report_markdown"];
const r3 = (n) => Math.round(n * 1000 + 1e-9) / 1000;

const [command, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(rest.reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const fail = (message) => {
  console.error(`answer.mjs: ${message}`);
  process.exit(2);
};
const list = (v) => (v ?? "").split(",").map((x) => x.trim()).filter(Boolean);

function voiceSeconds(segment) {
  const path = `media/voice-${segment}.mp3`;
  if (!existsSync(path)) fail(`${path} is missing: an anchor clip is priced on its voice's length`);
  const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], { encoding: "utf8" });
  const v = Number((p.stdout ?? "").trim());
  if (p.status !== 0 || !Number.isFinite(v) || v <= 0) fail(`ffprobe could not read ${path}: ${(p.stderr ?? "").trim()}`);
  return v;
}

function cost() {
  const sent = list(args.sent);
  if (!sent.length) fail("--sent is required: every paid call sent, by step name, or none");
  const steps = [];
  if (!(sent.length === 1 && sent[0] === "none")) {
    for (const s of sent) if (!STEPS.includes(s)) fail(`--sent: unknown step ${s} (steps: ${STEPS.join(", ")})`);
    const failed = new Set(list(args.failed));
    for (const s of failed) if (!sent.includes(s)) fail(`--failed: ${s} is not in --sent`);
    const rates = Object.fromEntries(list(args.rates).map((kv) => kv.split("=").map((x) => x.trim())));
    const rate = (k) => {
      const v = Number(rates[k]);
      if (!(k in rates) || !Number.isFinite(v) || v < 0) fail(`--rates needs ${k}=<get_pricing's rate> (still per image, voice per 1000 characters, fabric per second at 480p)`);
      return v;
    };
    let show = null;
    const scriptOf = (segment) => {
      if (!show) {
        if (!existsSync("film/show.json")) fail("film/show.json is missing: write it first (its scripts exactly as sent; the build can wait)");
        show = JSON.parse(readFileSync("film/show.json", "utf8"));
      }
      const g = (show.segments ?? []).find((x) => x?.name === segment);
      if (typeof g?.script !== "string" || !g.script) fail(`film/show.json has no script for ${segment}`);
      return g.script;
    };
    for (const step of STEPS.filter((s) => sent.includes(s))) {
      let line;
      if (step === "anchor-image") line = { step, endpoint_id: ENDPOINT.still, units: 1, unit: "images", rate_usd: rate("still") };
      else if (step.startsWith("voice-"))
        line = { step, endpoint_id: ENDPOINT.voice, units: r3([...scriptOf(step.slice(6))].length / 1000), unit: "1000 characters", rate_usd: rate("voice") };
      else line = { step, endpoint_id: ENDPOINT.fabric, units: Math.ceil(voiceSeconds(step.slice(7)) - 1e-6), unit: "seconds", rate_usd: rate("fabric") };
      line.usd = failed.has(step) ? 0 : r3(line.units * line.rate_usd);
      steps.push(line);
    }
  }
  const out = { steps, total: r3(steps.reduce((t, l) => t + l.usd, 0)) };
  mkdirSync("film", { recursive: true });
  writeFileSync("film/cost.json", `${JSON.stringify(out, null, 1)}\n`);
  console.log(JSON.stringify(out));
}

function check() {
  const file = rest.find((a) => !a.startsWith("--"));
  if (!file) fail("usage: answer.mjs check media/answer.json");
  if (!existsSync(file)) fail(`${file} is missing: write the answer's JSON there first`);
  const problems = [];
  let a;
  try {
    a = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.log(`answer: 1 problem\n- ${file} is not valid JSON: ${e.message}`);
    process.exit(1);
  }
  for (const k of REQUIRED) if (!(k in a)) problems.push(`the field ${k} is missing`);
  const report = typeof a.report_markdown === "string" ? a.report_markdown : "";
  if (!report.trim()) problems.push("report_markdown is empty: it is the whole report");
  if (!existsSync("media/report.md")) problems.push("media/report.md is missing: write the whole report there, then put the same text in report_markdown");
  else if (readFileSync("media/report.md", "utf8") !== report) problems.push("report_markdown is not media/report.md byte for byte: set report_markdown to the file's whole text, unchanged");
  if (/\bsee (the [\w ]{0,30})?above\b/i.test(report)) problems.push("report_markdown points at text outside itself (\"see above\"): it is the whole report, so write that part out in it");

  if (!existsSync("film/cost.json")) problems.push("film/cost.json is missing: run `answer.mjs cost` and copy what it prints");
  else {
    const want = JSON.parse(readFileSync("film/cost.json", "utf8"));
    const norm = (c) => JSON.stringify({ steps: (c?.steps ?? []).map((l) => [l.step, l.endpoint_id, l.units, l.unit, l.rate_usd, l.usd]).sort((x, y) => String(x[0]).localeCompare(String(y[0]))), total: c?.total });
    if (norm(a.fal_cost_usd) !== norm(want)) problems.push(`fal_cost_usd is not what \`answer.mjs cost\` printed: copy it exactly: ${JSON.stringify(want)}`);
  }

  const rendered = existsSync("media/show.mp4") && a.film?.path;
  if (rendered) {
    const first = report.trimStart().split("\n")[0].trim();
    const embed = `![${a.show_name}, ${a.show_date}](media/show.mp4)`;
    if (first !== embed) problems.push(`report_markdown must start with the show's embed, its first line exactly ${embed} (it starts: ${JSON.stringify(first.slice(0, 80))})`);
    if (existsSync("media/share-card.png") && !report.includes("](media/share-card.png)")) problems.push("report_markdown has no share card embed, ![...](media/share-card.png), under the show");
    if (!/AI-generated/i.test(report)) problems.push("report_markdown does not say the show and its anchor are AI-generated");
    const { check_errors: errs, renders } = a.checks ?? {};
    const said = Number.isInteger(errs) && Number.isInteger(renders)
      ? new RegExp(`\\b${errs} check errors?\\b`, "i").test(report) && new RegExp(`\\b${renders} renders?\\b`, "i").test(report)
      : /\bcheck errors?\b/i.test(report);
    if (!said) problems.push(`report_markdown has no checks: say them as \`${errs ?? "<n>"} check errors, ${renders ?? "<n>"} renders\``);
  }
  const total = a.fal_cost_usd?.total;
  if (typeof total === "number" && total > 0 && !report.includes(String(total)) && !report.includes(total.toFixed(3)))
    problems.push(`report_markdown has no cost table with the total: list the steps and their total, ${total}`);
  for (const st of Array.isArray(a.stories) ? a.stories : []) {
    if (st?.url && !report.includes(`](${st.url})`)) problems.push(`report_markdown does not link story ${st.slot ?? "?"}'s page: a line - ${st.slot}: [${st.title}](${st.url}) (...)`);
  }
  if (typeof a.error === "string" && a.error.trim() && !report.includes(a.error.trim()))
    problems.push("report_markdown does not quote `error` word for word: put the error's text in the report as it is");
  if (!rendered) {
    const today = new Set((Array.isArray(a.stories) ? a.stories : []).map((st) => st?.url).filter(Boolean));
    const kept = (Array.isArray(a.stories_shown) ? a.stories_shown : []).filter((x) => today.has(x?.url));
    if (kept.length) problems.push(`no show was rendered, so stories_shown hands on the earlier list unchanged: remove ${kept.map((x) => x.url).join(", ")}`);
  }

  if (!problems.length) {
    console.log("answer ok");
    return;
  }
  console.log(`answer: ${problems.length} problem${problems.length === 1 ? "" : "s"}`);
  for (const p of problems) console.log(`- ${p}`);
  process.exit(1);
}

if (command === "cost") cost();
else if (command === "check") check();
else fail("usage: answer.mjs cost --rates still=..,voice=..,fabric=.. --sent <steps>|none [--failed <steps>] | answer.mjs check media/answer.json");
