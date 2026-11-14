import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { frontMatter, parseYaml } from "../lib/yaml.mjs";
import { fillParameters, parseGithubSource, readIndex } from "../lib/packages.mjs";
import { markdownToHtml } from "../lib/markdown.mjs";
import { cronWords } from "../lib/describe.mjs";
import { build } from "../build.mjs";
import { check } from "../check.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = join(here, "fixtures", "repo");
const SHA = "0123456789abcdef0123456789abcdef01234567";

test("yaml: the shapes manifests use", () => {
  const doc = parseYaml([
    "name: kyb # trailing comment",
    "harness: [pi, claude-agent]",
    "model: { tier: fast, prefer: openrouter/particle-ai/particle-1 }",
    'pattern: { type: string, pattern: "^$|^[A-Za-z]{2}(\\\\s*,\\\\s*[A-Za-z]{2})*$" }',
    "cron: '0 8 * * 1'",
    "budget: { per_run_usd: 5.00, tool_calls: 90 }",
    "mcp:",
    "  - source: github",
    "    tools: [a, b]",
    "    pin: { b: { method: [create, null] } }",
    "list:",
    "- one",
    "- 2",
    "folded: >",
    "  a b",
    "  c",
    "literal: |-",
    "  x",
    "    y",
    "multi: { a: 1,",
    "  b: [x, y] }",
    "url: https://example.com/a#b",
    "empty:",
  ].join("\n"));
  assert.deepEqual(doc, {
    name: "kyb",
    harness: ["pi", "claude-agent"],
    model: { tier: "fast", prefer: "openrouter/particle-ai/particle-1" },
    pattern: { type: "string", pattern: "^$|^[A-Za-z]{2}(\\s*,\\s*[A-Za-z]{2})*$" },
    cron: "0 8 * * 1",
    budget: { per_run_usd: 5, tool_calls: 90 },
    mcp: [{ source: "github", tools: ["a", "b"], pin: { b: { method: ["create", null] } } }],
    list: ["one", 2],
    folded: "a b c\n",
    literal: "x\n  y",
    multi: { a: 1, b: ["x", "y"] },
    url: "https://example.com/a#b",
    empty: null,
  });
});

test("yaml: refuses what it does not read", () => {
  assert.throws(() => parseYaml("a: &x 1\nb: *x"), /anchors/);
  assert.throws(() => parseYaml("a: 1\na: 2"), /duplicate key/);
  assert.throws(() => parseYaml('a: "\\q"'), /unknown escape/);
  assert.throws(() => frontMatter("---\na: 1\n"), /never closes/);
});

test("front matter splits from the body", () => {
  const { data, body } = frontMatter("---\nname: x\n---\n\n# Body\n");
  assert.deepEqual(data, { name: "x" });
  assert.equal(body, "\n# Body\n");
});

test("display names fill parameter defaults and drop the rest cleanly", () => {
  const params = { risk_appetite: { default: "medium" }, repo: {} };
  assert.equal(fillParameters("KYB due diligence (${parameters.risk_appetite} risk appetite)", params), "KYB due diligence (medium risk appetite)");
  assert.equal(fillParameters("Code review: ${parameters.repo}", params), "Code review");
  assert.equal(fillParameters("Notes (${parameters.repo} only)", params), "Notes");
});

test("github sources parse, and traversal is refused", () => {
  assert.deepEqual(parseGithubSource("github:Parcha-ai/agentrun/packages/serve/templates/kyb"), { owner: "Parcha-ai", repo: "agentrun", path: "packages/serve/templates/kyb", ref: undefined });
  assert.deepEqual(parseGithubSource("github:a/b@v1.0"), { owner: "a", repo: "b", path: "", ref: "v1.0" });
  assert.deepEqual(parseGithubSource("https://github.com/a/b/tree/main/x/y"), { owner: "a", repo: "b", path: "x/y", ref: "main" });
  assert.equal(parseGithubSource("github:a/b/../../etc"), null);
  assert.equal(parseGithubSource("github:a/b/x;rm"), null);
  assert.equal(parseGithubSource("gitlab:a/b"), null);
});

