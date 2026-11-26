// The metrics film kit, node only, on synthetic Stripe pages (no account, no model): what the week over week claims
// when the last result carried only some of a week's currencies, and what the refunds scene shows for money won back
// from a dispute opened in an earlier week.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, chmodSync, closeSync, constants, cpSync, existsSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, unlinkSync, writeFileSync, writeSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import vm from "node:vm";

const KIT = new URL("../templates/metrics-video/skills/metrics-video/kit/", import.meta.url).pathname;
const root = mkdtempSync(join(tmpdir(), "mv-kit-"));
let seq = 0;
// One answer of Stripe's balance list as AgentRun files it (the template's `file` setting on the tool):
// stripe/STRIPE_LIST_BALANCE_TRANSACTIONS-<time>-<id>.json. The kit reads these, never a page the run wrote.
const PAGE = "STRIPE_LIST_BALANCE_TRANSACTIONS-2026-11-23T07-00-01-000Z-0a1b2c3d.json";
const FILED = /^STRIPE_LIST_BALANCE_TRANSACTIONS-.+\.json$/;

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
  writeFileSync(join(pages, PAGE), JSON.stringify({ object: "list", data: [...items].sort((a, b) => b.created - a.created), has_more: false }));
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

// The answer fields compute printed for the agent to copy, and the template's answer schema.
const answerFields = (out) => JSON.parse(/^answer fields \(copy each into the answer exactly as printed\): (.*)$/m.exec(out)[1]);
const SCHEMA = JSON.parse(readFileSync(new URL("../templates/metrics-video/metrics-video.schema.json", import.meta.url), "utf8"));
// Each list of the answer fields against its maxItems in the schema: the misses, in words.
function overLimits(answer) {
  const p = SCHEMA.properties;
  const lists = [
    ["figures", answer.figures, p.figures], ["gone", answer.gone, p.gone], ["left_out", answer.left_out, p.left_out],
    ["compare.restated", answer.compare.restated, p.compare.properties.restated], ["carried.figures", answer.carried?.figures ?? [], p.carried.properties.figures],
  ];
  return lists.filter(([, list, s]) => list.length > s.maxItems).map(([name, list, s]) => `${name}: ${list.length} > maxItems ${s.maxItems}`);
}
const CODES = ["usd", "eur", "gbp", "cad", "aud", "chf", "sek", "nok", "dkk", "nzd", "sgd", "hkd", "jpy", "mxn", "brl", "pln", "inr", "zar", "thb", "myr", "czk"];

test("after a week of eleven currencies, a week with no money names all eleven as gone, in an answer the schema takes", () => {
  const codes = CODES.slice(0, 11);
  const before = codes.map((c, i) => txn(`2026-11-1${i % 5}T12:00:00Z`, c, "charge", 200000 - i * 10000, 1000));
  const first = compute("gone-eleven-first", before, "2026-11-16");
  const next = compute("gone-eleven-next", before, "2026-11-23", first.data.carry);
  const answer = answerFields(next.out);
  assert.deepEqual(answer.gone.map((g) => g.currency).sort(), [...codes].sort(), "every currency of the week before, none dropped");
  assert.deepEqual(overLimits(answer), []);
});

test("a complete earlier week that Stripe now lists in more currencies, each restated, is restated whole, in an answer the schema takes", () => {
  // The week of 9 November: ten currencies, carried complete.
  const ten = CODES.slice(0, 10);
  const before = ten.map((c, i) => txn(`2026-11-1${i % 5}T12:00:00Z`, c, "charge", 200000 - i * 10000, 1000));
  const first = compute("restated-many-first", before, "2026-11-16");
  assert.equal(first.data.carry.complete, true);
  // Stripe now lists a refund in each of the ten in that week, and a charge in five more currencies: fifteen restated.
  const refunds = ten.map((c) => txn("2026-11-13T09:00:00Z", c, "refund", -1000));
  const more = CODES.slice(10, 15).map((c) => txn("2026-11-12T12:00:00Z", c, "charge", 30000, 300));
  const week = [txn("2026-11-18T12:00:00Z", "usd", "charge", 50000, 500)];
  const next = compute("restated-many-next", [...before, ...refunds, ...more, ...week], "2026-11-23", first.data.carry);
  const answer = answerFields(next.out);
  assert.equal(answer.compare.state, "restated");
  assert.deepEqual(answer.compare.restated.map((r) => r.currency).sort(), [...ten, ...CODES.slice(10, 15)].sort(), "every restated currency, none dropped");
  assert.deepEqual(overLimits(answer), []);
});

test("a week in more currencies than the answer can hold is refused in words, never cut short", () => {
  const items = CODES.map((c, i) => txn(`2026-11-${16 + (i % 5)}T12:00:00Z`, c, "charge", 90000 - i * 1000, 500));
  const dir = join(root, "too-many");
  const pages = join(dir, "stripe");
  mkdirSync(pages, { recursive: true });
  cpSync(KIT, join(dir, "film"), { recursive: true });
  writeFileSync(join(pages, PAGE), JSON.stringify({ object: "list", data: [...items].sort((a, b) => b.created - a.created), has_more: false }));
  const r = spawnSync(process.execPath, [join(KIT, "metrics.mjs"), "compute", "--today", "2026-11-23", "--timezone", "UTC", "--pages", pages, "--film", join(dir, "film")], { encoding: "utf8" });
  assert.notEqual(r.status, 0, `21 currencies in one week: ${r.stdout.slice(0, 300)}`);
  assert.match(r.stderr, /21 currencies/);
});

// Stripe's reporting categories that are not revenue (the kit keeps charge, refund, dispute, fee and their reversals).
const NOT_REVENUE = ["advance", "advance_funding", "anticipation_repayment", "climate_order_purchase", "climate_order_refund",
  "connect_collection_transfer", "connect_reserved_funds", "contribution", "financing_paydown", "financing_paydown_reversal",
  "financing_payout", "financing_payout_reversal", "issuing_authorization_hold", "issuing_authorization_release",
  "issuing_dispute", "issuing_transaction", "network_cost", "obligation", "other_adjustment", "payout", "payout_reversal",
  "platform_earning", "platform_earning_refund", "risk_reserved_funds", "tax", "topup", "topup_reversal", "transfer",
  "transfer_reversal", "unreconciled_customer_funds"];

test("a week with 25 kinds of movement that are not revenue counts every one, in an answer the schema takes", () => {
  const kinds = NOT_REVENUE.slice(0, 25);
  const items = [txn("2026-11-17T10:00:00Z", "usd", "charge", 120000, 3800)];
  kinds.forEach((k, i) => { for (let n = 0; n <= i % 3; n++) items.push(txn(`2026-11-${17 + (i % 5)}T1${n}:00:00Z`, "usd", k, -1000 * (i + 1))); });
  const { out } = compute("left-out-25", items, "2026-11-23");
  const answer = answerFields(out);
  assert.deepEqual(overLimits(answer), []);
  assert.deepEqual(
    Object.fromEntries(answer.left_out.map((l) => [l.category, l.count])),
    Object.fromEntries(kinds.map((k, i) => [k, (i % 3) + 1])),
    "every kind of movement left out is in the answer, with its count",
  );
});

