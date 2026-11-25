// The news show kit's answer.mjs: `cost` prices the steps a run sent, and `check` reads the answer a run wrote to
// media/answer.json before it answers. Runs failed on the answer's exact work: a total typed by hand (3.846 for steps
// summing to 2.846; 2.522 for 2.521), a report_markdown that was a one-line summary pointing "above", story pages named
// but not linked, and fal's refusal paraphrased instead of quoted. The run writes the whole report to media/report.md,
// and report_markdown must be that file byte for byte. These tests hold what the fix depends on: the cost is
// worked out in code, the total is the sum of the rounded steps, and check exits 1 on each of those answers and 0 on a
// clean one. A last test holds the rubric fix: R1's added fact is a substring of each fixture's R1 page.
// They need ffmpeg and ffprobe on PATH (the evals-parse workflow installs ffmpeg). Every input is synthetic.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const KIT = new URL("../templates/news-show/skills/news-show/kit/answer.mjs", import.meta.url).pathname;
const EVALS = new URL("../templates/news-show/evals/", import.meta.url).pathname;
const ORDER = ["cold-open", "headlines", "lead-a", "story-a", "lead-b", "story-b", "lead-c", "story-c", "closing"];
const ANCHOR = ["cold-open", "lead-a", "lead-b", "lead-c", "closing"];
// Each voice's length: the anchor ones are not whole seconds, so Fabric's units are each rounded up.
const SECONDS = { "cold-open": 7.6, headlines: 3, "lead-a": 4.4, "story-a": 3, "lead-b": 5.4, "story-b": 3, "lead-c": 4.6, "story-c": 3, closing: 7.2 };
const FABRIC_UNITS = { "cold-open": 8, "lead-a": 5, "lead-b": 6, "lead-c": 5, closing: 8 };
// 125 characters each: 0.125 thousand at 0.1 is 0.0125, rounded to 0.013 per voice. Nine rounded voices sum to 0.117,
// where rounding the unrounded sum (0.1125) would give 0.113 or 0.112.
const SCRIPT = (name) => `${name}: ${"x".repeat(125 - name.length - 2)}`;
const RATES = "still=0.15,voice=0.1,fabric=0.08";
const SENT = ["anchor-image", ...ORDER.map((s) => `voice-${s}`), ...ANCHOR.map((s) => `anchor-${s}`)].join(",");

