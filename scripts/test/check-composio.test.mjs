import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { checkComposio, collect } from "../check-composio.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const script = join(here, "..", "check-composio.mjs");
const realTemplates = join(here, "..", "..", "templates");
const KEY = "ck_test_key_must_never_print";

/** A templates/ folder with one agent.md per entry ({name: front matter YAML}). */
function templatesDir(t, templates) {
  const root = mkdtempSync(join(tmpdir(), "composio-check-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [name, yaml] of Object.entries(templates)) {
    mkdirSync(join(root, name));
    writeFileSync(join(root, name, "agent.md"), `---\nname: ${name}\n${yaml}\n---\nBody.\n`);
  }
  return root;
}

/** A stub of Composio's v3 API: tools and trigger types per toolkit, each list served `per` items a page by cursor.
 *  `tools` is the toolkit's latest version (toolkit_versions=latest); `baseTools`, what Composio lists without it (its
 *  base version, which leaves newer tools out). Records every call; `fail` answers the first n calls whose URL matches
 *  with a status (or a thrown network error). */
function composio({ tools = {}, baseTools = tools, events = {}, per = 1000, fail = [] } = {}) {
  const calls = [];
  const fetch = async (href, init = {}) => {
    const url = new URL(href);
    calls.push({ url, headers: init.headers ?? {} });
    for (const f of fail) {
      if (f.times > 0 && f.match.test(url.href)) {
        f.times--;
        if (f.status === "network") throw new TypeError("fetch failed");
        // Headers arrive (200), then the body: cut off, timed out, or whole but not JSON.
        if (f.status === "body-drop" || f.status === "body-timeout") {
          const why = f.status === "body-drop" ? new TypeError("terminated") : new DOMException("The operation was aborted due to timeout", "TimeoutError");
          return new Response(new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('{"items": [')); c.error(why); } }), { status: 200 });
        }
        if (f.status === "body-not-json") return new Response("<html>gateway</html>", { status: 200 });
        return new Response(JSON.stringify({ error: { message: "boom" } }), { status: f.status });
      }
    }
    let list;
    const latest = url.searchParams.get("toolkit_versions") === "latest";
    if (url.pathname === "/api/v3/tools") list = (latest ? tools : baseTools)[url.searchParams.get("toolkit_slug")] ?? [];
    else if (url.pathname === "/api/v3/triggers_types") list = events[url.searchParams.get("toolkit_slugs")] ?? [];
    else return new Response("{}", { status: 404 });
    const start = Number(url.searchParams.get("cursor") ?? 0);
    const items = list.slice(start, start + per).map((slug) => ({ slug, name: slug }));
    const next = start + per < list.length ? String(start + per) : null;
    return Response.json({ items, next_cursor: next });
  };
  return { fetch, calls };
}

const noSleep = async () => {};

const GMAIL = `mcp:
  - source: composio
    toolkit: gmail
    tools: [GMAIL_FETCH_MESSAGE_BY_THREAD_ID, GMAIL_CREATE_EMAIL_DRAFT]
    required: true
    allow: [GMAIL_FETCH_MESSAGE_BY_THREAD_ID]
    pin:
      GMAIL_CREATE_EMAIL_DRAFT: { cc: null }`;

const GMAIL_TRIGGER = `${GMAIL}
triggers:
  - name: new-mail
    source:
      kind: composio
      server: gmail
      event: GMAIL_NEW_GMAIL_MESSAGE
      config: { userId: me }
    target: { kind: start_run }`;

const LIVE = {
  tools: { gmail: ["GMAIL_FETCH_MESSAGE_BY_THREAD_ID", "GMAIL_CREATE_EMAIL_DRAFT", "GMAIL_SEND_EMAIL"], stripe: ["STRIPE_LIST_CHARGES"] },
  events: { gmail: ["GMAIL_NEW_GMAIL_MESSAGE"], stripe: ["STRIPE_CHARGE_FAILED_TRIGGER"] },
};