test("markdown from a package never renders its HTML or script links", () => {
  const out = markdownToHtml('# T\n\n<script>alert(1)</script>\n\n[x](javascript:alert(1)) [y](https://ok.example) ![i](data:image/png;base64,AAA)\n');
  assert.match(out, /<h3>T<\/h3>/);
  assert.doesNotMatch(out, /<script/);
  assert.doesNotMatch(out, /javascript:/);
  assert.doesNotMatch(out, /<img/);
  assert.match(markdownToHtml("![chart](https://cdn.example/c.png)"), /<a href="https:\/\/cdn\.example\/c\.png"[^>]*>chart<\/a>/, "an image is a link, never loaded");
  assert.match(out, /<a href="https:\/\/ok\.example" rel="nofollow noopener" target="_blank">y<\/a>/);
});

test("cron lines in words", () => {
  assert.equal(cronWords("0 8 * * 1"), "Mondays at 08:00");
  assert.equal(cronWords("30 6 * * *"), "every day at 06:30");
  assert.equal(cronWords("0 9 * * 1-5"), "weekdays at 09:00");
  assert.equal(cronWords("*/5 * * * *"), null);
});

test("the index is checked", () => {
  const dir = mkdtempSync(join(tmpdir(), "site-index-"));
  try {
    mkdirSync(join(dir, ".agentrun"));
    writeFileSync(join(dir, ".agentrun", "marketplace.json"), JSON.stringify({ templates: [{ name: "x", source: "./templates/x", category: "toys", tags: ["Bad Tag"] }, { name: "x", source: "ftp:nope" }] }));
    assert.throws(() => readIndex(dir), (err) => /category "toys"/.test(err.message) && /tags/.test(err.message) && /listed twice/.test(err.message));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("builds the fixture into pages that pass the checker", async () => {
  const out = mkdtempSync(join(tmpdir(), "site-dist-"));
  const cache = mkdtempSync(join(tmpdir(), "site-cache-"));
  try {
    const result = await build({ root: fixture, out, sha: SHA, offline: true, cacheDir: cache, log: () => {} });
    assert.equal(result.packages, 1);
    const { problems } = check({ dir: out, baseUrl: "https://marketplace.agentrun.ai" });
    assert.deepEqual(problems, []);
    const page = readFileSync(join(out, "templates", "sample-watch", "index.html"), "utf8");
    assert.match(page, new RegExp(`data-install="github:Parcha-ai/agentrun-templates/templates/sample-watch@${SHA}"`));
    assert.match(page, /agentrun template install github:Parcha-ai\/agentrun-templates\/templates\/sample-watch@/);
    assert.match(page, /<code>company<\/code>/);
    assert.match(page, /integer, 1 to 50/);
    assert.match(page, /\$0\.084 median per run/);
    assert.match(page, /Reads open issues on the repository you name\./);
    assert.match(page, /weekdays at 09:00 \(Europe\/Madrid\)/);
    assert.match(page, /Acme this week/, "output.json's report_markdown renders when there is no output.md");
    assert.match(page, /Illustrative\. Written by hand/, "output.md renders as written");
    assert.match(page, /Beta this week/);
    assert.doesNotMatch(page, /<script>alert|<img src=x|href="javascript:/);
    assert.doesNotMatch(page, /googleapis|gstatic/);
    assert.match(page, /font-src &#39;self&#39;/);
    for (const f of ["jetbrains-mono-latin-400-normal.woff2", "schibsted-grotesk-latin-600-normal.woff2", "jetbrains-mono-LICENSE.txt"]) {
      assert.ok(readFileSync(join(out, "assets", "fonts", f)).length > 0, f);
    }
    const md = readFileSync(join(out, "templates", "sample-watch.md"), "utf8");
    assert.match(md, /^# Sample watch\n/);
    const llms = readFileSync(join(out, "llms.txt"), "utf8");
    assert.match(llms, /\[Sample watch\]\(https:\/\/marketplace\.agentrun\.ai\/templates\/sample-watch\.md\)/);
    const search = JSON.parse(readFileSync(join(out, "search.json"), "utf8"));
    assert.equal(search[0].name, "sample-watch");
  } finally {
    rmSync(out, { recursive: true, force: true });
    rmSync(cache, { recursive: true, force: true });
  }
});
