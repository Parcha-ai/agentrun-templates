// Tests for lint-handoff-size.mjs: its worst case must be at least as large as any value the schema lets through, as
// previousResultOf serializes it (JSON.stringify(output, null, 2), measured in UTF-8 bytes), and a string it cannot
// bound must be reported. Run: node --test .github/
import { test } from "node:test";
import assert from "node:assert/strict";
import { measureCarried } from "./lint-handoff-size.mjs";

const NO_CONTROL = (n) => `^[^\\u0000-\\u001f\\ud800-\\udfff]{0,${n}}$`;
const carrying = (field) => ({ "x-carried": ["s"], type: "object", additionalProperties: false, properties: { s: field } });
const handedOn = (value) => Buffer.byteLength(JSON.stringify({ s: value }, null, 2));

function coversValue(field, value) {
  const { bytes, problems } = measureCarried(carrying(field));
  assert.deepEqual(problems, []);
  assert.ok(bytes >= handedOn(value), `worst case ${bytes} B is under ${handedOn(value)} B for ${JSON.stringify(value)}`);
  return bytes;
}

test("a non-ASCII value counts above an ASCII fill", () => {
  const field = { type: "string", maxLength: 10, pattern: NO_CONTROL(10) };
  coversValue(field, "é".repeat(10)); // 2 bytes each
  coversValue(field, "€".repeat(10)); // 3 bytes each
  coversValue(field, "😀".repeat(10)); // one code point, 4 bytes each
});

test("a quote or backslash value counts its escapes", () => {
  coversValue({ type: "string", maxLength: 10, pattern: NO_CONTROL(10) }, '"\\'.repeat(5)); // each escapes to 2 bytes
});

test("a control character counts as its \\u00XX escape", () => {
  coversValue({ type: "string", maxLength: 10, pattern: "^.{0,10}$" }, "\u0001".repeat(10)); // 6 bytes each
});

test("a lone surrogate counts as its \\uDXXX escape", () => {
  coversValue({ type: "string", maxLength: 10, pattern: "^[^\\u0000-\\u001f]{0,10}$" }, "\ud800".repeat(10)); // 6 bytes each
});

test("maxLength alone bounds no bytes: AgentRun's check counts grapheme clusters", () => {
  // typebox 1.3.27 (the submit tool's check) takes "e" plus any number of combining marks as one character.
  const { problems } = measureCarried(carrying({ type: "string", maxLength: 2 }));
  assert.equal(problems.length, 1);
  assert.match(problems[0], /grapheme/);
});

test("a pattern of ASCII classes is sized exactly", () => {
  const field = { type: "string", maxLength: 200, pattern: "^[A-Za-z0-9_]{1,200}$" };
  assert.equal(coversValue(field, "a".repeat(200)), handedOn("a".repeat(200)));
});

test("format date is 10 ASCII characters", () => {
  const field = { type: "string", format: "date" };
  assert.equal(coversValue(field, "2026-11-20"), handedOn("2026-11-20"));
});

test("a pattern with no end, no anchors or an open quantifier is reported", () => {
  for (const pattern of ["^[a-z]+$", "^[a-z]*$", "^[a-z]{2,}$", "[a-z]{0,10}", "^[a-z]{0,10}"]) {
    const { problems } = measureCarried(carrying({ type: "string", maxLength: 10, pattern }));
    assert.equal(problems.length, 1, pattern);
    assert.match(problems[0], /pattern/, pattern);
  }
});