test("all present: exit 0 with a one-line summary", async (t) => {
  const root = templatesDir(t, { drafter: GMAIL_TRIGGER });
  const api = composio(LIVE);
  const out = await checkComposio({ root, key: KEY, fetch: api.fetch, sleep: noSleep });
  assert.equal(out.code, 0);
  assert.equal(out.lines.length, 1);
  assert.match(out.lines[0], /^composio check: ok/);
  assert.match(out.lines[0], /2 tools, 1 trigger event/);
  // One fetch per list per toolkit, each with the key as x-api-key.
  assert.equal(api.calls.length, 2);
  for (const call of api.calls) assert.equal(call.headers["x-api-key"], KEY);
});

test("a missing tool slug fails, naming the template, field and slug; the template beside it passes", async (t) => {
  const root = templatesDir(t, {
    drafter: GMAIL_TRIGGER,
    sender: `mcp:
  - source: composio
    toolkit: gmail
    tools: [GMAIL_FETCH_MESSAGE_BY_THREAD_ID, GMAIL_SEND_EMAILS]
    required: true`,
  });
  const api = composio(LIVE);
  const out = await checkComposio({ root, key: KEY, fetch: api.fetch, sleep: noSleep });
  assert.equal(out.code, 1);
  assert.deepEqual(out.lines, ["sender: mcp[0].tools: GMAIL_SEND_EMAILS is not a gmail tool on Composio (did you mean GMAIL_SEND_EMAIL?)"]);
  // The toolkit both templates use is fetched once.
  assert.equal(api.calls.filter((c) => c.url.pathname === "/api/v3/tools").length, 1);
});

test("allow and pin keys are checked as tools too", async (t) => {
  const root = templatesDir(t, {
    drafter: GMAIL_TRIGGER,
    pinned: `mcp:
  - source: composio
    toolkit: gmail
    tools: [GMAIL_CREATE_EMAIL_DRAFT]
    allow: [GMAIL_LIST_DRAFTS]
    pin:
      GMAIL_CREATE_EMAIL_DRAFT: { cc: null }
      GMAIL_DELETE_EVERYTHING: { id: null }`,
  });
  const out = await checkComposio({ root, key: KEY, fetch: composio(LIVE).fetch, sleep: noSleep });
  assert.equal(out.code, 1);
  assert.deepEqual(out.lines, [
    "pinned: mcp[0].allow: GMAIL_LIST_DRAFTS is not a gmail tool on Composio",
    "pinned: mcp[0].pin: GMAIL_DELETE_EVERYTHING is not a gmail tool on Composio",
  ]);
});

test("a missing trigger event fails, in source.event and in accept; the template beside it passes", async (t) => {
  const root = templatesDir(t, {
    drafter: GMAIL_TRIGGER,
    payments: `mcp:
  - source: composio
    toolkit: stripe
    tools: [STRIPE_LIST_CHARGES]
triggers:
  - name: failed
    source:
      kind: composio
      server: stripe
      event: STRIPE_CHARGE_FAILED
      accept:
        - event: STRIPE_CHARGE_REFUNDED_TRIGGER
          where: [{ pointer: /data/x, in: [true] }]
    target: { kind: start_run }`,
  });
  const out = await checkComposio({ root, key: KEY, fetch: composio(LIVE).fetch, sleep: noSleep });
  assert.equal(out.code, 1);
  assert.deepEqual(out.lines, [
    "payments: triggers[0].source.event: STRIPE_CHARGE_FAILED is not a stripe trigger event on Composio (did you mean STRIPE_CHARGE_FAILED_TRIGGER?)",
    "payments: triggers[0].source.accept[0].event: STRIPE_CHARGE_REFUNDED_TRIGGER is not a stripe trigger event on Composio",
  ]);
});

test("tools are read at the toolkit's latest version, which lists tools its base version leaves out", async (t) => {
  const root = templatesDir(t, {
    newer: `mcp:
  - source: composio
    toolkit: linear
    tools: [LINEAR_LIST_ISSUES_BY_TEAM_ID]`,
    gone: `mcp:
  - source: composio
    toolkit: linear
    tools: [LINEAR_REMOVED_LONG_AGO]`,
  });
  const api = composio({ tools: { linear: ["LINEAR_LIST_LINEAR_ISSUES", "LINEAR_LIST_ISSUES_BY_TEAM_ID"] }, baseTools: { linear: ["LINEAR_LIST_LINEAR_ISSUES"] } });
  const out = await checkComposio({ root, key: KEY, fetch: api.fetch, sleep: noSleep });
  assert.deepEqual(out.lines, ["gone: mcp[0].tools: LINEAR_REMOVED_LONG_AGO is not a linear tool on Composio"]);
  assert.equal(out.code, 1);
  assert.ok(api.calls.every((c) => c.url.searchParams.get("toolkit_versions") === "latest"));
});