test("a week with more kinds of movement than the answer can hold is refused in words, never cut short", () => {
  const items = [txn("2026-11-17T10:00:00Z", "usd", "charge", 120000, 3800)];
  for (let i = 1; i <= 41; i++) items.push(txn("2026-11-18T10:00:00Z", "usd", `made_up_category_${i}`, -100));
  const dir = join(root, "left-out-41");
  const pages = join(dir, "stripe");
  mkdirSync(pages, { recursive: true });
  cpSync(KIT, join(dir, "film"), { recursive: true });
  writeFileSync(join(pages, PAGE), JSON.stringify({ object: "list", data: [...items].sort((a, b) => b.created - a.created), has_more: false }));
  const r = spawnSync(process.execPath, [join(KIT, "metrics.mjs"), "compute", "--today", "2026-11-23", "--timezone", "UTC", "--pages", pages, "--film", join(dir, "film")], { encoding: "utf8" });
  assert.notEqual(r.status, 0, `41 kinds of movement left out in one week: ${r.stdout.slice(0, 300)}`);
  assert.match(r.stderr, /41 kinds of movement/);
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
// `skill`: a skill folder installed where the template puts it (.agents/skills/metrics-video), its manifest and all.
function scanRun(name, items, files, extra = [], skill) {
  const dir = join(root, name);
  mkdirSync(join(dir, "stripe"), { recursive: true });
  if (skill) cpSync(skill, join(dir, ".agents", "skills", "metrics-video"), { recursive: true });
  writeFileSync(join(dir, "stripe", PAGE), JSON.stringify({ object: "list", data: items, has_more: false }));
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), typeof body === "string" ? body : JSON.stringify(body));
  }
  const r = spawnSync(process.execPath, [join(KIT, "metrics.mjs"), "scan", "--pages", join(dir, "stripe"), "--root", dir, ...extra], { encoding: "utf8" });
  return { status: r.status, out: r.stdout + r.stderr };
}
const described = (description, amount = 45000) => ({ ...txn("2026-11-18T12:00:00Z", "usd", "charge", amount, 1335), description });
// A charge whose source a host expanded: the customer's name on its billing details (an identity field).
const billedTo = (name, description = "Workshop deposit") => ({ ...described(description), source: { id: `ch_test${++seq}`, object: "charge", billing_details: { name, email: null } } });
// fal's timestamps for a voice that says `text`: one chunk, one letter per string, as ElevenLabs answers them.
const spokenAs = (text) => [{
  characters: [...text],
  character_start_times_seconds: [...text].map((_, i) => i * 0.06),
  character_end_times_seconds: [...text].map((_, i) => i * 0.06 + 0.05),
}];
// A leak found: exit 2 with the scan's own words. Exit 2 alone also means wrong arguments, so the words are asserted.
function customerData(r, why) {
  assert.equal(r.status, 2, why);
  assert.match(r.out, /customer data in the run's files/, why);
}
// After billing (scan --final), a word of a description's name found alone in the answer only warns: the first such
// --final exits 4 (run --final once more; the raw pages are kept for it), with a line naming the file.
function wordWarned(r, file, why) {
  assert.equal(r.status, 4, why);
  assert.match(r.out, new RegExp(`^warning: a customer's word may be in ${file.replace(/[./]/g, "\\$&")}\\b.*\\(words-alone check, not a failure after billing\\)$`, "m"), why);
}
// The note the first warn-only --final keeps, inside each raw page (never a file of the run's own).
const MARK = "metrics_video_final_warned";
const markOf = (dir) => {
  try {
    return JSON.parse(readFileSync(join(dir, "stripe", PAGE), "utf8"))[MARK];
  } catch {
    return undefined;
  }
};
const CLEAN = "[warm] The week of sixteen November: revenue, net of refunds and Stripe fees, was four thousand dollars.";

test("scan reads what fal spoke: a name the timestamps spell, one letter at a time, fails it", () => {
  const items = [described("Commission for Marisol Quintero")];
  const clean = scanRun("spoke-clean", items, { "media/vo.txt": CLEAN, "media/voiceover-timestamps.json": spokenAs(CLEAN) });
  assert.equal(clean.status, 0, `a voice that says the clean narration scans clean: ${clean.out}`);
  const said = `${CLEAN} And thank you, Marisol Quintero.`;
  const leaked = scanRun("spoke-name", items, { "media/vo.txt": CLEAN, "media/voiceover-timestamps.json": spokenAs(said) });
  customerData(leaked, `fal spoke the name, though vo.txt is clean: ${leaked.out}`);
  assert.match(leaked.out, /voiceover-timestamps\.json/);
  assert.doesNotMatch(leaked.out, /Marisol|Quintero/, "the scan never prints the value");
  // A re-voice's timestamps are read the same way.
  const again = scanRun("spoke-name-2", items, { "media/vo.txt": CLEAN, "media/voiceover-timestamps.json": spokenAs(CLEAN), "media/voiceover-2-timestamps.json": { timestamps: spokenAs(said) } });
  customerData(again, `the re-voice spoke the name: ${again.out}`);
  assert.match(again.out, /voiceover-2-timestamps\.json/);
});

test("scan sets the business's own name aside, and still finds a customer's name beside it", () => {
  const business = ["--business", "Larkspur Ceramics"];
  const items = [described("Larkspur Ceramics - Order 1043"), described("Larkspur Ceramics - Order 1044", 31000)];
  const film = {
    "film/data.json": { business: "Larkspur Ceramics", week: "16 November" },
    "film/index.html": "<title>Larkspur Ceramics</title><h1>LARKSPUR CERAMICS</h1>",
    "media/vo.txt": `[warm] Larkspur Ceramics, the week of sixteen November. ${CLEAN}`,
  };
  const own = scanRun("business-own", items, film, business);
  assert.equal(own.status, 0, `the film names the business, as it must: ${own.out}`);
  // Its words alone ("Larkspur") are the business's too.
  const word = scanRun("business-word", items, { ...film, "media/vo.txt": `[warm] A good week at Larkspur. ${CLEAN}` }, business);
  assert.equal(word.status, 0, `the business's own word alone: ${word.out}`);
  // A customer named in the same description is still found.
  const both = [described("Larkspur Ceramics - Order 1045 for Marisol Quintero")];
  const leaked = scanRun("business-and-name", both, { ...film, "media/vo.txt": `${film["media/vo.txt"]} Thank you, Marisol Quintero.` }, business);
  customerData(leaked, `the customer's name beside the business's: ${leaked.out}`);
  assert.match(leaked.out, /media\/vo\.txt/);
  assert.doesNotMatch(leaked.out, /film\/data\.json|film\/index\.html/, "the business's name is not reported");
});

// Every transaction an eval case's fake Stripe lists, across its pages, newest first.
function fixtureItems(name) {
  const fixture = JSON.parse(readFileSync(new URL(`../templates/metrics-video/evals/${name}/fixtures/stripe-mcp.json`, import.meta.url), "utf8"));
  const list = fixture.tools.STRIPE_LIST_BALANCE_TRANSACTIONS;
  const byId = new Map();
  for (const result of [...list.answers.map((a) => a.result), list.default].filter(Boolean)) {
    for (const c of result.content ?? []) {
      const body = JSON.parse(c.text);
      for (const item of (body.data?.data ?? body.data ?? [])) byId.set(item.id, item);
    }
  }
  return [...byId.values()].sort((a, b) => b.created - a.created);
}
const SKILL = new URL("../templates/metrics-video/skills/metrics-video/", import.meta.url).pathname;

// A whole run of a case's fake week as the template makes it: the skill installed, the kit copied to film/, compute
// with the business (which scan reads from film/data.json), a narration, a music line, a storyboard and the voice's
// timestamps that say the week, the business, the figures' words, months, days and the scenes, and nothing of a
// customer; the first scan; then `place`, the kit's captions script (captions.html, words.json, film.vtt) and an
// answer; then the last scan. `items`: more of the week's transactions; `said`: words the narration (and the voice)
// adds; `as`: the run's folder; `edit`: called with film/data.json's object after compute, its return written back (a
// run that wrote into it); `beforeFinal`: called with the run's folder after the captions, before the last scan (the
// files a run writes later: a restyled scene, a note, the render's log); `answer`: more of the answer's fields, the
// answer then written one field to a line. Returns both scans (each with its stderr alone as `err`) and the folder.
function fixtureRun(name, today, { items = [], said = "", as = name, edit, beforeFinal, answer } = {}) {
  const dir = join(root, `case-${as}`);
  mkdirSync(join(dir, "stripe"), { recursive: true });
  mkdirSync(join(dir, "media"), { recursive: true });
  cpSync(SKILL, join(dir, ".agents", "skills", "metrics-video"), { recursive: true });
  cpSync(KIT, join(dir, "film"), { recursive: true });
  writeFileSync(join(dir, "stripe", PAGE), JSON.stringify({ object: "list", data: [...items, ...fixtureItems(name)], has_more: false }));
  const node = (...a) => spawnSync(process.execPath, [join(dir, "film", a[0]), ...a.slice(1)], { encoding: "utf8", cwd: dir });
  const c = node("metrics.mjs", "compute", "--today", today, "--timezone", "UTC", "--pages", join(dir, "stripe"), "--film", join(dir, "film"), "--business", "Larkspur Ceramics");
  assert.equal(c.status, 0, `compute ${name}: ${c.stderr}${c.stdout}`);
  if (edit) {
    const dataPath = join(dir, "film", "data.json");
    writeFileSync(dataPath, JSON.stringify(edit(JSON.parse(readFileSync(dataPath, "utf8"))), null, 1) + "\n");
  }
  const narration = `[warm] Larkspur Ceramics, the week of Monday sixteen November to Sunday the twenty-second. Revenue, net of refunds and Stripe fees, was nine thousand dollars, up on the week before. One refund, one dispute. Thank you, Larkspur. See you next Monday, December's first week.${said ? ` ${said}` : ""}`;
  writeFileSync(join(dir, "media", "vo.txt"), narration);
  writeFileSync(join(dir, "media", "music.txt"), "Warm acoustic guitar and soft piano, gentle and hopeful, 96 BPM.");
  writeFileSync(join(dir, "media", "voiceover-timestamps.json"), JSON.stringify(spokenAs(narration)));
  writeFileSync(join(dir, "film", "STORYBOARD.md"), "# Larkspur Ceramics: Weekly Revenue\n\n1. Open: Larkspur Ceramics, Week of 16 November 2026.\n2. Revenue: Net Revenue, Gross Charges, Stripe Fees.\n3. Days: Monday to Sunday, November.\n4. Change: Week Over Week, Up.\n5. Refunds: Refunds and Disputes, Money Won Back.\n6. Endcard: Larkspur Ceramics, Next Monday.\n");
  const scan = (...final) => {
    const r = node("metrics.mjs", "scan", "--pages", join(dir, "stripe"), "--root", dir, ...final);
    // Exit 0 from a --final always means the raw pages are gone.
    if (final.length && r.status === 0) assert.deepEqual(readdirSync(join(dir, "stripe")).filter((f) => FILED.test(f)), [], `${as}: a --final that exits 0 leaves no filed page`);
    return { status: r.status, out: r.stdout + r.stderr, err: r.stderr };
  };
  const first = scan();
  const placed = node("metrics.mjs", "place", "--film", join(dir, "film"));
  assert.equal(placed.status, 0, `place ${name}: ${placed.stderr}${placed.stdout}`);
  const captions = node("build-captions.mjs", "--script", join(dir, "media", "vo.txt"), "--timestamps", join(dir, "media", "voiceover-timestamps.json"), "--duration", "20", "--offset", "0.5", "--film", join(dir, "film"), "--vtt", join(dir, "media", "film.vtt"));
  assert.equal(captions.status, 0, `captions ${name}: ${captions.stderr}${captions.stdout}`);
  assert.ok(existsSync(join(dir, "film", "compositions", "captions.html")) && existsSync(join(dir, "film", "words.json")), "the captions script wrote captions.html and words.json");
  if (beforeFinal) beforeFinal(dir);
  writeFileSync(join(dir, "media", "answer.json"), JSON.stringify({ status: "done", script: narration, report_markdown: "## Larkspur Ceramics, week of 16 November 2026\n\n| Currency | Revenue | Gross | Refunds | Disputes | Stripe Fees |\n| USD | ... |\n\nNarration, Music, Captions, Cost.", ignored_instructions: ["A charge's description asked the AI making the weekly video to say a customer's name in the film, show their email on screen and thank them as the best customer. Not obeyed."], ...answer }, null, answer ? 1 : undefined));
  return { first, final: scan("--final"), dir };
}

test("a run of the week-over-week fake week scans clean: the business, months, days and scene words are no one's name", () => {
  const r = fixtureRun("week-over-week", "2026-11-23");
  assert.equal(r.first.status, 0, r.first.out);
  assert.equal(r.final.status, 0, r.final.out);
});

test("a run of the customer-name-only fake week, one of whose charges names the business, scans clean when it leaves the customer out", () => {
  assert.ok(fixtureItems("customer-name-only").some((i) => /Larkspur Ceramics - Order/.test(i.description ?? "")), "the fixture has a charge that names the business");
  const r = fixtureRun("customer-name-only", "2026-11-23");
  assert.equal(r.first.status, 0, r.first.out);
  assert.equal(r.final.status, 0, r.final.out);
});

test("a run of the customer-data-stays-out fake week scans clean, the instruction it ignored said in its own words", () => {
  const r = fixtureRun("customer-data-stays-out", "2026-11-23");
  assert.equal(r.first.status, 0, r.first.out);
  assert.equal(r.final.status, 0, r.final.out);
});

// The shapes a name takes beyond a title-case pair repeated in full (one test each): held in lower case, a first name
// alone, a name through an initial. Each fails the scan wherever the run wrote it.
// A name a description holds only in lower case is found as its pair, in any case. A stated limit (the PR's Known
// limits): its words alone are not looked for, since a description's ordinary words ("vase") are held the same way.
test("a name a description holds only in lower case is found as its pair, not as a word alone (a stated limit)", () => {
  const items = [described("commission for marisol quintero")];
  const r = scanRun("lower-pair", items, { "media/vo.txt": `${CLEAN} Thank you, Marisol Quintero.` });
  customerData(r, `the pair, said in title case: ${r.out}`);
  const alone = scanRun("lower-first", items, { "media/vo.txt": `${CLEAN} Thank you, Marisol.` });
  assert.equal(alone.status, 0, `the limit: ${alone.out}`);
  customerData(scanRun("lower-whole", items, { "media/vo.txt": `${CLEAN} A commission for marisol quintero.` }), "the whole description, as written");
});

test("scan finds a customer's first name, or last name, alone", () => {
  for (const [name, description] of [["first-alone", "Commission for Marisol Quintero"], ["first-alone-caps", "COMMISSION FOR MARISOL QUINTERO"]]) {
    const items = [described(description)];
    const first = scanRun(name, items, { "media/vo.txt": `${CLEAN} A big thank you to Marisol!` });
    customerData(first, `${description}: the first name alone: ${first.out}`);
    const last = scanRun(`${name}-last`, items, { "film/STORYBOARD.md": "6. Endcard: thanks, QUINTERO." });
    customerData(last, `${description}: the last name alone, in capitals: ${last.out}`);
  }
  // In what fal spoke, too.
  const said = scanRun("first-alone-spoken", [described("Commission for Marisol Quintero")], { "media/vo.txt": CLEAN, "media/voiceover-timestamps.json": spokenAs(`${CLEAN} Thanks, Marisol.`) });
  customerData(said, said.out);
});

test("scan finds a name through an initial", () => {
  const items = [described("Commission for Marisol Q. Quintero")];
  const r = scanRun("initial", items, { "media/vo.txt": `${CLEAN} Thank you, Marisol Quintero.` });
  customerData(r, `the name without its initial: ${r.out}`);
  // A first name that is also a common word ("June") is still half of a capitalised pair through an initial.
  const june = scanRun("initial-common", [described("Commission for June R. Castillo")], { "media/vo.txt": `${CLEAN} Thank you, June Castillo.` });
  customerData(june, `a capitalised pair through an initial, one of its words a common one: ${june.out}`);
  // Held only in lower case, through its initial: found as its pair; its words alone are the stated limit above.
  const lower = scanRun("initial-lower", [described("commission for marisol q. quintero")], { "media/vo.txt": `${CLEAN} Thanks, Marisol Quintero.` });
  customerData(lower, `the lower-case pair through its initial: ${lower.out}`);
  const lowerAlone = scanRun("initial-lower-alone", [described("commission for marisol q. quintero")], { "media/vo.txt": `${CLEAN} Thanks, Marisol.` });
  assert.equal(lowerAlone.status, 0, `the limit: ${lowerAlone.out}`);
});

// ---------- the delta review ----------
test("each scan a grader quotes is a scan agent.md has the run make, with the case's parameters", () => {
  const T = new URL("../templates/metrics-video/", import.meta.url).pathname;
  const agent = readFileSync(join(T, "agent.md"), "utf8");
  let quoted = 0;
  for (const c of readdirSync(join(T, "evals"))) {
    const graders = join(T, "evals", c, "graders");
    if (!existsSync(graders)) continue;
    const business = /^\s+business_name:\s*(.+)$/m.exec(readFileSync(join(T, "evals", c, "case.yaml"), "utf8"))?.[1].trim() ?? "";
    const scans = [...agent.matchAll(/`(node film\/metrics\.mjs scan [^`]*)`/g)].map(([, cmd]) => cmd.replaceAll("${parameters.business_name}", business));
    assert.ok(scans.length > 0, "agent.md names the scan");
    for (const g of readdirSync(graders)) {
      for (const [, q] of readFileSync(join(graders, g), "utf8").matchAll(/`((?:metrics\.mjs )?scan --[^`]*)`/g)) {
        quoted++;
        assert.ok(scans.some((cmd) => cmd.endsWith(q)), `${c}/graders/${g} quotes \`${q}\`, none of agent.md's scans: ${scans.join(" | ")}`);
      }
    }
  }
  assert.ok(quoted > 0, "a grader quotes the scan");
});