function folder() {
  const dir = mkdtempSync(join(tmpdir(), "ns-answer-"));
  mkdirSync(join(dir, "film"));
  mkdirSync(join(dir, "media"));
  writeFileSync(join(dir, "film/show.json"), JSON.stringify({ segments: ORDER.map((name) => ({ name, script: SCRIPT(name) })) }));
  for (const name of ORDER) {
    // PCM in a WAV container under the voice's name: ffprobe probes by content and reads its length exactly.
    const r = spawnSync("ffmpeg", ["-v", "error", "-nostdin", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", String(SECONDS[name]), "-c:a", "pcm_s16le", "-f", "wav", join(dir, `media/voice-${name}.mp3`)], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
  }
  return dir;
}
const kit = (dir, ...args) => spawnSync("node", [KIT, ...args], { cwd: dir, encoding: "utf8" });

const STORIES = [
  { slot: "A", title: "Airport rail link passes one million riders", url: "https://transitwire.example/2026/11/23/airport-link-one-million" },
  { slot: "B", title: "Night bus N9 to run every 15 minutes from January", url: "https://transitwire.example/2026/11/22/n9-night-bus-every-15-minutes" },
  { slot: "C", title: "Line 4 extension opens two stations", url: "https://transitwire.example/2026/11/21/line-4-extension-opens" },
];
const LINKS = STORIES.map((s) => `- ${s.slot}: [${s.title}](${s.url}) (TransitWire, 2026-11-23)`).join("\n");
const report = (cost) => [
  "![The Daily Desk, 2026-11-23](media/show.mp4)",
  "",
  "![Share card](media/share-card.png)",
  "",
  LINKS,
  "",
  "The show and its anchor, Rowan, are AI-generated.",
  "",
  "| Step | USD |",
  "| --- | --- |",
  ...cost.steps.map((l) => `| ${l.step} | ${l.usd} |`),
  `| Total | ${cost.total} |`,
  "",
  "Checks: 0 check errors, 1 render.",
].join("\n");

// A clean answer for the folder: the cost as the kit printed it, a full report, a rendered show. The report file holds
// the answer's report_markdown unless `file` says otherwise.
function answer(dir, change = (a) => a, file) {
  const cost = JSON.parse(readFileSync(join(dir, "film/cost.json"), "utf8"));
  const REPORT = report(cost);
  const a = {
    status: "completed", show_date: "2026-11-23", show_name: "The Daily Desk", beat: { topic: "city transit", urls: [] },
    anchor: {}, stories: STORIES, skipped_repeats: [], stories_shown: STORIES.map((s) => ({ url: s.url, title: s.title, date: "2026-11-23" })),
    segments: [], disclosure: {}, plan: {}, plans_priced: [], captions_timing: "aligned", film: { path: "media/show.mp4" }, checks: { check_errors: 0, renders: 1 },
    fal_cost_usd: cost, files: [], failed_step: null, error: null, ignored_instructions: [], notes: [], report_markdown: REPORT,
  };
  writeFileSync(join(dir, "media/show.mp4"), "");
  writeFileSync(join(dir, "media/share-card.png"), "");
  const changed = change(structuredClone(a));
  writeFileSync(join(dir, "media/answer.json"), JSON.stringify(changed));
  if (file !== null) writeFileSync(join(dir, "media/report.md"), file ?? changed.report_markdown);
  return kit(dir, "check", "media/answer.json");
}

test("cost: voices at characters/1000, Fabric at whole seconds rounded up, the total the sum of the rounded steps", () => {
  const dir = folder();
  const r = kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  assert.equal(r.status, 0, r.stderr);
  const c = JSON.parse(r.stdout);
  assert.deepEqual(JSON.parse(readFileSync(join(dir, "film/cost.json"), "utf8")), c);
  const by = Object.fromEntries(c.steps.map((s) => [s.step, s]));
  for (const name of ORDER) {
    assert.equal(by[`voice-${name}`].units, 0.125);
    assert.equal(by[`voice-${name}`].usd, 0.013);
  }
  for (const name of ANCHOR) assert.equal(by[`anchor-${name}`].units, FABRIC_UNITS[name], name);
  assert.equal(by["anchor-image"].usd, 0.15);
  const sum = c.steps.reduce((t, s) => t + s.usd, 0);
  assert.equal(c.total, Math.round(sum * 1000) / 1000);
  assert.equal(c.total, 2.827); // 0.15 + 9 x 0.013 + 32 s x 0.08
});

test("cost: a failed or refused job at 0, and nothing paid gives no steps", () => {
  const dir = folder();
  const c = JSON.parse(kit(dir, "cost", "--rates", RATES, "--sent", SENT, "--failed", "anchor-lead-b").stdout);
  assert.equal(c.steps.find((s) => s.step === "anchor-lead-b").usd, 0);
  assert.equal(c.total, 2.347);
  assert.deepEqual(JSON.parse(kit(dir, "cost", "--sent", "none").stdout), { steps: [], total: 0 });
});

test("check: a clean answer prints answer ok", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  const r = answer(dir);
  assert.equal(r.status, 0, r.stdout);
  assert.equal(r.stdout.trim(), "answer ok");
});

test("check: a typed total that is not the steps' sum fails (3.846 for 2.846, and off by 0.001)", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  for (const delta of [1, 0.001]) {
    const r = answer(dir, (a) => ((a.fal_cost_usd.total = Math.round((a.fal_cost_usd.total + delta) * 1000) / 1000), a));
    assert.equal(r.status, 1);
    assert.match(r.stdout, /fal_cost_usd is not what `answer\.mjs cost` printed/);
  }
});

test("check: a one-line summary report pointing above fails on the embed, the card, the AI line, the cost, the checks and every link", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  const r = answer(dir, (a) => ((a.report_markdown = "The Daily Desk, 2026-11-23: show rendered. See the summary above for links, disclosure, checks and notes."), a));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /must start with the show's embed/);
  assert.match(r.stdout, /no share card embed/);
  assert.match(r.stdout, /AI-generated/);
  assert.match(r.stdout, /no cost table with the total/);
  assert.match(r.stdout, /no checks/);
  for (const s of STORIES) assert.ok(r.stdout.includes(`link story ${s.slot}'s page`), s.slot);
});

test("check: report_markdown that is not media/report.md byte for byte, or no report file, fails", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  const full = answer(dir).stdout;
  assert.equal(full.trim(), "answer ok");
  const cost = JSON.parse(readFileSync(join(dir, "film/cost.json"), "utf8"));
  const off = answer(dir, (a) => a, `${report(cost)}\n`);
  assert.equal(off.status, 1);
  assert.match(off.stdout, /answer: 1 problem\n- report_markdown is not media\/report\.md byte for byte/);
  rmSync(join(dir, "media/report.md"));
  const gone = answer(dir, (a) => a, null);
  assert.equal(gone.status, 1);
  assert.match(gone.stdout, /media\/report\.md is missing/);
});