test("paging: every page of tools and trigger types is read by cursor", async (t) => {
  const root = templatesDir(t, {
    deep: `mcp:
  - source: composio
    toolkit: gmail
    tools: [GMAIL_T7]
triggers:
  - name: late
    source: { kind: composio, server: gmail, event: GMAIL_E5 }
    target: { kind: start_run }`,
  });
  const api = composio({
    tools: { gmail: ["GMAIL_T1", "GMAIL_T2", "GMAIL_T3", "GMAIL_T4", "GMAIL_T5", "GMAIL_T6", "GMAIL_T7"] },
    events: { gmail: ["GMAIL_E1", "GMAIL_E2", "GMAIL_E3", "GMAIL_E4", "GMAIL_E5"] },
    per: 2,
  });
  const out = await checkComposio({ root, key: KEY, fetch: api.fetch, sleep: noSleep });
  assert.equal(out.code, 0, out.lines.join("\n"));
  const tools = api.calls.filter((c) => c.url.pathname === "/api/v3/tools");
  const events = api.calls.filter((c) => c.url.pathname === "/api/v3/triggers_types");
  assert.deepEqual(tools.map((c) => c.url.searchParams.get("cursor")), [null, "2", "4", "6"]);
  assert.deepEqual(events.map((c) => c.url.searchParams.get("cursor")), [null, "2", "4"]);
  // The same paging with the slug absent fails: the pages were read, not skipped.
  const gone = composio({ tools: { gmail: ["GMAIL_T1", "GMAIL_T2", "GMAIL_T3"] }, events: { gmail: ["GMAIL_E5"] }, per: 2 });
  const missing = await checkComposio({ root, key: KEY, fetch: gone.fetch, sleep: noSleep });
  assert.equal(missing.code, 1);
  assert.deepEqual(missing.lines, ["deep: mcp[0].tools: GMAIL_T7 is not a gmail tool on Composio"]);
});

test("no key: exit 1 with COMPOSIO_API_KEY is not set, and no call to Composio", async (t) => {
  const root = templatesDir(t, { drafter: GMAIL_TRIGGER });
  const api = composio(LIVE);
  for (const key of [undefined, "", "   "]) {
    const out = await checkComposio({ root, key, fetch: api.fetch, sleep: noSleep });
    assert.equal(out.code, 1);
    assert.deepEqual(out.lines, ["COMPOSIO_API_KEY is not set"]);
  }
  assert.equal(api.calls.length, 0);
  // With the key, the same folder passes.
  assert.equal((await checkComposio({ root, key: KEY, fetch: api.fetch, sleep: noSleep })).code, 0);
});

test("network failures retry briefly, then fail naming the toolkit; the key is never printed", async (t) => {
  const root = templatesDir(t, { drafter: GMAIL_TRIGGER });
  const flaky = composio({ ...LIVE, fail: [{ match: /\/tools\?/, status: "network", times: 1 }, { match: /triggers_types/, status: 503, times: 1 }] });
  const slept = [];
  const ok = await checkComposio({ root, key: KEY, fetch: flaky.fetch, sleep: async (ms) => void slept.push(ms) });
  assert.equal(ok.code, 0, ok.lines.join("\n"));
  assert.equal(slept.length, 2);

  const down = composio({ ...LIVE, fail: [{ match: /\/tools\?/, status: 502, times: 99 }] });
  const out = await checkComposio({ root, key: KEY, fetch: down.fetch, sleep: noSleep });
  assert.equal(out.code, 1);
  assert.equal(out.lines.length, 1);
  assert.match(out.lines[0], /gmail/);
  assert.match(out.lines[0], /HTTP 502/);
  assert.equal(down.calls.filter((c) => c.url.pathname === "/api/v3/tools").length, 3);
  assert.ok(!out.lines.join("\n").includes(KEY));

  // A 401 is not retried.
  const refused = composio({ ...LIVE, fail: [{ match: /./, status: 401, times: 99 }] });
  const denied = await checkComposio({ root, key: KEY, fetch: refused.fetch, sleep: noSleep });
  assert.equal(denied.code, 1);
  assert.match(denied.lines[0], /HTTP 401/);
  assert.equal(refused.calls.length, 1);
  assert.ok(!denied.lines.join("\n").includes(KEY));
});