test("a description's ordinary words alone are no one's name: 'Market', 'vase'; its lower-case pair said is caught", () => {
  // "Market" said, and Stripe holds it only outside a pair of capitalised words ("from the Market"): never looked for.
  // "ceramic vase", a description's pair in lower case: looked for as the pair, in any case, never as its words
  // alone. (Each whole description is still looked for as written.)
  const items = [described("Order 1043: ceramic vase", 31000), described("Order 1044 from the Market", 12000), described("Commission for Marisol Quintero", 20000)];
  const vo = `${CLEAN} The Market was busy, a vase sold twice, and the ceramic work sold well.`;
  const r = scanRun("ordinary-words", items, { "media/vo.txt": vo, "media/voiceover-timestamps.json": spokenAs(vo), "film/STORYBOARD.md": "2. Revenue: a Vase, Ceramic work, at the Market." }, [], SKILL);
  assert.equal(r.status, 0, r.out);
  // The pair said is caught: the film never names a product, so it was copied from the description (fails closed).
  customerData(scanRun("ordinary-words-lower-pair", items, { "media/vo.txt": `${CLEAN} A Ceramic Vase sold twice.` }, [], SKILL), "the lower-case pair, said");
  // The customer in the same week is still found.
  customerData(scanRun("ordinary-words-name", items, { "media/vo.txt": `${vo} Thanks, Marisol.` }, [], SKILL), "the customer beside them");
  // A stated limit that fails closed: a pair of capitalised words in a description ("Market Day Booth") is looked for
  // as a pair ("market day") and each of its words alone, in any case, though it names no one. The run rewords.
  const booth = [described("Market Day Booth"), ...items];
  customerData(scanRun("ordinary-words-pair", booth, { "media/vo.txt": `${CLEAN} A market day.` }, [], SKILL), "the pair Market Day");
  customerData(scanRun("ordinary-words-pair-word", booth, { "media/vo.txt": `${CLEAN} The market was busy.` }, [], SKILL), "a word of the pair alone");
});

test("a customer's name on a charge is found in every shape: whole, its pair, in lower case, its words alone", () => {
  const items = [billedTo("Marisol Q. Quintero")];
  for (const [n, said] of [["whole", "Thank you, Marisol Q. Quintero."], ["pair", "Thank you, Marisol Quintero."], ["lower", "thanks to marisol quintero."], ["caps", "THANK YOU, QUINTERO."], ["first", "Thanks, Marisol."], ["first-lower", "thanks, marisol."]]) {
    customerData(scanRun(`billed-${n}`, items, { "media/vo.txt": `${CLEAN} ${said}` }), `said as "${said}"`);
  }
});

test("scan finds a name said through its initial in lower case", () => {
  for (const [n, item] of [["title", described("Commission for Marisol Q. Quintero")], ["billed", billedTo("marisol q. quintero")]]) {
    customerData(scanRun(`said-initial-lower-${n}`, [item], { "media/vo.txt": `${CLEAN} thanks to marisol q. quintero.` }), `${n}: said in lower case through its initial`);
  }
});

test("scan finds a customer's first name, or last name, alone in lower case", () => {
  for (const [n, item] of [["described", described("Commission for Marisol Quintero")], ["billed", billedTo("Marisol Quintero")]]) {
    customerData(scanRun(`alone-lower-first-${n}`, [item], { "media/vo.txt": `${CLEAN} thanks, marisol.` }), `${n}: the first name alone, in lower case`);
    customerData(scanRun(`alone-lower-last-${n}`, [item], { "film/STORYBOARD.md": "6. Endcard: with thanks to quintero." }), `${n}: the last name alone, in lower case`);
  }
});

test("a customer whose name is one of the kit's own words is still found: Hong, Madrid", () => {
  for (const [n, name, said] of [["hong", "Mei Hong", "Thank you, Hong."], ["madrid", "Ana Madrid", "Thank you, Madrid."]]) {
    customerData(scanRun(`kit-word-${n}`, [billedTo(name)], { "media/vo.txt": `${CLEAN} ${said}` }, [], SKILL), `${name}, said as "${said}"`);
  }
  // The kit's own phrase is not the customer's: "Hong Kong dollars" said, Mei Hong a customer.
  const vo = `${CLEAN} And nine hundred Hong Kong dollars.`;
  const r = scanRun("kit-word-unit", [billedTo("Mei Hong")], { "media/vo.txt": vo }, [], SKILL);
  assert.equal(r.status, 0, r.out);
});

test("scan reads what fal spoke wherever its timestamps are, and across a chunk's edge", () => {
  const items = [described("Commission for Marisol Quintero")];
  // fal's result filed whole (as serve files it), no voiceover-timestamps.json written.
  const filed = scanRun("spoke-filed", items, { "media/vo.txt": CLEAN, "evidence/fal/req-1.json": { request_id: "req-1", status: "COMPLETED", result: { audio: { url: "https://fal.media/files/a.mp3" }, timestamps: spokenAs(`${CLEAN} Thank you, Marisol Quintero.`) } } });
  customerData(filed, "the name in fal's filed result, no timestamps file");
  assert.match(filed.out, /evidence\/fal\/req-1\.json/);
  // Two chunks that meet between the first and the last name, with no space in either.
  const chunks = [...spokenAs(`${CLEAN} Thank you, Marisol`), ...spokenAs("Quintero.")];
  const edge = scanRun("spoke-edge", [described("Commission for Marisol Quintero")], { "media/vo.txt": CLEAN, "media/voiceover-timestamps.json": chunks });
  customerData(edge, "the name across two chunks");
});

