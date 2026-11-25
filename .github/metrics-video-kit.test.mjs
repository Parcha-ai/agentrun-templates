// The metrics film kit, node only, on synthetic Stripe pages (no account, no model): what the week over week claims
// when the last result carried only some of a week's currencies, and what the refunds scene shows for money won back
// from a dispute opened in an earlier week.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";

const KIT = new URL("../templates/metrics-video/skills/metrics-video/kit/", import.meta.url).pathname;
const root = mkdtempSync(join(tmpdir(), "mv-kit-"));
let seq = 0;

// One balance transaction, whole as Stripe lists it (the fields the kit reads, and `object`).
const txn = (created, currency, reporting_category, amount, fee = 0) => ({
  object: "balance_transaction", id: `txn_test${++seq}`, created: Math.floor(Date.parse(created) / 1000),
  type: reporting_category === "charge" ? "charge" : reporting_category === "dispute_reversal" ? "adjustment" : reporting_category,
  reporting_category, currency, amount, fee, net: amount - fee,
});

// compute on these items, newest first in one page as Stripe lists them; returns film/data.json and the printed lines.
function compute(name, items, today, carried) {
  const dir = join(root, name);
  const pages = join(dir, "stripe");
  const film = join(dir, "film");
  mkdirSync(pages, { recursive: true });
  cpSync(KIT, film, { recursive: true });
  writeFileSync(join(pages, "raw-1.json"), JSON.stringify({ object: "list", data: [...items].sort((a, b) => b.created - a.created), has_more: false }));
  const args = [join(KIT, "metrics.mjs"), "compute", "--today", today, "--timezone", "UTC", "--pages", pages, "--film", film];
  if (carried) {
    writeFileSync(join(dir, "carried.json"), JSON.stringify(carried));
    args.push("--carried", join(dir, "carried.json"));
  }
  const r = spawnSync(process.execPath, args, { encoding: "utf8" });
  assert.equal(r.status, 0, `compute ${name} exited ${r.status}: ${r.stderr}${r.stdout}`);
  return { data: JSON.parse(readFileSync(join(film, "data.json"), "utf8")), out: r.stdout };
}

test("a currency the last result did not carry (a week of eleven) is not said to be restated", () => {
  // The week of 9 November: eleven currencies, each with one charge. The carry holds ten.
  const codes = ["usd", "eur", "gbp", "cad", "aud", "chf", "sek", "nok", "dkk", "nzd", "sgd"];
  const before = codes.map((c, i) => txn(`2026-11-1${i % 5}T12:00:00Z`, c, "charge", 200000 - i * 10000, 1000));
  const first = compute("eleven-first", before, "2026-11-16");
  const carried = first.data.carry;
  assert.equal(carried.figures.length, 10, "the carry holds ten currencies");
  const [left] = codes.filter((c) => !carried.figures.some((r) => r.currency === c));
  assert.ok(left && left !== "eur", `one currency is left out of the carry, not this test's EUR: ${left}`);

  // The week of 16 November, one charge in EUR; Stripe changed nothing in the week before.
  const week = [txn("2026-11-18T12:00:00Z", "eur", "charge", 50000, 500)];
  const next = compute("eleven-next", [...before, ...week], "2026-11-23", carried);
  assert.equal(next.data.compare.state, "carried", `nothing changed in Stripe, so nothing is restated: ${JSON.stringify(next.data.compare)}`);
  assert.deepEqual(next.data.compare.restated, []);
  assert.doesNotMatch(next.out, /RESTATED/);
  // The left-out currency is still said to have had money the week before and none this week, from Stripe's figures.
  assert.ok(next.data.gone.some((g) => g.code === left), `${left}, read again from Stripe, is named as gone`);
  // The carry says it holds only some of the week's currencies.
  assert.equal(carried.complete, false);
});

test("a week of ten currencies carries them all, and one missing next week is a known zero", () => {
  const codes = ["usd", "eur", "gbp", "cad", "aud", "chf", "sek", "nok", "dkk", "nzd"];
  const before = codes.map((c, i) => txn(`2026-11-1${i % 5}T12:00:00Z`, c, "charge", 200000 - i * 10000, 1000));
  const first = compute("ten-first", before, "2026-11-16");
  assert.equal(first.data.carry.figures.length, 10);
  // Stripe now lists a charge in the week before in a currency the carry didn't have: a real restatement.
  const late = txn("2026-11-12T12:00:00Z", "sgd", "charge", 30000, 300);
  const week = [txn("2026-11-18T12:00:00Z", "usd", "charge", 50000, 500)];
  const next = compute("ten-next", [...before, late, ...week], "2026-11-23", first.data.carry);
  assert.equal(next.data.compare.state, "restated");
  assert.deepEqual(next.data.compare.restated.map((r) => [r.currency, r.carried_revenue_minor]), [["sgd", 0]]);
  // Ten currencies are every currency of that week.
  assert.equal(first.data.carry.complete, true);
});