test("check: a report missing its cost table or its checks fails, each named", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  const noCost = answer(dir, (a) => ((a.report_markdown = a.report_markdown.replace(/\n\| Step[\s\S]*\| Total \| [\d.]+ \|/, "")), a));
  assert.equal(noCost.status, 1);
  assert.match(noCost.stdout, /answer: 1 problem\n- report_markdown has no cost table with the total: .* 2\.827/);
  const noChecks = answer(dir, (a) => ((a.report_markdown = a.report_markdown.replace("\n\nChecks: 0 check errors, 1 render.", "\n\nChecks passed.")), a));
  assert.equal(noChecks.status, 1);
  assert.match(noChecks.stdout, /answer: 1 problem\n- report_markdown has no checks/);
});

test("check: one story named without its link fails", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  const r = answer(dir, (a) => ((a.report_markdown = a.report_markdown.replace(`[${STORIES[1].title}](${STORIES[1].url})`, STORIES[1].title)), a));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /answer: 1 problem\n- report_markdown does not link story B's page/);
});

test("check: an error paraphrased in the report, not quoted word for word, fails", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT, "--failed", "anchor-lead-b");
  const error = "anchor-lead-b: veed/fabric-1.0 refused the job: No face detected in the image.";
  const bad = answer(dir, (a) => ((a.status = "partial"), (a.failed_step = "anchor-lead-b"), (a.error = error), (a.report_markdown += "\n\nLead B's clip was refused because Fabric found no face; it plays as a desk card."), a));
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /does not quote `error` word for word/);
  const good = answer(dir, (a) => ((a.status = "partial"), (a.failed_step = "anchor-lead-b"), (a.error = error), (a.report_markdown += `\n\nLead B plays as a desk card: ${error}`), a));
  assert.equal(good.status, 0, good.stdout);
});

test("check: a show not rendered hands on stories_shown without today's stories", () => {
  const dir = folder();
  kit(dir, "cost", "--sent", "none");
  const r = answer(dir, (a) => ((a.status = "over_budget"), (a.film = { path: null }), (a.report_markdown = `${LINKS}\n\nNothing was paid.`), a));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /stories_shown hands on the earlier list unchanged/);
});

// Run 01a2116f-7a3a at 014037dc15: its media/answer.json passed check ("answer ok"), its report_markdown media/report.md
// byte for byte, but the reply retyped that JSON with report_markdown replaced by this line, and the grader failed it.
const PLACEHOLDER = "(identical to the report text above; see media/report.md)";

test("final: the reply is one json block whose report_markdown is media/report.md's text, whatever the answer file held", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  answer(dir, (a) => ((a.report_markdown = PLACEHOLDER), a), report(JSON.parse(readFileSync(join(dir, "film/cost.json"), "utf8"))));
  const r = kit(dir, "final", "media/answer.json");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const m = /^```json\n([\s\S]*)\n```\n?$/.exec(r.stdout);
  assert.ok(m, `final prints the reply, one json block and nothing else: ${JSON.stringify(r.stdout.slice(0, 200))}`);
  const sent = JSON.parse(m[1]);
  assert.equal(sent.report_markdown, readFileSync(join(dir, "media/report.md"), "utf8"));
  assert.deepEqual(JSON.parse(readFileSync(join(dir, "media/answer.json"), "utf8")), sent, "the answer file is what the reply carries");
});

