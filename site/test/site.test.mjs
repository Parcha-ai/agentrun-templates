import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { frontMatter, parseYaml } from "../lib/yaml.mjs";
import { fillParameters, parseGithubSource, readIndex, siteName } from "../lib/packages.mjs";
import { markdownToHtml } from "../lib/markdown.mjs";
import { cronWords, factsShort, isFree, isTriggered, keyWords, provenWords, requirements, testedLine, triggerLines, unprovenWords } from "../lib/describe.mjs";
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
  // A url need on a server with its own name (a console preset) says that name and its logo; a feed trigger says it.
  assert.deepEqual(requirements({ tools: [], mcp: [{ source: "url", toolkit: "github", required: true }, { source: "url", toolkit: "parallel", required: false }, { source: "url", toolkit: "acme", required: true }], triggers: [{ source: { kind: "feed" } }] }).map((r) => [r.logo, r.text]), [
    ["logo-github.svg", "Requires GitHub, through its own MCP server"],
    ["logo-plug.svg", "Requires the acme MCP server"],
    ["logo-web.svg", "Starts from a public feed it checks"],
    ["logo-plug.svg", "Can use Parallel Search, through its own MCP server (optional)"],
  ]);
});

test("each trigger kind is said in words", () => {
  const lines = (triggers, parameters = []) => triggerLines({ triggers, parameters }).map((l) => l.text).slice(0, -1);
  assert.deepEqual(lines([{ source: { kind: "composio", server: "github", event: "GITHUB_ISSUE_CREATED_TRIGGER" }, max_active_runs: 3 }, { source: { kind: "composio", server: "stripe", event: "STRIPE_CHARGE_FAILED" } }]), [
    "A GitHub event through Composio: issue created. At most 3 at once.",
    "A Stripe event through Composio: charge failed.",
  ]);
  assert.deepEqual(lines([{ source: { kind: "feed", urls: ["https://github.com/${parameters.owner}/${parameters.repo}/releases.atom"] } }, { source: { kind: "feed", urls: "${parameters.status_feeds}", every_s: 1800 } }]), [
    "Checks https://github.com/<owner>/<repo>/releases.atom every 15 minutes: each new or updated item starts one run.",
    "Checks the feeds you list (an empty list: none) every 30 minutes: each new or updated item starts one run.",
  ]);
  // A kind the site doesn't know yet still gets a line.
  assert.deepEqual(lines([{ source: { kind: "email" } }]), ["An email trigger."]);
});