test("a body cut off or timed out after its headers is retried like a failed fetch; a whole body that is not JSON fails at once", async (t) => {
  const root = templatesDir(t, { drafter: GMAIL_TRIGGER });
  const flaky = composio({ ...LIVE, fail: [{ match: /\/tools\?/, status: "body-drop", times: 1 }, { match: /triggers_types/, status: "body-timeout", times: 1 }] });
  const slept = [];
  const ok = await checkComposio({ root, key: KEY, fetch: flaky.fetch, sleep: async (ms) => void slept.push(ms) });
  assert.equal(ok.code, 0, ok.lines.join("\n"));
  assert.equal(slept.length, 2);

  const cut = composio({ ...LIVE, fail: [{ match: /\/tools\?/, status: "body-drop", times: 99 }] });
  const out = await checkComposio({ root, key: KEY, fetch: cut.fetch, sleep: noSleep });
  assert.equal(out.code, 1);
  assert.match(out.lines[0], /gmail/);
  assert.match(out.lines[0], /body cut off/);
  assert.match(out.lines[0], /after 3 tries/);
  assert.equal(cut.calls.filter((c) => c.url.pathname === "/api/v3/tools").length, 3);

  const html = composio({ ...LIVE, fail: [{ match: /\/tools\?/, status: "body-not-json", times: 99 }] });
  const bad = await checkComposio({ root, key: KEY, fetch: html.fetch, sleep: noSleep });
  assert.equal(bad.code, 1);
  assert.match(bad.lines[0], /not JSON/);
  assert.equal(html.calls.filter((c) => c.url.pathname === "/api/v3/tools").length, 1, "a body that is not JSON is not retried");
});

test("non-Composio MCP entries and non-Composio triggers are not checked", async (t) => {
  const root = templatesDir(t, {
    urls: `mcp:
  - source: url
    toolkit: github
    tools: [get_release_by_tag]
triggers:
  - name: daily
    source: { kind: schedule, cron: "0 8 * * 1" }
    target: { kind: start_run }`,
    drafter: GMAIL_TRIGGER,
  });
  const api = composio(LIVE);
  const out = await checkComposio({ root, key: KEY, fetch: api.fetch, sleep: noSleep });
  assert.equal(out.code, 0, out.lines.join("\n"));
  // The Composio template beside them is checked (gmail's tools and events read), and only it is counted.
  assert.equal(api.calls.length, 2);
  assert.ok(api.calls.every((c) => (c.url.searchParams.get("toolkit_slug") ?? c.url.searchParams.get("toolkit_slugs")) === "gmail"));
  assert.match(out.lines[0], /2 tools, 1 trigger event/);
});

test("collect reads the repo's own templates", () => {
  const refs = collect(realTemplates);
  const has = (r) => refs.some((x) => Object.entries(r).every(([k, v]) => x[k] === v));
  assert.ok(has({ template: "follow-up-drafter", kind: "tool", toolkit: "gmail", field: "mcp[0].tools", slug: "GMAIL_CREATE_EMAIL_DRAFT" }));
  assert.ok(has({ template: "follow-up-drafter", kind: "tool", toolkit: "gmail", field: "mcp[0].pin", slug: "GMAIL_CREATE_EMAIL_DRAFT" }));
  assert.ok(has({ template: "follow-up-drafter", kind: "event", toolkit: "gmail", field: "triggers[0].source.event", slug: "GMAIL_NEW_GMAIL_MESSAGE" }));
  assert.ok(!refs.some((x) => x.template === "release-shipped" && x.toolkit === "github" && x.slug === "get_release_by_tag"));
});

test("cli: no key exits 1 and says so", () => {
  const env = { ...process.env };
  delete env.COMPOSIO_API_KEY;
  const run = spawnSync(process.execPath, [script], { env, encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.match(run.stdout + run.stderr, /COMPOSIO_API_KEY is not set/);
});