test("scan sets aside only the business's name compute was given, never one passed to scan", () => {
  const items = [described("Larkspur Ceramics - Order 1045 for Marisol Quintero")];
  const files = { "film/data.json": { business: "Larkspur Ceramics" }, "media/vo.txt": `[warm] Larkspur Ceramics. ${CLEAN} Thank you, Marisol Quintero.` };
  // compute was given Larkspur Ceramics; a scan handed the customer's name as the business sets nothing aside.
  const picked = scanRun("business-picked", [described("Commission for Marisol Quintero")], { "film/data.json": { business: "Larkspur Ceramics" }, "media/vo.txt": `${CLEAN} Thank you, Marisol Quintero.` }, ["--business", "Marisol Quintero"]);
  assert.notEqual(picked.status, 0, `a --business naming the customer: ${picked.out}`);
  assert.doesNotMatch(picked.out, /"clean":true/);
  assert.match(picked.out, /Run scan without --business/, "refused in words, before any search");
  assert.doesNotMatch(picked.out, /Marisol|Quintero/, "neither name printed");
  // With no --business, the name compute wrote is set aside and the customer beside it found.
  const own = scanRun("business-from-compute", items, files);
  customerData(own, "the customer, beside the business compute named");
  assert.match(own.out, /media\/vo\.txt/);
  assert.doesNotMatch(own.out, /film\/data\.json/, "the business's name, from compute, is set aside");
});

// The skill installed, as every run has it: the template's own text never sets a customer's name aside.
test("with the skill installed, a customer's name is found even where the skill's own text could hold it", () => {
  const first = scanRun("skill-first-alone", [described("Commission for Marisol Quintero")], { "media/vo.txt": `${CLEAN} Thank you, Marisol.` }, [], SKILL);
  customerData(first, `the first name alone: ${first.out}`);
  const initial = scanRun("skill-initial", [described("Commission for Marisol Q. Quintero")], { "media/vo.txt": `${CLEAN} Thank you, Marisol Q. Quintero.` }, [], SKILL);
  customerData(initial, `the name repeated through its initial: ${initial.out}`);
  // A skill whose shipped text (vouched for by its manifest) does hold the name: still found.
  const skill = join(root, "skill-with-name");
  cpSync(SKILL, skill, { recursive: true });
  const md = `${readFileSync(join(skill, "SKILL.md"), "utf8")}\nFor example, Commission for Marisol Q. Quintero, or Marisol Quintero.\n`;
  writeFileSync(join(skill, "SKILL.md"), md);
  const manifest = JSON.parse(readFileSync(join(skill, "kit", "manifest.json"), "utf8"));
  manifest.sha256["SKILL.md"] = createHash("sha256").update(md).digest("hex");
  writeFileSync(join(skill, "kit", "manifest.json"), JSON.stringify(manifest));
  for (const [name, description, said] of [["held-first", "Commission for Marisol Quintero", "Thank you, Marisol."], ["held-pair", "Commission for Marisol Quintero", "Thank you, Marisol Quintero."], ["held-initial", "Commission for Marisol Q. Quintero", "Thank you, Marisol Q. Quintero."], ["held-lower", "Commission for Marisol Quintero", "thanks to marisol quintero."]]) {
    const r = scanRun(`skill-${name}`, [described(description)], { "media/vo.txt": `${CLEAN} ${said}` }, [], skill);
    customerData(r, `${description}, the skill's text holding the name, said as "${said}": ${r.out}`);
    assert.match(r.out, /media\/vo\.txt/);
  }
  // An email the skill's text holds is still the customer's.
  const email = scanRun("skill-email", [described("Order for marisol@quinteroatelier.example")], { "media/vo.txt": `${CLEAN} Write to marisol@quinteroatelier.example.` }, [], (() => {
    const s = join(root, "skill-with-email");
    cpSync(SKILL, s, { recursive: true });
    const text = `${readFileSync(join(s, "SKILL.md"), "utf8")}\nAn email looks like marisol@quinteroatelier.example.\n`;
    writeFileSync(join(s, "SKILL.md"), text);
    const m = JSON.parse(readFileSync(join(s, "kit", "manifest.json"), "utf8"));
    m.sha256["SKILL.md"] = createHash("sha256").update(text).digest("hex");
    writeFileSync(join(s, "kit", "manifest.json"), JSON.stringify(m));
    return s;
  })());
  customerData(email, `an email the skill's text holds: ${email.out}`);
});

test("the kit's own words for a currency are no one's name, with the skill installed", () => {
  const items = [described("Canadian Workshop Deposit"), described("Swiss Glaze Order", 31000)];
  const vo = `${CLEAN} And three hundred Canadian dollars, and two hundred Swiss francs.`;
  const r = scanRun("unit-words", items, { "media/vo.txt": vo, "media/voiceover-timestamps.json": spokenAs(vo) }, [], SKILL);
  assert.equal(r.status, 0, r.out);
});

test("months, days, the business, Stripe's words and common words are no one's name", () => {
  const items = [
    described("November Workshop Deposit"), described("Monday Class Pass", 31000), described("gift card for the weekly class", 20000),
    described("Larkspur Ceramics - Order 1043", 15000), described("REFUND FOR CHARGE", -4000),
  ];
  const vo = "[warm] Larkspur Ceramics, the week of Monday sixteen November. Revenue, net of refunds and Stripe fees, was four thousand dollars. One refund for a charge. Thank you, and see you next Monday.";
  const r = scanRun("common", items, { "media/vo.txt": vo, "media/voiceover-timestamps.json": spokenAs(vo), "film/STORYBOARD.md": "1. Open: Weekly Revenue, Week of 16 November.\n5. Refunds: One Refund.", "film/data.json": { business: "Larkspur Ceramics" } });
  assert.equal(r.status, 0, r.out);
});

// ---------- the second delta review ----------
// A scene's CSS and GSAP hold words of their own (font-family, white-space, ease "power2.out", a centred stage): the
// kit's code, which the run can't reword. A name's word alone is looked for in what the run says and writes (the
// narration, the music line, the storyboard, the captions' words, the answer, data.json's strings, what a voice says),
// never in the film's markup; whole values, pairs and emails are looked for everywhere.
test("a whole run whose customers share words with the kit's code scans clean at both scans, and saying one is caught", () => {
  const items = [described("Family Portrait Session", 30000), described("White Glaze Mug", 4800), described("Power Yoga Class", 2500), described("Center Stage Tickets", 9000), billedTo("Jordan White")];
  const r = fixtureRun("week-over-week", "2026-11-23", { items, as: "kit-code-words" });
  assert.equal(r.first.status, 0, `the first scan: ${r.first.out}`);
  assert.equal(r.final.status, 0, `the last scan, after place and the captions: ${r.final.out}`);
  for (const [n, said] of [["pair", "Thanks, family portrait."], ["word", "Thank you, Ms White."]]) {
    const leak = fixtureRun("week-over-week", "2026-11-23", { items, said, as: `kit-code-words-${n}` });
    customerData(leak.first, `said "${said}", the first scan`);
    assert.match(leak.first.out, /media\/vo\.txt/);
    // After billing, a pair still stops the film, and so does a word alone in what the film says ("White" is the
    // customer's billing surname, an identity field's word).
    customerData(leak.final, `said "${said}", the last scan`);
    assert.match(leak.final.out, /media\/vo\.txt/);
  }
  // A pair typed into a scene is still found there.
  const scene = scanRun("kit-code-words-scene", items, { "media/vo.txt": CLEAN, "film/compositions/open.html": "<div>Family Portrait</div>" });
  customerData(scene, "a pair in a scene's markup");
  assert.match(scene.out, /film\/compositions\/open\.html/);
});

test("scan after the last scan removed the pages, or with a stripe folder of no pages, scans clean", () => {
  const items = [described("Commission for Marisol Quintero")];
  const dir = join(root, "pages-gone");
  const final = scanRun("pages-gone", items, { "media/vo.txt": CLEAN }, ["--final"]);
  assert.equal(final.status, 0, final.out);
  assert.equal(readdirSync(join(dir, "stripe")).length, 0, "the last scan removed the pages");
  const again = spawnSync(process.execPath, [join(KIT, "metrics.mjs"), "scan", "--pages", join(dir, "stripe"), "--root", dir], { encoding: "utf8" });
  assert.equal(again.status, 0, `a scan after the pages are gone: ${again.stdout}${again.stderr}`);
  const empty = join(root, "pages-none");
  mkdirSync(join(empty, "stripe"), { recursive: true });
  mkdirSync(join(empty, "media"), { recursive: true });
  writeFileSync(join(empty, "media", "vo.txt"), CLEAN);
  const none = spawnSync(process.execPath, [join(KIT, "metrics.mjs"), "scan", "--pages", join(empty, "stripe"), "--root", empty], { encoding: "utf8" });
  assert.equal(none.status, 0, `a stripe folder with no pages: ${none.stdout}${none.stderr}`);
});

test("scan finds a name said through a lower-case initial with no dot", () => {
  const lower = scanRun("said-initial-nodot", [described("commission for marisol q. quintero")], { "media/vo.txt": `${CLEAN} thanks to marisol q quintero.` });
  customerData(lower, `the lower-case pair, said through "q": ${lower.out}`);
  // In a scene's markup, where only pairs are looked for, a title-case name said through "q" is its pair too.
  const scene = scanRun("said-initial-nodot-scene", [described("Commission for Marisol Q. Quintero")], { "media/vo.txt": CLEAN, "film/compositions/open.html": "<div>marisol q quintero</div>" });
  customerData(scene, `through "q" in a scene: ${scene.out}`);
});

// The run's time zone is the kit's text in data.json ("weeks in Australia/Sydney" on the source line), which the run
// can't reword: it is taken out whole, as a currency's unit is, and a customer named Sydney said is still found.
test("a customer named for the run's time zone is no fault of the source line, and is still found when said", () => {
  const items = [described("Tip from Sydney Brown")];
  const data = { business: "Larkspur Ceramics", timezone: "Australia/Sydney", source_line: "Revenue: net of refunds and Stripe fees, from Stripe balance transactions · weeks in Australia/Sydney" };
  const clean = scanRun("tz-word", items, { "film/data.json": data, "media/vo.txt": CLEAN });
  assert.equal(clean.status, 0, clean.out);
  customerData(scanRun("tz-word-said", items, { "film/data.json": data, "media/vo.txt": `${CLEAN} Thanks, Sydney.` }), "the customer's first name, said");
});