// The refunds scene's script run on the week's data, with a stand-in DOM: the items it lays out, as HTML.
function refundsScene(data) {
  const html = readFileSync(join(KIT, "compositions", "refunds.html"), "utf8");
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
  const els = new Map();
  const ctx = {
    MV: data,
    mvFilmed: () => data.currencies.filter((c) => c.filmed),
    mvSeg: () => 1,
    rfReady: () => new Promise(() => {}),
    document: { getElementById: (id) => (els.has(id) ? els.get(id) : els.set(id, { textContent: "", innerHTML: "" }).get(id)) },
    __timelines: {},
  };
  ctx.window = ctx;
  vm.runInNewContext(script, ctx);
  return els.get("rf-stage").innerHTML;
}

test("money won back from a dispute opened in an earlier week is shown, with no dispute this week", () => {
  // The week of 16 November: two charges, and a dispute from October won back (a dispute_reversal), no new dispute.
  const items = [
    txn("2026-11-17T10:00:00Z", "usd", "charge", 120000, 3800),
    txn("2026-11-19T10:00:00Z", "usd", "charge", 80000, 2600),
    txn("2026-11-20T10:00:00Z", "usd", "dispute_reversal", 64900, -1500),
  ];
  const { data, out } = compute("won-back", items, "2026-11-23");
  const usd = data.currencies.find((c) => c.code === "usd");
  assert.equal(usd.disputes.count, 0);
  assert.equal(usd.dispute_reversals.count, 1);
  assert.match(out, /won back/);
  const stage = refundsScene(data);
  assert.doesNotMatch(stage, /No refunds or disputes/, "the scene says nothing came back when $649 did");
  assert.match(stage, /won back/i, `the scene shows the money won back: ${stage}`);
});

// A count's length, as the kit's index.html runs it (mvCount), and the least time to read a figure once it has counted.
const COUNT_SECONDS = Number(/window\.mvCount = [\s\S]*?duration: ([0-9.]+)/.exec(readFileSync(join(KIT, "index.html"), "utf8"))[1]);
const HOLD = 1.0;

// The refunds scene's timeline on the week's placed data: when each figure's count starts, and when it leaves the
// screen (the first fade-out after its count starts, or the scene's end). One item is on screen at a time.
function refundsTimeline(data) {
  const html = readFileSync(join(KIT, "compositions", "refunds.html"), "utf8");
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)[1];
  const outs = [];
  const counts = [];
  const tl = { fromTo: () => tl, to: (target, vars, at) => (vars.opacity === 0 && outs.push(at), tl) };
  const ctx = {
    MV: data,
    mvFilmed: () => data.currencies.filter((c) => c.filmed),
    mvSeg: (name) => data.timing[name].seconds / Math.max(1, data.currencies.filter((c) => c.filmed).length),
    rfReady: () => ({ then: (f) => f() }),
    rfFit: () => {},
    mvCount: (_tl, el, money, _symbol, at) => counts.push({ figure: money.display, at }),
    gsap: { timeline: () => tl },
    getComputedStyle: () => ({}),
    innerWidth: 1920,
    innerHeight: 1080,
    document: { getElementById: () => ({ textContent: "", innerHTML: "", style: {} }), querySelector: () => null },
    __timelines: {},
  };
  ctx.window = ctx;
  vm.runInNewContext(script, ctx);
  const end = data.timing.refunds.seconds;
  return counts.map((c) => ({ ...c, gone: Math.min(end, ...outs.filter((t) => t > c.at)) }));
}

// Three currencies, each with a refund, a dispute and money won back from an earlier week's dispute.
function threeWithEverything() {
  const items = [];
  for (const [i, c] of ["usd", "eur", "gbp"].entries()) {
    items.push(txn(`2026-11-17T1${i}:00:00Z`, c, "charge", 300000 - i * 50000, 9000));
    items.push(txn(`2026-11-18T1${i}:00:00Z`, c, "refund", -25000));
    items.push(txn(`2026-11-19T1${i}:00:00Z`, c, "dispute", -64900, 1500));
    items.push(txn(`2026-11-20T1${i}:00:00Z`, c, "dispute_reversal", 40000, -1500));
  }
  return items;
}

