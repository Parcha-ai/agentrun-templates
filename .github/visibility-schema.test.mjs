// ai-search-visibility's output schema holds the robots.txt read rules in code, checked by serve's own validator
// (answer-json.js schemaCheck, the one a run's answer is held to): a bot with no group of its own in a robots.txt read
// but not to its end is unknown with rule null; a bot whose own group was cut at the end of the read is unknown with
// rule null; and a read to the end has no cut group.
// Run: AGENTRUN_SERVE_DIR=<folder @parcha/agentrun-serve is installed in> node --test .github/visibility-schema.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const serveDir = process.env.AGENTRUN_SERVE_DIR;
if (!serveDir) throw new Error("set AGENTRUN_SERVE_DIR to the folder @parcha/agentrun-serve is installed in");
const pkgJson = createRequire(join(serveDir, "x.js")).resolve("@parcha/agentrun-serve/package.json");
const { schemaCheck } = await import(pathToFileURL(join(dirname(pkgJson), "dist/answer-json.js")));
const schema = JSON.parse(readFileSync(join(import.meta.dirname, "..", "templates/ai-search-visibility/visibility.schema.json"), "utf8"));
const checker = schemaCheck(schema);
assert.equal(checker.why, undefined, `the schema does not compile: ${checker.why}`);

/** A whole answer the schema takes, with robots_txt and one crawler as given. */
const answer = (robots, crawler) => ({
  site: "northwind-tools.example",
  brand: "Northwind Tools",
  robots_txt: { url: "https://northwind-tools.example/robots.txt", ...robots },
  crawlers: [{ bot: "GPTBot", operator: "OpenAI", purpose: "training", ...crawler }],
  llms_txt: { status: "not_found", note: "404" },
  structured_data: { checked: false, note: "The fetch tool drops script tags; check with validator.schema.org." },
  questions: [],
  fixes: [],
  could_not_check: [],
  ignored_instructions: [],
  report_markdown: "**What to fix first**\n\nNothing.",
});
const misses = (robots, crawler) => checker.check(answer(robots, crawler));

const cut = { status: "read", read_to_end: false };
const whole = { status: "read", read_to_end: true };
const allowedByStar = { verdict: "allowed", matched_group: "star", rule: "User-agent: *\nDisallow:" };
const unknownNull = (group) => ({ verdict: "unknown", matched_group: group, rule: null });

test("cut read, star group, allowed: a miss", () => {
  assert.notDeepEqual(misses(cut, allowedByStar), []);
});

test("cut read, no group, allowed: a miss", () => {
  assert.notDeepEqual(misses(cut, { verdict: "allowed", matched_group: "none", rule: null }), []);
});

test("cut read, star group, unknown with rule null: ok", () => {
  assert.deepEqual(misses(cut, unknownNull("star")), []);
});

test("cut read, own group, blocked: ok (a full group before the cut stands)", () => {
  assert.deepEqual(misses(cut, { verdict: "blocked", matched_group: "own", rule: "User-agent: GPTBot\nDisallow: /" }), []);
});

test("own group unfinished, blocked: a miss", () => {
  assert.notDeepEqual(misses(cut, { verdict: "blocked", matched_group: "own_unfinished", rule: "User-agent: GPTBot" }), []);
});

test("cut read, own group unfinished, unknown with rule null: ok", () => {
  assert.deepEqual(misses(cut, unknownNull("own_unfinished")), []);
});

test("whole read, star group, allowed: ok", () => {
  assert.deepEqual(misses(whole, allowedByStar), []);
});

test("not_found with no read_to_end, no group, allowed: ok (a missing robots.txt allows every crawler)", () => {
  assert.deepEqual(misses({ status: "not_found" }, { verdict: "allowed", matched_group: "none", rule: null }), []);
});

test("unreachable with no read_to_end, unknown: ok", () => {
  assert.deepEqual(misses({ status: "unreachable" }, unknownNull("none")), []);
});

test("read with read_to_end missing: a miss", () => {
  assert.notDeepEqual(misses({ status: "read" }, allowedByStar), []);
});

test("whole read with an unfinished own group, unknown: a miss (no group is cut in a whole read)", () => {
  assert.notDeepEqual(misses(whole, unknownNull("own_unfinished")), []);
});

test("a crawler with no matched_group: a miss", () => {
  assert.notDeepEqual(misses(whole, { verdict: "allowed", rule: null }), []);
});