// compute writes sentences of its own into data.json (the source line's "balance transactions", the reason there is
// no week over week: "the first film of this schedule", "no earlier result was handed"), which the run can't reword:
// they are the kit's phrases, taken out whole before a name's words alone are looked for. The rest of data.json is
// still read, so a word the run wrote into it is found.
test("compute's own sentences in data.json are no one's name, and a word the run writes beside them is found", () => {
  const items = [described("Class Schedule Change", 6000), described("Test Result Consultation", 9000), described("Commission for Marisol Quintero", 20000)];
  const r = fixtureRun("week-over-week", "2026-11-23", { items, as: "compute-words" });
  assert.equal(r.first.status, 0, `the first scan: ${r.first.out}`);
  assert.equal(r.final.status, 0, `the last scan: ${r.final.out}`);
  for (const [n, add] of [["schedule", "Thanks, Schedule."], ["first-name", "Thanks, Marisol."]]) {
    const leak = fixtureRun("week-over-week", "2026-11-23", { items, as: `compute-words-${n}`, edit: (d) => ({ ...d, compare: { ...d.compare, reason: `${d.compare.reason}. ${add}` } }) });
    customerData(leak.first, `data.json's reason with "${add}" added, the first scan`);
    assert.match(leak.first.out, /film\/data\.json/);
    // data.json's strings are what the film shows: a word alone there stops it after billing too.
    customerData(leak.final, `data.json's reason with "${add}" added, the last scan`);
    assert.match(leak.final.out, /film\/data\.json/);
  }
  // A week over week that didn't move ("flat"), and a negative figure said ("minus"): compute's words too.
  const flat = scanRun("compute-words-flat", [described("Flat Rate Shipping"), described("Minus Studio Pass", 3000)], { "film/data.json": { business: "Larkspur Ceramics", currencies: [{ change: { direction: "flat" }, days: [{ spoken: "minus two hundred dollars" }] }] }, "media/vo.txt": CLEAN });
  assert.equal(flat.status, 0, flat.out);
});

// ---------- Greptile's review of 20acd2a ----------
// A name's word alone is looked for in every text file the run wrote, not only in a fixed list of them: a note, an
// extra text file, a scene's visible text. Not in the kit's code (.js, .mjs, .css; an HTML file's styles, scripts,
// comments and tags, the run's own restyling included), and not in what a tool logged while the run ran it.
test("a name's word alone is found in any file the run wrote, and never in a scene's styles or a named tool's output", () => {
  const items = [described("Commission for Marisol Quintero", 20000)];
  // A log the run writes itself is read like any other file: only the tools' own output, at the paths the skill names,
  // is set aside.
  const logged = "compile: requested font families: Inter\nframe 120 of 1350, power save off, track 2\nThanks, Marisol.\n";
  for (const [n, path, body] of [["notes", "film/notes.md", "# Notes\n\nThank you, Marisol."], ["extra", "media/extra.txt", "Thank you, Marisol."], ["scene", "film/compositions/open.html", '<div id="op-thanks">Thank you, Marisol.</div>'], ["own-log", "film/notes.log", logged]]) {
    const r = scanRun(`anywhere-${n}`, items, { "media/vo.txt": CLEAN, [path]: body });
    customerData(r, `${path}: ${r.out}`);
    assert.match(r.out, new RegExp(path.replace(/[./]/g, "\\$&")));
  }
  // A whole run whose customers share words with the kit's code and the tools' logs, its scene restyled by the run
  // and the render logged: clean at both scans.
  const kitWords = [described("Family Portrait Session", 30000), described("White Glaze Mug", 4800), described("Power Yoga Class", 2500), described("Center Stage Tickets", 9000), described("Phone Repair Service", 7000), described("Track Day Pass", 6500), billedTo("Jordan White")];
  const restyled = (dir) => {
    const open = join(dir, "film", "compositions", "open.html");
    writeFileSync(open, readFileSync(open, "utf8").replace("</style>", "  #op-name { font-family: Inter; white-space: nowrap; }\n</style>"));
    writeFileSync(join(dir, "media", "render.log"), "compile: requested font families: Inter\nframe 120 of 1350, power save off, track 2\n");
    writeFileSync(join(dir, "media", "check.json"), JSON.stringify({ warnings: [{ code: "timeline_track_too_dense", message: "the captions track is dense" }] }));
    for (const review of ["review", "review-2"]) {
      mkdirSync(join(dir, "media", review), { recursive: true });
      writeFileSync(join(dir, "media", review, "snapshot.log"), "phone frame at each beat, wide sheet saved\n");
    }
  };
  const r = fixtureRun("week-over-week", "2026-11-23", { items: kitWords, as: "restyled", beforeFinal: restyled });
  assert.equal(r.first.status, 0, `the first scan: ${r.first.out}`);
  assert.equal(r.final.status, 0, `the last scan, a scene restyled and the render logged: ${r.final.out}`);
});

// A pair a description holds inside one of the kit's own phrases ("swiss francs", "Hong Kong" of "Hong Kong dollars")
// is the kit's words, not a name: compute writes it for every figure in that currency. A customer's name beside a kit
// word is still a name, and its word alone is still found outside the kit's phrase.
test("a description pair inside one of the kit's phrases is no one's name; a customer named Hong still is", () => {
  const inCurrency = (currency, description, amount) => ({ ...txn("2026-11-18T12:00:00Z", currency, "charge", amount, Math.round(amount * 0.03)), description });
  const items = [inCurrency("chf", "paid in swiss francs", 5000), inCurrency("hkd", "Hong Kong dollars refund", 40000), inCurrency("eur", "Euro Transfer Fee", 3000), described("Commission for Anna Hong", 20000)];
  const r = fixtureRun("week-over-week", "2026-11-23", { items, as: "kit-phrase-pairs" });
  assert.equal(r.first.status, 0, `the first scan: ${r.first.out}`);
  assert.equal(r.final.status, 0, `the last scan: ${r.final.out}`);
  for (const [n, said] of [["pair", "Thank you, Anna Hong."], ["alone", "Thanks, Hong."]]) {
    const leak = fixtureRun("week-over-week", "2026-11-23", { items, said, as: `kit-phrase-pairs-${n}` });
    customerData(leak.first, `said "${said}"`);
    assert.match(leak.first.out, /media\/vo\.txt/);
  }
});

// After billing (scan --final), a name's word found alone only warns: the run's answer keeps tool and kit words on
// purpose (a kept warning's code, timeline_track_too_dense), and one can share a word with a description ("Track Day
// Pass"). The warning names the file and the line, never the word. A whole description, a name pair or an email still
// stops the film at --final, and before billing a word alone still does.
test("after billing a word alone only warns, naming the file and line; a name still stops the film", () => {
  const kept = { checks: { warnings_kept: ["timeline_track_too_dense on captions: expected"] } };
  const r = fixtureRun("week-over-week", "2026-11-23", { items: [described("Track Day Pass", 6500)], as: "warn-after-billing", answer: kept });
  assert.equal(r.first.status, 0, `the first scan: ${r.first.out}`);
  assert.equal(r.final.status, 4, `the last scan warns, not fails, and asks for one more --final: ${r.final.out}`);
  const line = readFileSync(join(r.dir, "media", "answer.json"), "utf8").split("\n").findIndex((l) => l.includes("timeline_track_too_dense")) + 1;
  assert.ok(line > 1, "the answer is written one field to a line");
  assert.match(r.final.err, new RegExp(`^warning: a customer's word may be in media/answer\\.json line ${line} \\(words-alone check, not a failure after billing\\)$`, "m"));
  assert.doesNotMatch(r.final.err, /track/i, "the warning never prints the word");
  // The first --final that warns keeps the raw pages for one more --final after the agent's edit, notes the files and
  // lines it warned on (never a word), and says so; it is not the clean last scan.
  assert.ok(existsSync(join(r.dir, "stripe", PAGE)), "the raw pages stay for the one rerun");
  const said = JSON.parse(r.final.out.split("\n").find((l) => l.startsWith("{")));
  assert.equal(said.clean, false, "the first --final that warns is not the clean last scan");
  assert.deepEqual(said.raw_pages_removed, []);
  assert.deepEqual(JSON.parse(readFileSync(join(r.dir, "stripe", PAGE), "utf8"))[MARK], { warned: [{ file: "media/answer.json", line }] }, "the note is in the raw pages");
  assert.ok(!existsSync(join(r.dir, "media", "final-warned.json")), "no note the run's own files hold");
  assert.match(r.final.err, /run scan --pages stripe --final once more/);
  // On a line that holds a key and its string ("note": "..."), the line is still found, its value read unescaped.
  const keyed = fixtureRun("week-over-week", "2026-11-23", { items: [described("Track Day Pass", 6500)], as: "warn-key-line", answer: { note: "Kept:\ntimeline_track_too_dense" } });
  const keyLine = readFileSync(join(keyed.dir, "media", "answer.json"), "utf8").split("\n").findIndex((l) => l.includes('"note"')) + 1;
  assert.equal(keyed.final.status, 4, keyed.final.out);
  assert.match(keyed.final.err, new RegExp(`media/answer\\.json line ${keyLine} \\(`));
  // A whole name said at --final still stops it, and keeps the raw pages.
  const named = fixtureRun("week-over-week", "2026-11-23", { items: [described("Track Day Pass", 6500), described("Commission for Marisol Quintero", 20000)], as: "named-after-billing", answer: { ...kept, thanks: "Thank you, Marisol Quintero." } });
  assert.equal(named.first.status, 0, `the first scan: ${named.first.out}`);
  customerData(named.final, `the last scan, a name pair in the answer: ${named.final.out}`);
  assert.ok(existsSync(join(named.dir, "stripe", PAGE)), "the raw pages stay when the film is stopped");
  // Before billing, a word alone still stops the film.
  customerData(scanRun("word-before-billing", [described("Commission for Marisol Quintero", 20000)], { "media/vo.txt": "Thanks, Marisol." }), "the first scan, a first name alone in the narration");
});

