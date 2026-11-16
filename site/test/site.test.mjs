import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { frontMatter, parseYaml } from "../lib/yaml.mjs";
import { fillParameters, parseGithubSource, readIndex, siteName } from "../lib/packages.mjs";
import { markdownToHtml } from "../lib/markdown.mjs";
import { cronWords, factsShort, keyWords, requirements, testedLine, unprovenWords } from "../lib/describe.mjs";
import { build } from "../build.mjs";
import { check } from "../check.mjs";
import { CSP, SECURITY_HEADERS, siteServer } from "../lib/server.mjs";

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
  // owner/repo with neither filled leaves no stray slash; with one filled, that one alone.
  assert.equal(fillParameters("Code review: ${parameters.owner}/${parameters.repo}", { owner: {}, repo: {} }), "Code review");
  assert.equal(fillParameters("Code review: ${parameters.owner}/${parameters.repo}", { owner: { default: "acme" }, repo: {} }), "Code review: acme");
  assert.equal(fillParameters("Code review: ${parameters.owner}/${parameters.repo}", { owner: { default: "acme" }, repo: { default: "web" } }), "Code review: acme/web");
});

test("the site names a template by the words before its setup", () => {
  assert.equal(siteName("Market monitor"), "Market monitor");
  assert.equal(siteName("Inbox assistant: ${parameters.owner_name}"), "Inbox assistant");
  assert.equal(siteName("KYB due diligence (${parameters.risk_appetite} risk appetite)"), "KYB due diligence");
  assert.equal(siteName("Revenue goal: ${parameters.goal_amount} ${parameters.currency} a ${parameters.period}"), "Revenue goal");
  assert.equal(siteName("Deal hygiene: ${parameters.pipeline_id} pipeline"), "Deal hygiene");
  // A parameter with no "Name:" or "Name (" before it leaves no name to show.
  assert.equal(siteName("Failed payments to ${parameters.channel}"), undefined);
  assert.equal(siteName("${parameters.owner_name}'s inbox"), undefined);
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

test("a package granting monid endpoints says it needs a monid key, and for which providers", () => {
  const pkg = { tools: ["read", "web_fetch", "monid:dataforseo/onpage/lighthouse", "monid:dataforseo/serp/google-organic", "monid:apollo/mixed_companies/search"], mcp: [], secrets: [], evals: ["a", "b", "c"], budget: { per_run_usd: 0.5 }, measured: null, model: { tier: "balanced" } };
  assert.deepEqual(keyWords(pkg).secrets, ["MONID_API_KEY"]);
  assert.deepEqual(requirements(pkg).map((r) => r.text), ["Requires DataForSEO, through monid", "Requires Apollo, through monid", "Requires web fetch"]);
  // Not measured: no Tested line (the page lists the cases instead).
  assert.equal(testedLine(pkg), null);
});

test("a template's requirements come from its package (tools, MCP toolkits, triggers), each a logo and one line", () => {
  const inbox = { tools: ["read", "email_search", "email_read", "email_draft", "email_file"], mcp: [], triggers: [{ source: { kind: "email", mailbox: "INBOX" } }, { source: { kind: "schedule", cron: "0 18 * * *" } }] };
  assert.deepEqual(requirements(inbox).map((r) => [r.logo, r.text]), [
    ["logo-email.svg", "Requires your email account, through AgentRun's email trigger"],
    ["logo-schedule.svg", "Runs on a schedule"],
  ]);
  assert.deepEqual(requirements({ ...inbox, triggers: [] }).map((r) => r.text), ["Requires your email account, through AgentRun's email tools"]);
  const web = {
    tools: ["web_search", "web_fetch", "read"],
    mcp: [{ source: "composio", toolkit: "gmail", required: true }, { source: "composio", toolkit: "slack", required: false }, { source: "github", toolkit: "github", required: true }, { source: "github", required: false }],
    triggers: [{ source: { kind: "github" } }, { source: { kind: "webhook" } }],
  };
  assert.deepEqual(requirements(web).map((r) => [r.logo, r.text]), [
    ["logo-github.svg", "Requires GitHub, through the AgentRun GitHub App"],
    ["logo-gmail.svg", "Requires Gmail, through Composio"],
    ["logo-exa.svg", "Requires web search, through Exa"],
    ["logo-web.svg", "Requires web fetch"],
    ["logo-webhook.svg", "Starts from a signed webhook your service sends"],
    ["logo-slack.svg", "Can use Slack, through Composio (optional)"],
  ]);
  assert.deepEqual(requirements({ tools: [], mcp: [{ source: "composio", toolkit: "github", required: true }], triggers: [] }).map((r) => r.text), ["Requires GitHub, through Composio"]);
  assert.deepEqual(requirements({ tools: ["monid:dataforseo/a/b", "monid:apollo/c"], mcp: [], triggers: [] }).map((r) => r.text), ["Requires DataForSEO, through monid", "Requires Apollo, through monid"]);
  // Nothing beyond a model: no logos.
  assert.deepEqual(requirements({ tools: ["read", "bash", "subagent"], mcp: [], triggers: [{ source: { kind: "manual" } }] }), []);
});

test("a template that prefers a free model says so first, naming the model; its measured note follows the Tested line", () => {
  const free = { tools: ["read", "web_fetch"], mcp: [], triggers: [{ source: { kind: "schedule", cron: "0 */2 * * *" } }], model: { tier: "fast", prefer: "openrouter/inclusionai/ling-3.2-flash:free" } };
  assert.deepEqual(requirements(free).map((r) => [r.logo, r.text]), [
    ["logo-free.svg", "Runs free, on Ling 3.2 Flash through OpenRouter"],
    ["logo-web.svg", "Requires web fetch"],
    ["logo-schedule.svg", "Runs on a schedule"],
  ]);
  // A paid preference is no free logo.
  assert.deepEqual(requirements({ ...free, model: { prefer: "openrouter/inclusionai/ling-3.2-flash" } }).map((r) => r.logo), ["logo-web.svg", "logo-schedule.svg"]);
  const note = "One grader was narrowed to its intent first. Under the original grader it passes 3 of 5.";
  assert.equal(testedLine({ ...free, measured: { passed: { pi: "4/5" }, note } }), `Passes 4 of 5 eval cases on pi. Not yet tried on the live web. ${note}`);
});

test("a package whose default harness is Codex, preferring no model, says a ChatGPT sign-in runs it", () => {
  const pkg = { tools: ["read"], mcp: [], secrets: [], evals: ["a"], budget: { per_run_usd: 0.1 }, measured: null, model: { tier: "balanced" }, harness: ["codex", "pi"] };
  assert.equal(keyWords(pkg).model, "A ChatGPT sign-in (Codex runs on your plan), or a model key");
  // Codex second, or a preferred model: a model key, as before.
  assert.equal(keyWords({ ...pkg, harness: ["pi", "codex"] }).model, "A model key");
  assert.match(keyWords({ ...pkg, model: { tier: "balanced", prefer: "openrouter/x/y" } }).model, /^A model key for the balanced tier/);
});

test("a web template's Tested line keeps its live-web results apart from its fixture cases", () => {
  const measured = { median_usd: 0.05, runs: 8, passed: { pi: "4/4", codex: "2/2" } };
  const pkg = { tools: ["web_search", "read"], mcp: [], secrets: [], evals: ["a", "b", "live-week"], budget: { per_run_usd: 0.5 }, model: { tier: "balanced" }, measured: { ...measured, live: { cases: 1, median_usd: 0.12, passed: { pi: "1/1", codex: "0/1" } } } };
  // No cost anywhere: a user's cost isn't known (their model, their plan), so the page never guesses it.
  assert.equal(testedLine(pkg), "Passes 4 of 4 eval cases on pi and 2 of 2 on Codex. On the live web, 1 of 1 on pi and 0 of 1 on Codex.");
  assert.equal(factsShort(pkg), "Passes 4 of 4 eval cases and 1 of 1 on the live web.");
  // Measured on fixtures alone: the page says the live web is untried, never lets the fixture count stand for it.
  assert.equal(testedLine({ ...pkg, measured }), "Passes 4 of 4 eval cases on pi and 2 of 2 on Codex. Not yet tried on the live web.");
  assert.equal(factsShort({ ...pkg, measured }), "Passes 4 of 4 eval cases; not yet tried on the live web.");
  // No web tools: nothing about the live web.
  assert.equal(testedLine({ ...pkg, tools: ["read"], measured }), "Passes 4 of 4 eval cases on pi and 2 of 2 on Codex.");
});

test("the index is checked", () => {
  const dir = mkdtempSync(join(tmpdir(), "site-index-"));
  try {
    mkdirSync(join(dir, ".agentrun"));
    writeFileSync(join(dir, ".agentrun", "marketplace.json"), JSON.stringify({ templates: [{ name: "x", source: "./templates/x", category: "toys", tags: ["Bad Tag"], summary: "Short.", guide: "javascript:alert(1)" }, { name: "x", source: "ftp:nope", setup: "", guide: "http://example.com/guide" }] }));
    assert.throws(() => readIndex(dir), (err) => /category "toys"/.test(err.message) && /tags/.test(err.message) && /listed twice/.test(err.message)
      && /templates\[0\]\.summary/.test(err.message) && /templates\[1\]\.summary/.test(err.message) && /templates\[1\]\.setup/.test(err.message)
      && /templates\[0\]\.guide/.test(err.message) && /templates\[1\]\.guide/.test(err.message));
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
    assert.match(page, /npx @parcha\/agentrun template install github:Parcha-ai\/agentrun-templates\/templates\/sample-watch@[0-9a-f]{40} --trust/);
    assert.match(page, /<code>company<\/code>/);
    assert.match(page, /integer, 1 to 50/);
    assert.doesNotMatch(page, /median|\$0\.084|Cost per run/, "no cost on a template page");
    // Above the fold, in order and nothing else: breadcrumb, title, the index's one-line summary, the logos, Install.
    assert.match(page, /<nav class="crumbs"[\s\S]*?<\/nav>\s*<section class="hero tpl-hero">\s*<h1>Sample watch<\/h1>\s*<p class="lead">Watches one topic every week and tells you what changed, each item dated and linked\.<\/p>\s*<ul class="reqs"[^>]*>[\s\S]*?<\/ul>\s*<\/section>\s*<section class="card install"/);
    assert.doesNotMatch(page, /class="chip|class="facts-line|stars and|0 stars|0 forks/, "no pills, no subtitle, no zero counts");
    // The full description opens What it does; the setup line is said once, in Install, escaped.
    assert.match(page, /<h2 id="does"[^>]*>What it does<\/h2>\s*<p>Watches one topic every week and answers with what changed/);
    assert.equal(page.match(/Connect GitHub first/g)?.length, 1);
    assert.match(page, /<section class="card install"[\s\S]*?<p class="setup">Connect GitHub first if you want it to read your issues\. It runs &lt;script&gt;alert\(1\)&lt;\/script&gt; nothing else\.<\/p>/);
    // The index's guide link sits right under the setup line, its URL escaped.
    assert.match(page, /<p class="setup">Connect GitHub first[^<]*<\/p>\s*<p class="guide"><a href="https:\/\/github\.com\/Parcha-ai\/agentrun\/blob\/main\/docs\/sample-quickstart\.md\?a=1&amp;b=2">The setup guide<\/a> walks you through it step by step\.<\/p>/);
    // Eval counts: one small Tested line in the details. Version and license sit in Source.
    assert.match(page, /<h2 id="evals"[^>]*>Tested<\/h2>\s*<p class="tested">Passes 2 of 2 eval cases on pi and 1 of 2 on Claude Code\. Not yet tried on the live web\.<\/p>/);
    assert.match(page, /<dt>Version<\/dt><dd>0\.2\.0<\/dd>/);
    // The requirements row, read off the package: web search, web fetch, the schedule, the optional GitHub tools. Each a
    // self-hosted logo with its line, shown on hover and on keyboard focus (CSS), and read by a screen reader.
    const reqs = /<ul class="reqs" aria-label="What it requires">([\s\S]*?)<\/ul>/.exec(page)?.[1] ?? "";
    assert.match(reqs, /<li class="req" tabindex="0"><img src="\/assets\/logo-exa\.svg\?v=[0-9a-f]+" alt="" width="18" height="18"><span class="req-tip">Requires web search, through Exa<\/span><\/li>/);
    assert.deepEqual([...reqs.matchAll(/<span class="req-tip">([^<]*)<\/span>/g)].map((m) => m[1]), ["Requires web search, through Exa", "Requires web fetch", "Runs on a schedule", "Can use GitHub, through the AgentRun GitHub App (optional)"]);
    assert.doesNotMatch(page, /Dependencies/);
    const home = readFileSync(join(out, "index.html"), "utf8");
    // A card: title, summary, logos. No pills.
    assert.match(home, /<li class="card tpl" data-name="sample-watch">\s*<h3><a href="\/templates\/sample-watch\/">Sample watch<\/a><\/h3>\s*<p class="desc">Watches one topic every week and tells you what changed, each item dated and linked\.<\/p>\s*<ul class="reqs" aria-label="What it requires"><li class="req" tabindex="0"><img src="\/assets\/logo-exa\.svg[^>]*><span class="req-tip">[^<]*<\/span><\/li>[\s\S]*?<\/ul>\s*<\/li>/);
    assert.doesNotMatch(home, /median|\$0\.0|class="chip/, "no cost and no pills on a card");
    // Square corners everywhere: every radius in the stylesheet is 0.
    const css = readFileSync(join(out, "assets", "site.css"), "utf8");
    assert.deepEqual([...css.matchAll(/(?:border-radius|-radius):\s*([^;}]+)/g)].map((m) => m[1].trim()).filter((v) => v !== "0" && v !== "var(--ar-card-radius)" && v !== "var(--ar-control-radius)"), []);
    assert.match(css, /--ar-control-radius: 0;/);
    assert.match(css, /--ar-card-radius: 0;/);
    assert.match(page, /Reads open issues on the repository you name\./);
    assert.match(page, /weekdays at 09:00 \(Europe\/Madrid\)/);
    assert.match(page, /Acme this week/, "output.json's report_markdown renders when there is no output.md");
    assert.match(page, /Illustrative\. Written by hand/, "output.md renders as written");
    assert.match(page, /Beta this week/);
    assert.doesNotMatch(page, /<script>alert|<img src=x|href="javascript:/);
    assert.doesNotMatch(page, /googleapis|gstatic/);
    assert.doesNotMatch(page, /http-equiv/, "the CSP is a header the server sends, not a meta tag");
    for (const f of ["jetbrains-mono-latin-400-normal.woff2", "schibsted-grotesk-latin-600-normal.woff2", "jetbrains-mono-LICENSE.txt"]) {
      assert.ok(readFileSync(join(out, "assets", "fonts", f)).length > 0, f);
    }
    const md = readFileSync(join(out, "templates", "sample-watch.md"), "utf8");
    assert.match(md, /^# Sample watch\n/);
    assert.match(md, /^\[The setup guide\]\(https:\/\/github\.com\/Parcha-ai\/agentrun\/blob\/main\/docs\/sample-quickstart\.md\?a=1&b=2\) walks you through it step by step\.$/m);
    assert.match(md, /2 eval cases: injection, thin-data\./);
    // model.choices: each choice, its keys, and its warning word for word, escaped on the page.
    assert.match(page, /<dt>Model choices<\/dt><dd>At install you can keep that, or pick one of these:<ul class="choices"><li><strong>Free model<\/strong>: <code>openrouter\/example\/free-1:free<\/code> on <code>pi<\/code>, needs <code>OPENROUTER_API_KEY<\/code>\. <strong>Warning:<\/strong> Its provider may log what it reads &lt;script&gt;alert\(1\)&lt;\/script&gt;\. Free accounts get 50 requests a day\.<\/li><\/ul><\/dd>/);
    assert.match(md, /^- Model choices, picked at install instead:\n {2}- Free model: `openrouter\/example\/free-1:free` on `pi`, needs `OPENROUTER_API_KEY`\. Warning: Its provider may log what it reads \\<script\\>alert\(1\)\\<\/script\\>\. Free accounts get 50 requests a day\.$/m);
    assert.match(md, /^Watches one topic every week and tells you what changed, each item dated and linked\.$/m);
    assert.match(md, /^Passes 2 of 2 eval cases on pi and 1 of 2 on Claude Code\. Not yet tried on the live web\.$/m);
    assert.match(md, /^Requires web search, through Exa\. Requires web fetch\. Runs on a schedule\. Can use GitHub, through the AgentRun GitHub App \(optional\)\.$/m);
    assert.doesNotMatch(md, /median|\$0\.084|Cost per run/);
    assert.match(page, /<meta name="description" content="Watches one topic every week and tells you what changed, each item dated and linked\. Passes 2 of 2 eval cases; not yet tried on the live web\."/);
    const llms = readFileSync(join(out, "llms.txt"), "utf8");
    assert.match(llms, /\[Sample watch\]\(https:\/\/marketplace\.agentrun\.ai\/templates\/sample-watch\.md\)/);
    const search = JSON.parse(readFileSync(join(out, "search.json"), "utf8"));
    assert.equal(search[0].name, "sample-watch");
  } finally {
    rmSync(out, { recursive: true, force: true });
    rmSync(cache, { recursive: true, force: true });
  }
});

test("the server sends the security headers on every answer, serves index pages, and keeps requests inside the site", async () => {
  const dir = mkdtempSync(join(tmpdir(), "site-serve-"));
  mkdirSync(join(dir, "templates", "kyb"), { recursive: true });
  writeFileSync(join(dir, "index.html"), "home");
  writeFileSync(join(dir, "404.html"), "missing");
  writeFileSync(join(dir, "templates", "kyb", "index.html"), "kyb");
  writeFileSync(join(tmpdir(), "outside-site.txt"), "secret");
  const server = siteServer({ root: dir });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const got = async (path, init) => {
      const res = await fetch(base + path, { redirect: "manual", ...init });
      return { status: res.status, body: await res.text(), headers: res.headers };
    };
    for (const [path, status, body] of [["/", 200, "home"], ["/templates/kyb/", 200, "kyb"], ["/nope", 404, "missing"], ["/..%2Foutside-site.txt", 404, "missing"], ["/%E0%A4%A", 404, "missing"]]) {
      const res = await got(path);
      assert.equal(res.status, status, path);
      assert.equal(res.body, body, path);
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) assert.equal(res.headers.get(name), value, `${path} ${name}`);
    }
    const redirect = await got("/templates/kyb?x=1");
    assert.equal(redirect.status, 301);
    assert.equal(redirect.headers.get("location"), "/templates/kyb/?x=1");
    assert.equal(redirect.headers.get("content-security-policy"), CSP);
    const post = await got("/", { method: "POST", body: "x" });
    assert.equal(post.status, 405);
    assert.match(CSP, /frame-ancestors 'none'/);
    assert.match(CSP, /script-src 'self'(;|$)/);
  } finally {
    await new Promise((ok) => server.close(ok));
    rmSync(dir, { recursive: true, force: true });
    rmSync(join(tmpdir(), "outside-site.txt"), { force: true });
  }
});

test("a template whose tools come through Composio says it is not yet proven live, until proven-live.json lists it", () => {
  const pkg = { mcp: [{ source: "composio", toolkit: "gmail" }, { source: "composio", toolkit: "slack" }, { source: "composio", toolkit: "slack" }], provenLive: null };
  assert.equal(unprovenWords(pkg), "No one has run this against real Gmail and Slack accounts through Composio yet. Its eval cases use stand-ins.");
  assert.equal(unprovenWords({ ...pkg, provenLive: "2026-11-20" }), null);
  assert.equal(unprovenWords({ mcp: [{ source: "github", toolkit: "github" }], provenLive: null }), null);
  assert.equal(unprovenWords({ mcp: [], provenLive: null }), null);
});