test("a template that prefers a free model says so first, naming the model; its measured note follows the Tested line", () => {
  const free = { tools: ["read", "web_fetch"], mcp: [], triggers: [{ source: { kind: "schedule", cron: "0 */2 * * *" } }], model: { tier: "fast", prefer: "openrouter/inclusionai/ling-3.2-flash:free" } };
  assert.deepEqual(requirements(free).map((r) => [r.logo, r.text]), [
    ["logo-free.svg", "Runs free, on Ling 3.2 Flash through OpenRouter"],
    ["logo-web.svg", "Requires web fetch"],
    ["logo-schedule.svg", "Runs on a schedule"],
  ]);
  // A model's size reads as its maker writes it (31B), and an instruction-tuned suffix (-it, -instruct) is left off.
  const named = (prefer) => requirements({ ...free, model: { prefer } })[0].text;
  assert.equal(named("openrouter/google/gemma-4-31b-it:free"), "Runs free, on Gemma 4 31B through OpenRouter");
  assert.equal(named("openrouter/nvidia/nemotron-nano-9b-v2:free"), "Runs free, on Nemotron Nano 9B V2 through OpenRouter");
  assert.equal(named("openrouter/meta-llama/llama-4-70b-instruct:free"), "Runs free, on Llama 4 70B through OpenRouter");
  // A mixture-of-experts size names its active parameters too: A55B, as NVIDIA writes it.
  assert.equal(named("openrouter/nvidia/nemotron-3-ultra-550b-a55b:free"), "Runs free, on Nemotron 3 Ultra 550B A55B through OpenRouter");
  // A vision-language tag is written in capitals: Super VL.
  assert.equal(named("openrouter/nvidia/nemotron-3.5-super-vl:free"), "Runs free, on Nemotron 3.5 Super VL through OpenRouter");
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
    // The coding-agent path carries this listing's immutable source, distinct from header setup.
    assert.match(page, /data-template-picker[^>]*>Install with your agent/);
    assert.match(page, /<dialog class="setup-dialog" data-template-prompt-dialog aria-labelledby="template-prompt-title">/);
    assert.match(page, /<textarea aria-label="Template installation prompt"[^>]*>Help me install the Sample watch template on my existing AgentRun\./);
    assert.match(page, new RegExp(`Pinned template source: github:Parcha-ai/agentrun-templates/templates/sample-watch@${SHA}`));
    assert.match(page, /<details data-template-prompt-fallback>/, "the prompt is readable without JavaScript");
    assert.match(page, /<script src="\/assets\/template-prompt\.js\?v=[a-f0-9]+" defer><\/script>/);
    assert.match(readFileSync(join(out, "templates", "sample-watch.md"), "utf8"), /### Install with your agent[\s\S]*Pinned template source: github:Parcha-ai\/agentrun-templates\/templates\/sample-watch@/);
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
    assert.match(home, /<h1>Marketplace<\/h1>/);
    assert.equal(home.match(/<h1>/g)?.length, 1);
    assert.match(home, /class="hero gallery-hero hero-home"[\s\S]*?<a class="btn btn-sm gallery-action" href="\/list-your-template\/">List your template<\/a>/);
    // A card: title, summary, logos. No pills.
    assert.match(home, /<li class="card tpl" data-name="sample-watch">\s*<h3><a href="\/templates\/sample-watch\/">Sample watch<\/a><\/h3>\s*<p class="desc">Watches one topic every week and tells you what changed, each item dated and linked\.<\/p>\s*<ul class="reqs" aria-label="What it requires"><li class="req" tabindex="0"><img src="\/assets\/logo-exa\.svg[^>]*><span class="req-tip">[^<]*<\/span><\/li>[\s\S]*?<\/ul>\s*<\/li>/);
    assert.doesNotMatch(home, /median|\$0\.0|class="chip/, "no cost and no pills on a card");
    // The shared website header is followed directly by page content, without a duplicate navigation row.
    for (const file of ["index.html", "templates/sample-watch/index.html", "categories/research/index.html", "list-your-template/index.html", "404.html"]) {
      const rendered = readFileSync(join(out, file), "utf8");
      assert.equal(rendered.match(/<header class="marketing-header">/g)?.length, 1, file);
      assert.match(rendered, /<link rel="stylesheet" href="\/assets\/header\.css\?v=[a-f0-9]+">/);
      assert.match(rendered, /<a href="https:\/\/agentrun\.ai\/platform\/self-improving">/);
      assert.doesNotMatch(rendered, /market-nav|Browse templates/);
      assert.match(rendered, /<script type="module" src="\/assets\/header\.js\?v=[a-f0-9]+"><\/script>/);
      assert.match(rendered, /<link rel="stylesheet" href="\/homepage\/onboarding\.css\?v=[a-f0-9]+">/);
      assert.match(rendered, /data-shared-onboarding/);
    }
    const listing = readFileSync(join(out, "list-your-template", "index.html"), "utf8");
    assert.match(listing, /<button[^>]*data-copy="Help me list my AgentRun template[^"]*template validate[^"]*"[^>]*hidden>Copy prompt<\/button>/, "the agent prompt has a copy button");
    assert.match(readFileSync(join(out, "list-your-template.md"), "utf8"), /## Have your agent list it[\s\S]*Help me list my AgentRun template/);
    for (const f of ["index.html", "list-your-template/index.html"]) assert.doesNotMatch(readFileSync(join(out, f), "utf8"), /eyebrow/, `no label above the title on ${f}`);
    // Over the cards: the tabs (all, then each category with templates, each a real page), then search. The fixture
    // has no free template, so there is no Free tab and no /free/ page.
    assert.match(home, /<nav class="tabs" id="categories" aria-label="Categories"><a href="\/" aria-current="page">All <span class="n">1<\/span><\/a><a href="\/categories\/research\/">Research <span class="n">1<\/span><\/a><\/nav>\s*<form class="search"/);
    assert.doesNotMatch(home, /href="\/free\/"/);
    assert.equal(existsSync(join(out, "free", "index.html")), false);
    const category = readFileSync(join(out, "categories", "research", "index.html"), "utf8");
    assert.match(category, /<a class="btn btn-sm gallery-action" href="\/list-your-template\/">List your template<\/a>/);
    assert.match(category, /<a href="\/categories\/research\/" aria-current="page">Research <span class="n">1<\/span><\/a>/);
    assert.match(category, /<input id="q" name="q" type="search"[^>]*data-search>/, "a category page searches its own cards");
    // The address box takes what people type ("agentrun.example.com"): the script adds https, the browser must not refuse it first.
    assert.match(page, /<form method="dialog" data-install-form novalidate>/);
    assert.match(page, /<input id="ar-address" name="address" type="text" inputmode="url"/);
    // Sample output comes right after Install, before the details.
    assert.ok(page.indexOf('id="sample"') < page.indexOf('id="does"') && page.indexOf('id="install"') < page.indexOf('id="sample"'));
    // Marketplace surfaces stay square; shared website onboarding keeps its own styling.
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
    for (const f of ["jetbrains-mono-latin-400-normal.woff2", "inter-latin-600-normal.woff2", "jetbrains-mono-LICENSE.txt"]) {
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
    assert.deepEqual(search[0].needs, ["Requires web search, through Exa", "Requires web fetch", "Runs on a schedule", "Can use GitHub, through the AgentRun GitHub App (optional)"], "search finds a template by what it requires");
    assert.equal(search[0].source, `github:Parcha-ai/agentrun-templates/templates/sample-watch@${SHA}`, "a console installs from the list what the page's Install installs");
    assert.equal(search[0].summary, JSON.parse(readFileSync(join(fixture, ".agentrun", "marketplace.json"), "utf8")).templates[0].summary, "and shows the card's one line");
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

test("a template that prefers a free model gets the Free tab and the /free/ page", async () => {
  const root = mkdtempSync(join(tmpdir(), "site-free-"));
  const out = mkdtempSync(join(tmpdir(), "site-dist-"));
  const cache = mkdtempSync(join(tmpdir(), "site-cache-"));
  try {
    cpSync(fixture, root, { recursive: true });
    const manifest = join(root, "templates", "sample-watch", "agent.md");
    const text = readFileSync(manifest, "utf8");
    const free = text.replace("prefer: openrouter/particle-ai/particle-1", "prefer: openrouter/example/free-1:free");
    assert.notEqual(free, text, "the fixture has a preferred model to replace");
    writeFileSync(manifest, free);
    await build({ root, out, sha: SHA, offline: true, cacheDir: cache, log: () => {} });
    assert.deepEqual(check({ dir: out, baseUrl: "https://marketplace.agentrun.ai" }).problems, []);
    const home = readFileSync(join(out, "index.html"), "utf8");
    assert.match(home, /<a href="\/" aria-current="page">All <span class="n">1<\/span><\/a><a href="\/free\/">Free <span class="n">1<\/span><\/a><a href="\/categories\/research\/">/);
    const page = readFileSync(join(out, "free", "index.html"), "utf8");
    assert.match(page, /<h1>Free templates<\/h1>/);
    assert.match(page, /<a href="\/free\/" aria-current="page">Free <span class="n">1<\/span><\/a>/);
    assert.match(page, /<li class="card tpl" data-name="sample-watch">/);
    assert.match(page, /<span class="req-tip">Runs free, on Free 1 through OpenRouter<\/span>/);
    assert.match(readFileSync(join(out, "free.md"), "utf8"), /^# Free templates\n[\s\S]*\[Sample watch\]\(https:\/\/marketplace\.agentrun\.ai\/templates\/sample-watch\.md\)/);
    assert.match(readFileSync(join(out, "sitemap.xml"), "utf8"), /<loc>https:\/\/marketplace\.agentrun\.ai\/free\/<\/loc>/);
    assert.match(readFileSync(join(out, "index.md"), "utf8"), /^Free to run: https:\/\/marketplace\.agentrun\.ai\/free\.md$/m);
  } finally {
    for (const d of [root, out, cache]) rmSync(d, { recursive: true, force: true });
  }
});

test("a template that starts on an event gets the Triggers tab and the /triggers/ page; a schedule alone does not", async () => {
  // The fixture's only trigger is a schedule: no Triggers tab (the first build test checks its tabs). Add a feed.
  assert.equal(isTriggered({ triggers: [{ source: { kind: "schedule", cron: "0 9 * * 1" } }] }), false);
  assert.equal(isTriggered({ triggers: [] }), false);
  assert.equal(isTriggered({}), false);
  for (const kind of ["composio", "feed", "email", "github", "webhook"]) assert.equal(isTriggered({ triggers: [{ source: { kind } }] }), true, kind);
  const root = mkdtempSync(join(tmpdir(), "site-triggers-"));
  const out = mkdtempSync(join(tmpdir(), "site-dist-"));
  const cache = mkdtempSync(join(tmpdir(), "site-cache-"));
  try {
    cpSync(fixture, root, { recursive: true });
    const manifest = join(root, "templates", "sample-watch", "agent.md");
    const text = readFileSync(manifest, "utf8");
    const feed = text.replace("triggers:\n", 'triggers:\n  - name: news\n    source: { kind: feed, urls: ["https://example.com/feed.xml"] }\n    target: { kind: start_run, input: { content: "A new item." } }\n');
    assert.notEqual(feed, text, "the fixture has a triggers list to add to");
    writeFileSync(manifest, feed);
    // A second template, on its schedule alone: in All, never on the Triggers page.
    cpSync(join(root, "templates", "sample-watch"), join(root, "templates", "sample-digest"), { recursive: true });
    writeFileSync(join(root, "templates", "sample-digest", "agent.md"), text.replace("name: sample-watch", "name: sample-digest").replace('display_name: "Sample watch:', 'display_name: "Sample digest:'));
    const index = join(root, ".agentrun", "marketplace.json");
    const market = JSON.parse(readFileSync(index, "utf8"));
    market.templates.push({ ...market.templates[0], name: "sample-digest", source: "./templates/sample-digest", summary: "Sends one digest of a topic every week, on a schedule and nothing else." });
    writeFileSync(index, JSON.stringify(market));
    await build({ root, out, sha: SHA, offline: true, cacheDir: cache, log: () => {} });
    assert.deepEqual(check({ dir: out, baseUrl: "https://marketplace.agentrun.ai" }).problems, []);
    const home = readFileSync(join(out, "index.html"), "utf8");
    assert.match(home, /<a href="\/" aria-current="page">All <span class="n">2<\/span><\/a><a href="\/triggers\/">Triggers <span class="n">1<\/span><\/a><a href="\/categories\/research\/">/);
    assert.match(home, /<li class="card tpl" data-name="sample-digest">/, "the schedule-only template is in All");
    const page = readFileSync(join(out, "triggers", "index.html"), "utf8");
    assert.match(page, /<h1>Templates that start on an event<\/h1>/);
    assert.match(page, /<a href="\/triggers\/" aria-current="page">Triggers <span class="n">1<\/span><\/a>/);
    assert.match(page, /<form class="search" role="search" action="\/triggers\/" method="get">/);
    assert.deepEqual([...page.matchAll(/<li class="card tpl" data-name="([^"]+)">/g)].map((m) => m[1]), ["sample-watch"]);
    const md = readFileSync(join(out, "triggers.md"), "utf8");
    assert.match(md, /^# Templates that start on an event\n[\s\S]*\[Sample watch\]\(https:\/\/marketplace\.agentrun\.ai\/templates\/sample-watch\.md\)/);
    assert.doesNotMatch(md, /sample-digest|Sample digest/);
    assert.match(readFileSync(join(out, "sitemap.xml"), "utf8"), /<loc>https:\/\/marketplace\.agentrun\.ai\/triggers\/<\/loc>/);
    assert.match(readFileSync(join(out, "index.md"), "utf8"), /^Start on an event: https:\/\/marketplace\.agentrun\.ai\/triggers\.md$/m);
  } finally {
    for (const d of [root, out, cache]) rmSync(d, { recursive: true, force: true });
  }
});

test("learning reads as on for true and for an object of the loop's settings, and says what it keeps", async () => {
  const root = mkdtempSync(join(tmpdir(), "site-learning-"));
  const cache = mkdtempSync(join(tmpdir(), "site-cache-"));
  const outs = [];
  try {
    cpSync(fixture, root, { recursive: true });
    const manifest = join(root, "templates", "sample-watch", "agent.md");
    const text = readFileSync(manifest, "utf8");
    for (const [value, on] of [["true", true], ["{ agree_on: [summary_markdown], compile_after: 5 }", true], ["false", false]]) {
      const changed = text.replace(/^learning: true$/m, `learning: ${value}`);
      assert.ok(value === "true" || changed !== text, "the fixture has learning: true to replace");
      writeFileSync(manifest, changed);
      const out = mkdtempSync(join(tmpdir(), "site-dist-"));
      outs.push(out);
      await build({ root, out, sha: SHA, offline: true, cacheDir: cache, log: () => {} });
      const page = readFileSync(join(out, "templates", "sample-watch", "index.html"), "utf8");
      const said = /<dt>Learning<\/dt><dd>([^<]*)<\/dd>/.exec(page)?.[1];
      assert.equal(said, on ? "On: it keeps your corrections and compiles a job it repeats into a workflow." : "Off.", `learning: ${value}`);
      assert.match(readFileSync(join(out, "templates", "sample-watch.md"), "utf8"), new RegExp(`^- Learning: ${on ? "on" : "off"}$`, "m"), `learning: ${value}`);
    }
  } finally {
    for (const d of [root, cache, ...outs]) rmSync(d, { recursive: true, force: true });
  }
});

test("a template proven live shows a logo saying against which accounts and when; a free model is recognised", () => {
  const pkg = { tools: [], triggers: [], mcp: [{ source: "composio", toolkit: "gmail", required: true }, { source: "composio", toolkit: "slack", required: true }], provenLive: "2026-11-20" };
  assert.equal(provenWords(pkg), "Proven live against real Gmail and Slack accounts on 2026-11-20");
  assert.equal(provenWords({ ...pkg, mcp: [] }), "Proven live against real accounts on 2026-11-20");
  assert.equal(provenWords({ ...pkg, provenLive: null }), null);
  assert.deepEqual(requirements(pkg).map((r) => r.logo), ["logo-proven.svg", "logo-gmail.svg", "logo-slack.svg"]);
  assert.deepEqual(requirements({ ...pkg, provenLive: null }).map((r) => r.logo), ["logo-gmail.svg", "logo-slack.svg"]);
  assert.equal(isFree({ model: { prefer: "openrouter/inclusionai/ling-3.2-flash:free" } }), true);
  assert.equal(isFree({ model: { prefer: "openrouter/inclusionai/ling-3.2-flash" } }), false);
  assert.equal(isFree({}), false);
});

test("the Ollama page gives the install, the pull and the five settings, and the footer links it", async () => {
  const out = mkdtempSync(join(tmpdir(), "site-dist-"));
  const cache = mkdtempSync(join(tmpdir(), "site-cache-"));
  try {
    await build({ root: fixture, out, sha: SHA, offline: true, cacheDir: cache, log: () => {} });
    assert.deepEqual(check({ dir: out, baseUrl: "https://marketplace.agentrun.ai" }).problems, []);
    const page = readFileSync(join(out, "ollama", "index.html"), "utf8");
    assert.match(page, /<h1>Run templates on Ollama<\/h1>/);
    assert.match(page, /curl -fsSL https:\/\/ollama\.com\/install\.sh \| sh/);
    assert.match(page, /ollama pull qwen3:8b/);
    // Ollama's 4,096-token default drops a template's question; the page makes a 32k copy and names that copy.
    assert.match(page, /printf &#39;FROM qwen3:8b\\nPARAMETER num_ctx 32768\\n&#39; &gt; Modelfile\nollama create qwen3-8b-32k -f Modelfile/);
    // The five settings a run needs, each as a service --env: the base URL, bare ids, the model, a $0 price and the ignored key.
    for (const env of ["AGENT_MODEL_BASE_URL=http://localhost:11434/v1", "AGENT_MODEL_GATEWAY_IDS=bare", "AGENT_MODEL=qwen3-8b-32k", "AGENT_MODEL_PRICE=0,0,0", "AGENT_MODEL_API_KEY=none"]) {
      assert.ok(page.includes(`--env ${env}`), env);
    }
    const md = readFileSync(join(out, "ollama.md"), "utf8");
    assert.match(md, /^# Run templates on Ollama\n/);
    assert.match(md, /^ {3}~\/\.agentrun\/bin\/agentrun service install --env AGENT_MODEL_BASE_URL=/m);
    assert.match(readFileSync(join(out, "index.html"), "utf8"), /<li><a href="\/ollama\/">Run on Ollama<\/a><\/li>/);
    assert.match(readFileSync(join(out, "index.md"), "utf8"), /^Run any template on a local model: https:\/\/marketplace\.agentrun\.ai\/ollama\.md$/m);
    assert.match(readFileSync(join(out, "sitemap.xml"), "utf8"), /<loc>https:\/\/marketplace\.agentrun\.ai\/ollama\/<\/loc>/);
  } finally {
    for (const d of [out, cache]) rmSync(d, { recursive: true, force: true });
  }
});