test("with three currencies of refunds, disputes and money won back, every figure stays on screen until it is read", () => {
  const { data } = compute("three-everything", threeWithEverything(), "2026-11-23");
  assert.equal(data.currencies.filter((c) => c.filmed).length, 3);
  const shown = refundsTimeline(data);
  assert.equal(shown.length, 9, "nine figures: a refund, a dispute and money won back in each of three currencies");
  for (const f of shown) {
    assert.ok(f.gone - f.at >= COUNT_SECONDS + HOLD - 1e-9,
      `${f.figure} counts from ${f.at.toFixed(2)} s and is gone at ${f.gone.toFixed(2)} s: it needs ${COUNT_SECONDS} s to count and ${HOLD} s to be read`);
  }
});

test("place refuses a refunds scene too short for each currency's figures to count and be read", () => {
  const { data } = compute("three-short", threeWithEverything(), "2026-11-23");
  const film = join(root, "three-short", "film");
  const at = Object.fromEntries(data.plan.scenes.map((s) => [s.name, s.start]));
  // Refunds cut to 8 s, 2.67 s for each of three currencies: more than 2.5 s, less than a count and its hold.
  const starts = { ...at, endcard: at.refunds + 8 };
  const r = spawnSync(process.execPath, [join(KIT, "metrics.mjs"), "place", "--film", film, "--at", Object.entries(starts).map(([k, v]) => `${k}=${v}`).join(",")], { encoding: "utf8" });
  assert.equal(r.status, 2, `place should refuse: ${r.stdout}${r.stderr}`);
  assert.match(r.stderr + r.stdout, /refunds/);
});

// ---------- the customer-data scan ----------
// A run folder: Stripe's raw page of these items, and these files the run wrote (path -> text, or a value as JSON).
// Returns scan's exit code and what it printed.
function scanRun(name, items, files, extra = []) {
  const dir = join(root, name);
  mkdirSync(join(dir, "stripe"), { recursive: true });
  writeFileSync(join(dir, "stripe", "raw-1.json"), JSON.stringify({ object: "list", data: items, has_more: false }));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), typeof body === "string" ? body : JSON.stringify(body));
  }
  const r = spawnSync(process.execPath, [join(KIT, "metrics.mjs"), "scan", "--pages", join(dir, "stripe"), "--root", dir, ...extra], { encoding: "utf8" });
  return { status: r.status, out: r.stdout + r.stderr };
}
const described = (description, amount = 45000) => ({ ...txn("2026-11-18T12:00:00Z", "usd", "charge", amount, 1335), description });
// fal's timestamps for a voice that says `text`: one chunk, one letter per string, as ElevenLabs answers them.
const spokenAs = (text) => [{
  characters: [...text],
  character_start_times_seconds: [...text].map((_, i) => i * 0.06),
  character_end_times_seconds: [...text].map((_, i) => i * 0.06 + 0.05),
}];
const CLEAN = "[warm] The week of sixteen November: revenue, net of refunds and Stripe fees, was four thousand dollars.";

test("scan reads what fal spoke: a name the timestamps spell, one letter at a time, fails it", () => {
  const items = [described("Commission for Marisol Quintero")];
  const clean = scanRun("spoke-clean", items, { "media/vo.txt": CLEAN, "media/voiceover-timestamps.json": spokenAs(CLEAN) });
  assert.equal(clean.status, 0, `a voice that says the clean narration scans clean: ${clean.out}`);
  const said = `${CLEAN} And thank you, Marisol Quintero.`;
  const leaked = scanRun("spoke-name", items, { "media/vo.txt": CLEAN, "media/voiceover-timestamps.json": spokenAs(said) });
  assert.equal(leaked.status, 2, `fal spoke the name, though vo.txt is clean: ${leaked.out}`);
  assert.match(leaked.out, /voiceover-timestamps\.json/);
  assert.doesNotMatch(leaked.out, /Marisol|Quintero/, "the scan never prints the value");
  // A re-voice's timestamps are read the same way.
  const again = scanRun("spoke-name-2", items, { "media/vo.txt": CLEAN, "media/voiceover-timestamps.json": spokenAs(CLEAN), "media/voiceover-2-timestamps.json": { timestamps: spokenAs(said) } });
  assert.equal(again.status, 2, `the re-voice spoke the name: ${again.out}`);
  assert.match(again.out, /voiceover-2-timestamps\.json/);
});