test("final: an answer with problems prints them, not a reply", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  answer(dir, (a) => ((a.fal_cost_usd.total = 3.846), a));
  const r = kit(dir, "final", "media/answer.json");
  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stdout, /```json/);
  assert.match(r.stdout, /fal_cost_usd is not what `answer\.mjs cost` printed/);
});

test("schema: a rendered show's report_markdown must open with the show's embed, so the runtime refuses the placeholder", () => {
  const schema = JSON.parse(readFileSync(new URL("../templates/news-show/news-show.schema.json", import.meta.url), "utf8"));
  const rule = (schema.allOf ?? []).find((x) => x?.if?.properties?.film && x?.then?.properties?.report_markdown?.pattern);
  assert.ok(rule, "the schema has an if/then on film.path that sets report_markdown's pattern");
  assert.deepEqual(rule.if.required, ["film"]);
  assert.deepEqual(rule.if.properties.film.properties.path, { type: "string" });
  // JSON Schema patterns are ECMA-262 regular expressions, unanchored.
  const opens = new RegExp(rule.then.properties.report_markdown.pattern, "u");
  assert.equal(opens.test(PLACEHOLDER), false);
  assert.equal(opens.test("The Daily Desk, 2026-11-23: show rendered. See the summary above."), false);
  assert.equal(opens.test(report({ steps: [], total: 0 })), true);
});

test("check: a report that keeps the total but drops the table, or a step's row, fails", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  const table = /\n\| Step[\s\S]*\| Total \| [\d.]+ \|/;
  const line = answer(dir, (a) => ((a.report_markdown = a.report_markdown.replace(table, "\nCost: 2.827")), a));
  assert.equal(line.status, 1, "the total alone on a line passes");
  assert.match(line.stdout, /answer: 1 problem\n- report_markdown has no cost table with the total: .* 2\.827/);
  const row = answer(dir, (a) => ((a.report_markdown = a.report_markdown.replace("| anchor-lead-b | 0.48 |\n", "")), a));
  assert.equal(row.status, 1, "a table missing a priced step's row passes");
  assert.match(row.stdout, /answer: 1 problem\n- report_markdown's cost table has no row for anchor-lead-b/);
});

test("cost: a voice whose save failed is priced on the length the run measured (--seconds), and final still answers", () => {
  const dir = folder();
  rmSync(join(dir, "media/voice-lead-b.mp3"));
  const r = kit(dir, "cost", "--rates", RATES, "--sent", SENT, "--seconds", "lead-b=5.4");
  assert.equal(r.status, 0, r.stderr);
  const c = JSON.parse(r.stdout);
  assert.equal(c.steps.find((l) => l.step === "anchor-lead-b").units, 6);
  assert.equal(c.total, 2.827);
  assert.match(r.stderr, /anchor-lead-b .*--seconds lead-b=5\.4.*media\/voice-lead-b\.mp3 is missing/);
  const f = answer(dir, (a) => ((a.status = "not_saved"), (a.notes = ["media/voice-lead-b.mp3 was not saved"]), a));
  assert.equal(f.status, 0, f.stdout);
  const fin = kit(dir, "final", "media/answer.json");
  assert.equal(fin.status, 0, fin.stdout);
  assert.match(fin.stdout, /^```json\n/);
  const none = kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  assert.equal(none.status, 2, "with no file and no --seconds, cost says what it needs");
  assert.match(none.stderr, /media\/voice-lead-b\.mp3 is missing.*--seconds lead-b=/);
});

test("final and schema: a show name with brackets is escaped in the embed, and the reply meets the schema", () => {
  const dir = folder();
  kit(dir, "cost", "--rates", RATES, "--sent", SENT);
  const name = "News [Live] \\ Desk";
  const embed = "![News \\[Live\\] \\\\ Desk, 2026-11-23](media/show.mp4)";
  const rough = answer(dir, (a) => ((a.show_name = name), (a.report_markdown = a.report_markdown.replace("![The Daily Desk, 2026-11-23](media/show.mp4)", `![${name}, 2026-11-23](media/show.mp4)`)), a));
  assert.equal(rough.status, 1);
  assert.ok(rough.stdout.includes(embed), `check names the escaped embed: ${rough.stdout}`);
  answer(dir, (a) => ((a.show_name = name), (a.report_markdown = a.report_markdown.replace("![The Daily Desk, 2026-11-23](media/show.mp4)", embed)), a));
  const fin = kit(dir, "final", "media/answer.json");
  assert.equal(fin.status, 0, fin.stdout);
  const sent = JSON.parse(/^```json\n([\s\S]*)\n```\n?$/.exec(fin.stdout)[1]);
  const schema = JSON.parse(readFileSync(new URL("../templates/news-show/news-show.schema.json", import.meta.url), "utf8"));
  const rule = schema.allOf.find((x) => x?.then?.properties?.report_markdown?.pattern);
  assert.ok(new RegExp(rule.then.properties.report_markdown.pattern, "u").test(sent.report_markdown), "the escaped embed meets the schema's pattern");
});

test("rubric: R1's added fact is a substring of the fixture's R1 page, in each eval that lists it", () => {
  const phrase = "on the new section once a full timetable runs in December";
  for (const name of ["show-from-feed", "carried-no-repeats"]) {
    const rubric = readFileSync(join(EVALS, name, "graders/answer.md"), "utf8");
    assert.ok(rubric.includes(`18,500 riders a day expected ${phrase}`), `${name}: the rubric lists R1's fact with the clause`);
    const web = JSON.parse(readFileSync(join(EVALS, name, "fixtures/web.json"), "utf8"));
    const page = web.fetch.answers.find((x) => x.url.endsWith("/2026/11/21/line-4-extension-opens"));
    assert.ok(page, `${name}: the fixture has R1's page`);
    assert.ok(page.text.includes(`18,500 riders a day ${phrase}`), `${name}: the added fact is a substring of the fixture's R1 page`);
  }
});