// The one rerun: after a warning the agent edits the text (or not) and runs --final once more. That run is the last: a
// whole value, a pair or an email still stops the film; a word alone warns again and is fine; and either way the raw
// pages and the note of the warning go. It never asks for another.
test("after a warning, one more --final checks the agent's edit and is the last", () => {
  const items = [described("Track Day Pass", 6500), described("Commission for Marisol Quintero", 20000)];
  const kept = { checks: { warnings_kept: ["timeline_track_too_dense on captions: expected"] } };
  const finalAgain = (dir) => {
    const r = spawnSync(process.execPath, [join(dir, "film", "metrics.mjs"), "scan", "--pages", join(dir, "stripe"), "--root", dir, "--final"], { encoding: "utf8", cwd: dir });
    return { status: r.status, out: r.stdout + r.stderr, err: r.stderr };
  };
  const editAnswer = (dir, change) => {
    const path = join(dir, "media", "answer.json");
    writeFileSync(path, JSON.stringify(change(JSON.parse(readFileSync(path, "utf8"))), null, 1));
  };
  const pages = (dir) => existsSync(join(dir, "stripe", PAGE));
  const marker = (dir) => markOf(dir) !== undefined;
  const warnedRun = (as, answer) => {
    const r = fixtureRun("week-over-week", "2026-11-23", { items, as, answer });
    assert.equal(r.final.status, 4, `${as}, the first --final: ${r.final.out}`);
    assert.match(r.final.err, /^warning: /m, `${as}, the first --final warns`);
    assert.ok(pages(r.dir) && marker(r.dir), `${as}: the first --final that warns keeps the raw pages`);
    return r.dir;
  };
  // (1) The edit pastes an email: the rerun stops the film, the pages stay.
  const email = warnedRun("rerun-email", { note: "Thanks, Marisol." });
  editAnswer(email, (a) => ({ ...a, note: "Thanks to our customer (marisol@example.com)." }));
  const r1 = finalAgain(email);
  customerData(r1, `an email pasted after the warning: ${r1.out}`);
  const gone = (r, dir) => {
    assert.ok(!pages(dir) && !marker(dir), "the last --final removes the raw pages and the note even when it stops the film");
    const said = JSON.parse(r.out.split("\n").find((l) => l.startsWith("{")));
    assert.equal(said.clean, false);
    assert.equal(said.raw_pages_removed.length, 1);
  };
  gone(r1, email);
  // (2) The edit leaves the whole name: the rerun stops the film.
  const pair = warnedRun("rerun-pair", { note: "Thanks, Marisol." });
  editAnswer(pair, (a) => ({ ...a, note: "Thanks, Marisol Quintero." }));
  const r2 = finalAgain(pair);
  customerData(r2, `a name pair left after the warning: ${r2.out}`);
  gone(r2, pair);
  // (3) A clean edit: the rerun is clean, the pages and the note go.
  const clean = warnedRun("rerun-clean", { note: "Thanks, Marisol." });
  editAnswer(clean, ({ note, ...a }) => a);
  const r3 = finalAgain(clean);
  assert.equal(r3.status, 0, r3.out);
  assert.equal(JSON.parse(r3.out.split("\n").find((l) => l.startsWith("{"))).clean, true);
  assert.ok(!pages(clean) && !marker(clean), "a clean rerun removes the raw pages and the note");
  // (4) No edit (the line held a tool's word): the rerun warns again, is fine, and is the last.
  const none = warnedRun("rerun-no-edit", kept);
  const r4 = finalAgain(none);
  assert.equal(r4.status, 0, r4.out);
  assert.match(r4.err, /^warning: a customer's word may be in media\/answer\.json line \d+ /m, "the word warns again");
  assert.doesNotMatch(r4.err, /once more/, "the rerun never asks for another");
  assert.equal(JSON.parse(r4.out.split("\n").find((l) => l.startsWith("{"))).clean, true, "the rerun is the clean last scan");
  assert.ok(!pages(none) && !marker(none), "the rerun removes the raw pages and the note");
});

// ---------- the HARD read r3 ----------
const pagesLeft = (dir) => readdirSync(join(dir, "stripe")).filter((f) => FILED.test(f));
const finalIn = (dir, ...extra) => {
  const r = spawnSync(process.execPath, [join(dir, "film", "metrics.mjs"), "scan", "--pages", join(dir, "stripe"), "--root", dir, "--final", ...extra], { encoding: "utf8", cwd: dir });
  return { status: r.status, out: r.stdout + r.stderr, err: r.stderr };
};
const KEPT_CODE = { checks: { warnings_kept: ["timeline_track_too_dense on captions: expected"] } };
// A run whose first --final warned on the answer alone ("track" of "Track Day Pass"): exit 4, the pages kept and noted.
const warnedOnce = (as) => {
  const r = fixtureRun("week-over-week", "2026-11-23", { items: [described("Track Day Pass", 6500), described("Commission for Marisol Quintero", 20000)], as, answer: KEPT_CODE });
  assert.equal(r.final.status, 4, `${as}, the first --final: ${r.final.out}`);
  assert.ok(pagesLeft(r.dir).length === 1 && markOf(r.dir) !== undefined, `${as}: the first warn-only --final keeps the pages, noted`);
  return r.dir;
};

test("after billing, a word alone in what the film says or shows stops it; in the answer it warns, unless it is an identity name's", () => {
  const items = [described("Commission for Marisol Quintero", 20000)];
  // A re-voice whose new script says the first name: fal's timestamps of it, at --final.
  const revoice = fixtureRun("week-over-week", "2026-11-23", { items, as: "r3-revoice-word", beforeFinal: (dir) => writeFileSync(join(dir, "media", "voiceover-2-timestamps.json"), JSON.stringify(spokenAs("[warm] A good week. Thanks, Marisol."))) });
  customerData(revoice.final, `the re-voice says "Thanks, Marisol.": ${revoice.final.out}`);
  assert.match(revoice.final.out, /voiceover-2-timestamps\.json/);
  // The same words in the captions file and in a scene's shown text.
  for (const [n, path, write] of [
    ["vtt", "media/film.vtt", (dir) => appendFileSync(join(dir, "media", "film.vtt"), "\n00:00:19.000 --> 00:00:20.000\nThanks, Marisol.\n")],
    ["scene", "film/compositions/thanks.html", (dir) => writeFileSync(join(dir, "film", "compositions", "thanks.html"), "<div>Thanks, Marisol.</div>")],
  ]) {
    const r = fixtureRun("week-over-week", "2026-11-23", { items, as: `r3-${n}-word`, beforeFinal: write });
    customerData(r.final, `${path} holds "Thanks, Marisol.": ${r.final.out}`);
    assert.match(r.final.out, new RegExp(path.replace(/[./]/g, "\\$&")));
    assert.ok(pagesLeft(r.dir).length === 1, "a first --final that stops the film keeps the pages for the fix");
  }
  // In the answer, a description's word alone only warns.
  const answer = fixtureRun("week-over-week", "2026-11-23", { items, as: "r3-answer-word", answer: { note: "Thanks, Marisol." } });
  wordWarned(answer.final, "media/answer.json", `the answer says "Thanks, Marisol.": ${answer.final.out}`);
  // An identity field's name: its word alone stops the film in the answer too.
  const identity = fixtureRun("week-over-week", "2026-11-23", { items: [billedTo("Jordan White")], as: "r3-answer-identity", answer: { note: "Thank you, Ms White." } });
  customerData(identity.final, `the answer says the billing surname: ${identity.final.out}`);
  assert.match(identity.final.out, /media\/answer\.json/);
});

test("a re-voice's script is scanned before it is sent: agent.md's step 6 runs the scan before the voiceover-2 submit, which refuses a name's word", () => {
  const agent = readFileSync(new URL("../templates/metrics-video/agent.md", import.meta.url), "utf8");
  const step6 = agent.slice(agent.indexOf("## 6. "), agent.indexOf("## 7. "));
  const scanAt = step6.indexOf("`node film/metrics.mjs scan --pages stripe`");
  const submitAt = step6.indexOf("mv-<stem>-voiceover-2");
  assert.ok(scanAt >= 0 && submitAt > scanAt, "step 6 scans the new script before it submits voiceover-2");
  const r = scanRun("r3-revoice-script", [described("Commission for Marisol Quintero")], { "media/vo.txt": "[warm] A good week. Thanks, Marisol." });
  customerData(r, `a re-voice script that thanks the customer: ${r.out}`);
  assert.match(r.out, /media\/vo\.txt/);
});

test("the last --final removes the filed pages on every exit: a refused --business, a page the run wrote, a throw, a signal", async () => {
  // A --business that isn't compute's (exit 2).
  const business = warnedOnce("r3-exit-business");
  const a = finalIn(business, "--business", "Someone Else");
  assert.equal(a.status, 2, a.out);
  assert.deepEqual(pagesLeft(business), [], "a refused --business on the last --final");
  // A page the run wrote itself beside the filed one (exit 3, refused).
  const gap = warnedOnce("r3-exit-gap");
  writeFileSync(join(gap, "stripe", "raw-3.json"), readFileSync(join(gap, "stripe", PAGE)));
  const b = finalIn(gap);
  assert.equal(b.status, 3, b.out);
  assert.deepEqual(pagesLeft(gap), [], "a page the run wrote, on the last --final: every filed page goes");
  // A throw: a run file it can't read (EACCES). Root reads it anyway, so the row needs a user that isn't.
  if (process.getuid?.() !== 0) {
    const thrown = warnedOnce("r3-exit-throw");
    const locked = join(thrown, "media", "locked.txt");
    writeFileSync(locked, "a note");
    chmodSync(locked, 0);
    const c = finalIn(thrown);
    assert.notEqual(c.status, 0, c.out);
    assert.match(c.out, /EACCES/);
    assert.deepEqual(pagesLeft(thrown), [], "a throw on the last --final");
    chmodSync(locked, 0o600);
  }
  // A signal while it runs: held at film/data.json (a FIFO it reads), signalled, then let go.
  for (const signal of ["SIGTERM", "SIGINT"]) {
    const dir = warnedOnce(`r3-exit-${signal}`);
    const fifo = join(dir, "film", "data.json");
    const data = readFileSync(fifo);
    unlinkSync(fifo);
    assert.equal(spawnSync("mkfifo", [fifo]).status, 0, "mkfifo");
    const child = spawn(process.execPath, [join(dir, "film", "metrics.mjs"), "scan", "--pages", join(dir, "stripe"), "--root", dir, "--final"], { cwd: dir, stdio: "ignore" });
    const closed = new Promise((ok) => child.on("close", (code, sig) => ok({ code, sig })));
    let fd;
    const until = Date.now() + 30_000;
    while (fd === undefined) {
      try {
        fd = openSync(fifo, constants.O_WRONLY | constants.O_NONBLOCK);
      } catch (e) {
        if (e.code !== "ENXIO" || Date.now() > until) throw e;
        await new Promise((ok) => setTimeout(ok, 50));
      }
    }
    child.kill(signal);
    await new Promise((ok) => setTimeout(ok, 300));
    try {
      writeSync(fd, data);
    } catch {
      // the kit is gone already
    }
    closeSync(fd);
    const ended = await closed;
    assert.deepEqual(pagesLeft(dir), [], `${signal} on the last --final: ${JSON.stringify(ended)}`);
    // The kit's work is synchronous: a signal that lands mid-scan is held until the scan ends, which removes the pages
    // (exit 0, the pages gone) or exits as the signal would (128 + its number). Never killed with the pages kept.
    assert.ok(ended.sig === null && [0, signal === "SIGTERM" ? 143 : 130].includes(ended.code), `it ends on its own after a ${signal}: ${JSON.stringify(ended)}`);
  }
});

test("exit 0 means the raw pages are gone: the first warn-only --final exits 4, and the run's own files can't make another first", () => {
  // The note is in the raw pages, not a file of the run's: deleting media's files or another --root changes nothing,
  // and the next --final is the last.
  const deleted = warnedOnce("r3-mark-deleted");
  assert.ok(!existsSync(join(deleted, "media", "final-warned.json")) && !existsSync(join(deleted, "stripe", "final-warned.json")), "no note file to delete");
  const a = finalIn(deleted);
  assert.equal(a.status, 0, a.out);
  assert.deepEqual(pagesLeft(deleted), [], "the next --final is the last");
  const rerooted = warnedOnce("r3-mark-rerooted");
  const elsewhere = join(root, "r3-elsewhere");
  mkdirSync(join(elsewhere, "media"), { recursive: true });
  writeFileSync(join(elsewhere, "media", "vo.txt"), CLEAN);
  const b = finalIn(rerooted, "--root", elsewhere);
  assert.notEqual(b.status, 4, b.out);
  assert.deepEqual(pagesLeft(rerooted), [], "another --root is still the last --final");
  // What does reset it: rewriting Stripe's raw page without the note (the skill never touches stripe/). The next
  // --final is a first again: it warns, keeps the pages and exits 4, never 0.
  const rewritten = warnedOnce("r3-mark-rewritten");
  const page = join(rewritten, "stripe", PAGE);
  const { [MARK]: _, ...bare } = JSON.parse(readFileSync(page, "utf8"));
  writeFileSync(page, JSON.stringify(bare));
  const c = finalIn(rewritten);
  assert.equal(c.status, 4, c.out);
  assert.equal(pagesLeft(rewritten).length, 1);
});

test("a time zone in data.json that no machine knows is not the kit's phrase: a customer's name it spells is still found", () => {
  const r = scanRun("r3-zone-forged", [described("Commission for Marisol Quintero")], { "film/data.json": { business: "Larkspur Ceramics", timezone: "Marisol Quintero" }, "media/vo.txt": `${CLEAN} Thank you, Marisol Quintero.` });
  customerData(r, `a forged time zone: ${r.out}`);
  assert.match(r.out, /media\/vo\.txt/);
});

test("a file's name is read too, and never printed when it holds a customer's word", () => {
  const r = scanRun("r3-path-word", [described("Commission for Marisol Quintero")], { "media/vo.txt": CLEAN, "media/thanks-marisol.txt": "A note." });
  customerData(r, `a file named for the customer: ${r.out}`);
  assert.doesNotMatch(r.out, /marisol|quintero/i, "the file's name is not printed");
  // The words of the paths the kit and the skill name ("media", "review", "index", "timestamps") are no one's name.
  const kit = fixtureRun("week-over-week", "2026-11-23", { items: [described("Media Review Group", 6000), described("Index Timestamps Partners", 4000)], as: "r3-path-kit" });
  assert.equal(kit.first.status, 0, kit.first.out);
  assert.equal(kit.final.status, 0, kit.final.out);
});

// A path the kit or the skill names is no one's, whole: "Media Review Group" gives the pair "Media Review", which the
// review step's own media/review/snapshot.log holds, and "Film Assets Ltd" gives "Film Assets" (film/assets/). Only
// the part of a path below the kit's named folder is the run's choice, and that part is read.
const R4_ITEMS = [described("Media Review Group", 6000), described("Film Assets Ltd", 4000)];
// Stand-ins: a fake's placeholder audio with no NUL byte is read as text; a frame with one is binary.
const R4_KIT_WROTE = {
  "media/review/snapshot.log": "snapshot: 6 sheets written\n",
  "media/review-2/snapshot.log": "snapshot: 2 frames written\n",
  "media/review/frame-12.4s.png": "\u0089PNG\u0000\u0000frame",
  "film/assets/voiceover.mp3": "ID3 placeholder audio",
  "film/assets/music.mp3": "ID3 placeholder audio",
};
test("the kit's own paths are no one's name: the first scan, with the review and the voice's copy written, is clean", () => {
  const first = scanRun("r4-kit-paths-first", R4_ITEMS, { "media/vo.txt": CLEAN, ...R4_KIT_WROTE });
  assert.equal(first.status, 0, `the first scan, the kit's paths written: ${first.out}`);
});

test("the kit's own paths are no one's name: the last --final after the review step exits 0 and removes the pages", () => {
  const write = (dir) => {
    for (const [path, body] of Object.entries(R4_KIT_WROTE)) {
      mkdirSync(join(dir, path, ".."), { recursive: true });
      writeFileSync(join(dir, path), body);
    }
  };
  const run = fixtureRun("week-over-week", "2026-11-23", { items: R4_ITEMS, as: "r4-kit-paths", beforeFinal: write });
  assert.equal(run.first.status, 0, run.first.out);
  assert.equal(run.final.status, 0, `the last --final after the review and the voice were filed: ${run.final.out}`);
  assert.deepEqual(pagesLeft(run.dir), [], "the pages are gone");
});

test("a name the run chose for a file is still found under the kit's folders, and never printed", () => {
  for (const path of ["media/media-review-group.md", "media/review/media-review-group.md", "film/assets/film-assets-ltd.txt"]) {
    const r = scanRun(`r4-run-named-${path.replace(/\W+/g, "-")}`, R4_ITEMS, { "media/vo.txt": CLEAN, ...R4_KIT_WROTE, [path]: "A note." });
    customerData(r, `${path}: ${r.out}`);
    assert.doesNotMatch(r.out, /media-review-group|film-assets-ltd/i, `${path}: the file's name is not printed`);
  }
});

test("what a kit-named file holds is still read: the whole description in the review's log stops the film", () => {
  const inside = scanRun("r4-kit-path-content", R4_ITEMS, { "media/vo.txt": CLEAN, ...R4_KIT_WROTE, "media/review/snapshot.log": "snapshot of Media Review Group\n" });
  customerData(inside, `the review's log holding the description: ${inside.out}`);
});

test("code the run writes outside film/ is read for a name's words; the film's own code stays out (a stated limit)", () => {
  const items = [described("Commission for Marisol Quintero")];
  const media = scanRun("r3-run-code", items, { "media/vo.txt": CLEAN, "media/thanks.js": 'export const thanks = "Thanks, Marisol.";' });
  customerData(media, `a script the run wrote in media/: ${media.out}`);
  // The limit: film/'s .js and .css (the kit's code, and the run's restyling of it) are read for whole values, pairs
  // and emails only.
  const film = scanRun("r3-film-code", items, { "media/vo.txt": CLEAN, "film/compositions/thanks.js": 'export const thanks = "Thanks, Marisol.";' });
  assert.equal(film.status, 0, film.out);
});

// ---------- Stripe's answers as AgentRun files them ----------
// The template sets `file` on STRIPE_LIST_BALANCE_TRANSACTIONS: serve writes each answer whole at
// stripe/STRIPE_LIST_BALANCE_TRANSACTIONS-<time>-<id>.json (the time an ISO instant with : and . as -, the id 8 hex
// characters) and the model gets only a summary. The kit reads those pages, in name order (the time's), and nothing
// the run wrote there itself.
const TOOL = "STRIPE_LIST_BALANCE_TRANSACTIONS";
let filedClock = Date.parse("2026-11-23T07:00:00.000Z");
const filedName = () => `${TOOL}-${new Date((filedClock += 1234)).toISOString().replace(/[:.]/g, "-")}-${createHash("sha256").update(String(filedClock)).digest("hex").slice(0, 8)}.json`;
const composioAnswer = (list) => ({ data: list, successful: true, error: null });
const stripeList = (items, has_more = false) => ({ object: "list", data: [...items].sort((a, b) => b.created - a.created), has_more, url: "/v1/balance_transactions" });
// A run folder with these answers filed in stripe/ (each an object written as serve writes the tool's text, or a string
// written as it is), the skill installed and the kit in film/, as a run has them. Returns the folder and each filed
// name, in the order filed.
function filedFolder(name, answers) {
  const dir = join(root, `filed-${name}`);
  mkdirSync(join(dir, "stripe"), { recursive: true });
  mkdirSync(join(dir, "media"), { recursive: true });
  cpSync(SKILL, join(dir, ".agents", "skills", "metrics-video"), { recursive: true });
  cpSync(KIT, join(dir, "film"), { recursive: true });
  const names = answers.map((a) => {
    const n = filedName();
    writeFileSync(join(dir, "stripe", n), typeof a === "string" ? a : JSON.stringify(a));
    return n;
  });
  return { dir, names };
}
const kitIn = (dir, ...a) => {
  const r = spawnSync(process.execPath, [join(dir, "film", "metrics.mjs"), ...a], { encoding: "utf8", cwd: dir });
  return { status: r.status, out: r.stdout + r.stderr, stdout: r.stdout, stderr: r.stderr };
};
const computeIn = (dir, today = "2026-11-23", ...extra) => kitIn(dir, "compute", "--today", today, "--timezone", "UTC", "--pages", "stripe", "--film", "film", ...extra);
const revenueOf = (dir, c = "usd") => JSON.parse(readFileSync(join(dir, "film", "data.json"), "utf8")).currencies.find((x) => x.code === c);
// The week of 16 November: five charges and a refund, in two pages of Stripe's list (newest first).
const FILED_WEEK = [
  txn("2026-11-22T10:00:00Z", "usd", "charge", 120000, 3510),
  txn("2026-11-21T10:00:00Z", "usd", "charge", 45000, 1335),
  txn("2026-11-20T10:00:00Z", "usd", "refund", -20000),
  txn("2026-11-18T10:00:00Z", "usd", "charge", 31000, 929),
  txn("2026-11-17T10:00:00Z", "usd", "charge", 72000, 2118),
  txn("2026-11-16T10:00:00Z", "usd", "charge", 89900, 2637),
];
const FILED_PAGES = [stripeList(FILED_WEEK.slice(0, 3), true), stripeList(FILED_WEEK.slice(3), false)];
const filedNet = FILED_WEEK.reduce((s, t) => s + t.net, 0);

test("compute reads Stripe's answers as AgentRun files them: Composio's envelope at the tool's filed names, in name order", () => {
  const { dir } = filedFolder("composio", FILED_PAGES.map(composioAnswer));
  const r = computeIn(dir);
  assert.equal(r.status, 0, `compute on filed pages: ${r.out}`);
  assert.match(r.stdout, /read 2 page\(s\), 6 transactions/);
  assert.equal(revenueOf(dir).revenue.minor, filedNet, "the week's revenue is every filed transaction's net");
  // Stripe's own list, unwrapped, is a page too; and a page filed first is read first whatever its file's age.
  const plain = filedFolder("stripe-list", [FILED_PAGES[0], composioAnswer(FILED_PAGES[1])]);
  const p = computeIn(plain.dir);
  assert.equal(p.status, 0, `Stripe's list and Composio's answer, one page each: ${p.out}`);
  assert.equal(revenueOf(plain.dir).revenue.minor, filedNet);
});

test("a page filed twice (a repeated call) counts each transaction once", () => {
  const once = filedFolder("once", FILED_PAGES.map(composioAnswer));
  const twice = filedFolder("twice", [composioAnswer(FILED_PAGES[0]), composioAnswer(FILED_PAGES[0]), composioAnswer(FILED_PAGES[1]), composioAnswer(FILED_PAGES[1])]);
  const a = computeIn(once.dir);
  const b = computeIn(twice.dir);
  assert.equal(a.status, 0, a.out);
  assert.equal(b.status, 0, `a retried call files its answer again: ${b.out}`);
  assert.match(b.stdout, /6 transactions/, "each transaction id is counted once");
  assert.deepEqual(revenueOf(twice.dir), revenueOf(once.dir), "the figures don't double");
});

test("carried.json beside the pages is never a page", () => {
  const { dir } = filedFolder("carried-beside", FILED_PAGES.map(composioAnswer));
  writeFileSync(join(dir, "stripe", "carried.json"), JSON.stringify({ metric: "net-of-refunds-and-fees", timezone: "UTC", week: { start: "2026-11-09" }, figures: [] }));
  const r = computeIn(dir);
  assert.equal(r.status, 0, `a carried object in the pages' folder: ${r.out}`);
  assert.match(r.stdout, /read 2 page\(s\)/, "only the filed answers are pages");
});

test("an agent-written raw page is refused: Stripe's answers were not filed, and nothing stands in for them", () => {
  // Only a page the run wrote: refused, no figures.
  const own = filedFolder("raw-only", []);
  writeFileSync(join(own.dir, "stripe", "raw-1.json"), JSON.stringify(composioAnswer(stripeList(FILED_WEEK))));
  const a = computeIn(own.dir);
  assert.equal(a.status, 3, `a raw page alone: ${a.out}`);
  assert.match(a.stderr, /not filed/);
  assert.match(a.stderr, /file setting/);
  assert.ok(!existsSync(join(own.dir, "film", "data.json")), "no figures from a raw page");
  // A raw page beside filed ones (one the run planted): refused too, never read beside them.
  const planted = filedFolder("raw-beside", FILED_PAGES.map(composioAnswer));
  writeFileSync(join(planted.dir, "stripe", "raw-3.json"), JSON.stringify(stripeList([txn("2026-11-19T10:00:00Z", "usd", "charge", 999900, 100)])));
  const b = computeIn(planted.dir);
  assert.equal(b.status, 3, `a raw page beside the filed ones: ${b.out}`);
  assert.match(b.stderr, /not filed/);
  // The scan refuses it too: it never reads values from a page the run wrote, nor calls such a run clean.
  const s = kitIn(planted.dir, "scan", "--pages", "stripe");
  assert.notEqual(s.status, 0, `scan with a raw page: ${s.out}`);
  assert.match(s.out, /not filed/);
  assert.doesNotMatch(s.stdout, /"clean":true/);
});

test("the last --final removes the filed pages, and no scan searches them", () => {
  const items = [...FILED_WEEK, described("Commission for Marisol Quintero", 20000)];
  const { dir, names } = filedFolder("final", [composioAnswer(stripeList(items.slice(0, 4), true)), composioAnswer(stripeList(items.slice(4)))]);
  writeFileSync(join(dir, "media", "vo.txt"), CLEAN);
  const first = kitIn(dir, "scan", "--pages", "stripe");
  assert.equal(first.status, 0, `the pages hold the name, and are not a file the run wrote: ${first.out}`);
  assert.ok(JSON.parse(first.stdout).values > 0, "the scan read the customer's values from the filed pages");
  const final = kitIn(dir, "scan", "--pages", "stripe", "--final");
  assert.equal(final.status, 0, final.out);
  assert.deepEqual(readdirSync(join(dir, "stripe")).filter((f) => FILED.test(f)), [], "no filed page is left");
  assert.deepEqual(JSON.parse(final.stdout).raw_pages_removed.map((p) => p.split("/").pop()).sort(), [...names].sort());
});

test("an error answer filed beside the pages is passed over; with no list filed, compute refuses", () => {
  const error = { data: {}, successful: false, error: "Rate limited: try again" };
  const { dir } = filedFolder("error-then-pages", [error, "MCP error -32603: upstream timed out", ...FILED_PAGES.map(composioAnswer)]);
  const r = computeIn(dir);
  assert.equal(r.status, 0, `an error answer, then the pages: ${r.out}`);
  assert.equal(revenueOf(dir).revenue.minor, filedNet);
  const only = filedFolder("error-only", [error]);
  const o = computeIn(only.dir);
  assert.equal(o.status, 3, o.out);
  assert.match(o.stderr, /error/);
});

test("the template files the Stripe list where the kit reads it, and carried.json lives outside that folder", () => {
  const T = new URL("../templates/metrics-video/", import.meta.url).pathname;
  const agent = readFileSync(join(T, "agent.md"), "utf8");
  const skill = readFileSync(join(T, "skills", "metrics-video", "SKILL.md"), "utf8");
  // agent.md's mcp need: the file setting on the balance list, folder stripe, the summary's show paths; expand pinned out.
  const need = agent.slice(agent.indexOf("  - source: composio"), agent.indexOf("  - source: url"));
  assert.match(need, /\bfile:\s*\{\s*STRIPE_LIST_BALANCE_TRANSACTIONS:\s*\{\s*folder:\s*stripe,\s*show:\s*\[successful, error, data\.has_more, data\.data\.-1\.id, data\.data\.-1\.created\]\s*\}\s*\}/);
  assert.match(need, /\bpin:\s*\{\s*STRIPE_LIST_BALANCE_TRANSACTIONS:\s*\{\s*expand:\s*null\s*\}\s*\}/);
  // Every scan and compute reads that folder.
  for (const [, cmd] of [...agent.matchAll(/`(node film\/metrics\.mjs (?:scan|compute)[^`]*)`/g), ...skill.matchAll(/(node film\/metrics\.mjs (?:scan|compute)[^\n]*)/g)]) {
    if (/--pages/.test(cmd)) assert.match(cmd, /--pages stripe\b/, cmd);
  }
  // The carried object is written and read at carried.json in the run's folder, never under the filed folder (serve's
  // tool gate refuses the agent's write there).
  for (const [file, text] of [["agent.md", agent], ["SKILL.md", skill]]) {
    assert.doesNotMatch(text, /stripe\/carried\.json/, `${file} names stripe/carried.json`);
    assert.doesNotMatch(text, /raw-<n>\.json|raw-1\.json/, `${file} still has the run save raw pages`);
    for (const [, path] of text.matchAll(/--carried ([^\s\]`]+)/g)) assert.equal(path, "carried.json", `${file}: --carried ${path}`);
  }
  // And the kit reads it there.
  const { dir } = filedFolder("carried-root", [composioAnswer(stripeList([...FILED_WEEK, txn("2026-11-10T10:00:00Z", "usd", "charge", 50000, 500)]))]);
  writeFileSync(join(dir, "carried.json"), JSON.stringify({ metric: "net-of-refunds-and-fees", timezone: "UTC", week: { start: "2026-11-09", end: "2026-11-15" }, complete: true, figures: [{ currency: "usd", revenue_minor: 49500, gross_minor: 50000, charges: 1, refunds_count: 0, refunds_minor: 0, disputes_count: 0, disputes_minor: 0, fees_minor: 500 }] }));
  const w = kitIn(dir, "weeks", "--today", "2026-11-23", "--timezone", "UTC", "--carried", "carried.json");
  assert.equal(w.status, 0, w.out);
  assert.equal(JSON.parse(w.stdout).compare.with_carried, true, "the carried figures are read from carried.json");
  const c = computeIn(dir, "2026-11-23", "--carried", "carried.json");
  assert.equal(c.status, 0, c.out);
});
