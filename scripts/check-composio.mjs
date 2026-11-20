#!/usr/bin/env node
// Checks that every Composio tool and trigger event a template names still exists in Composio's live list, so a slug
// Composio renamed or removed is caught here instead of at an owner's apply.
//
// What it reads, from each templates/<name>/agent.md front matter:
//   mcp[i] with source: composio   its toolkit, and the tool slugs in tools, allow and the keys of pin
//   triggers[i].source with kind: composio   its server (the package's toolkit name) and event, and each accept[].event
// Each toolkit's tools and trigger types are fetched once, every page, with the calls the AgentRun server makes
// (GET /api/v3/tools?toolkit_slug=, GET /api/v3/triggers_types?toolkit_slugs=, paged by cursor, key in x-api-key), plus
// toolkit_versions=latest: without it the tools list is the toolkit's base version (00000000_00), which leaves out tools
// added since (on 2026-11-18, linear 21 of 48, stripe 33 of 435). Trigger types answer the latest version either way.
//
//   COMPOSIO_API_KEY=... node scripts/check-composio.mjs [templates-dir]
//
// Exit 0 with one summary line when everything exists; exit 1 with one line per missing slug, or one line saying why
// the check could not run (no key, Composio unreachable). The key is sent only as a header and never printed.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { frontMatter } from "../site/lib/yaml.mjs";

const BASE = "https://backend.composio.dev";
const TOOLS_PAGE = 200;
const EVENTS_PAGE = 100;
const MAX_PAGES = 50;
const TRIES = 3;
const BACKOFF_MS = [1000, 3000];
const TIMEOUT_MS = 30_000;

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const slugOf = (v) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** Every Composio tool and trigger event the templates under `root` name: {template, kind: tool|event, toolkit, field, slug}. */
export function collect(root) {
  const refs = [];
  for (const name of readdirSync(root).sort()) {
    const file = join(root, name, "agent.md");
    if (!statSync(join(root, name)).isDirectory() || !existsSync(file)) continue;
    let data;
    try {
      ({ data } = frontMatter(readFileSync(file, "utf8")));
    } catch (error) {
      throw new Error(`${name}: agent.md front matter does not parse: ${error.message}`);
    }
    const add = (kind, toolkit, field, slug) => {
      const s = slugOf(slug);
      if (s) refs.push({ template: name, kind, toolkit, field, slug: s });
    };
    (Array.isArray(data.mcp) ? data.mcp : []).forEach((need, i) => {
      if (!isObject(need) || need.source !== "composio") return;
      const toolkit = slugOf(need.toolkit)?.toLowerCase();
      if (!toolkit) return;
      for (const slug of Array.isArray(need.tools) ? need.tools : []) add("tool", toolkit, `mcp[${i}].tools`, slug);
      for (const slug of Array.isArray(need.allow) ? need.allow : []) add("tool", toolkit, `mcp[${i}].allow`, slug);
      for (const slug of isObject(need.pin) ? Object.keys(need.pin) : []) add("tool", toolkit, `mcp[${i}].pin`, slug);
    });
    (Array.isArray(data.triggers) ? data.triggers : []).forEach((trigger, i) => {
      const source = isObject(trigger) ? trigger.source : undefined;
      if (!isObject(source) || source.kind !== "composio") return;
      // A package's trigger names its toolkit as `server` (AgentRun maps it to the server the owner saved at apply).
      const toolkit = slugOf(source.server)?.toLowerCase();
      if (!toolkit) return;
      add("event", toolkit, `triggers[${i}].source.event`, source.event);
      (Array.isArray(source.accept) ? source.accept : []).forEach((rule, j) => {
        if (isObject(rule)) add("event", toolkit, `triggers[${i}].source.accept[${j}].event`, rule.event);
      });
    });
  }
  return refs;
}

class FetchError extends Error {}

/** One GET, retried on a network error, a timeout, 429 or 5xx; any other non-2xx fails at once. */
async function getJson(url, { key, fetch, sleep }) {
  let last = "";
  for (let attempt = 1; attempt <= TRIES; attempt++) {
    let response;
    try {
      response = await fetch(url, { headers: { "x-api-key": key, accept: "application/json" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (error) {
      last = error?.name === "TimeoutError" ? `no answer in ${TIMEOUT_MS / 1000}s` : `network error (${error?.cause?.code ?? error?.message ?? "fetch failed"})`;
    }
    if (response) {
      if (response.ok) {
        try {
          return await response.json();
        } catch {
          throw new FetchError(`answered HTTP ${response.status} with a body that is not JSON`);
        }
      }
      last = `HTTP ${response.status}`;
      if (response.status !== 429 && response.status < 500) throw new FetchError(last);
    }
    if (attempt < TRIES) await sleep(BACKOFF_MS[attempt - 1] ?? BACKOFF_MS.at(-1));
  }
  throw new FetchError(`${last} after ${TRIES} tries`);
}

/** Every slug in one paged Composio list. */
async function listAll(path, page, ctx) {
  const slugs = new Set();
  let cursor;
  for (let n = 0; n < MAX_PAGES; n++) {
    const url = `${BASE}${path}&limit=${page}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const body = await getJson(url, ctx);
    if (!isObject(body) || !Array.isArray(body.items)) throw new FetchError("answered without an items list");
    for (const item of body.items) if (isObject(item) && slugOf(item.slug)) slugs.add(item.slug.trim());
    cursor = slugOf(body.next_cursor);
    if (!cursor) return slugs;
  }
  throw new FetchError(`still had more after ${MAX_PAGES} pages`);
}

function distance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = row;
  }
  return prev[b.length];
}

/** The live slug a missing one most plausibly became, when one is obvious: the same slug in another case, one that
 *  only adds or drops a trailing _WORD (STRIPE_CHARGE_FAILED / STRIPE_CHARGE_FAILED_TRIGGER), or the one live slug
 *  within a typo's reach (an edit distance of at most max(2, length/10)). */
export function nearMatch(slug, live) {
  const want = slug.toUpperCase();
  const all = [...live];
  const same = all.find((s) => s.toUpperCase() === want);
  if (same) return same;
  const extended = all.filter((s) => s.toUpperCase().startsWith(`${want}_`) || want.startsWith(`${s.toUpperCase()}_`)).sort((x, y) => x.length - y.length);
  if (extended.length === 1 || (extended.length > 1 && extended[0].length < extended[1].length)) return extended[0];
  const reach = Math.max(2, Math.floor(want.length / 10));
  let best;
  let tie = false;
  for (const s of all) {
    const d = distance(want, s.toUpperCase());
    if (d > reach) continue;
    if (!best || d < best.d) [best, tie] = [{ s, d }, false];
    else if (d === best.d) tie = true;
  }
  return best && !tie ? best.s : undefined;
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** The check. `fetch` and `sleep` are injectable for tests. Returns {code, lines}; never throws. */
export async function checkComposio({ root, key, fetch = globalThis.fetch, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) }) {
  key = typeof key === "string" ? key.trim() : "";
  if (!key) return { code: 1, lines: ["COMPOSIO_API_KEY is not set"] };
  let refs;
  try {
    refs = collect(root);
  } catch (error) {
    return { code: 1, lines: [`composio check: ${error.message}`] };
  }
  const ctx = { key, fetch, sleep };
  const lists = { tool: new Map(), event: new Map() };
  for (const kind of ["tool", "event"]) {
    for (const toolkit of [...new Set(refs.filter((r) => r.kind === kind).map((r) => r.toolkit))].sort()) {
      const what = kind === "tool" ? "tools" : "trigger types";
      try {
        const live =
          kind === "tool"
            ? await listAll(`/api/v3/tools?toolkit_slug=${encodeURIComponent(toolkit)}&toolkit_versions=latest`, TOOLS_PAGE, ctx)
            : await listAll(`/api/v3/triggers_types?toolkit_slugs=${encodeURIComponent(toolkit)}&toolkit_versions=latest`, EVENTS_PAGE, ctx);
        lists[kind].set(toolkit, live);
      } catch (error) {
        const why = error instanceof FetchError ? error.message : String(error?.message ?? error);
        return { code: 1, lines: [`composio check: could not read the ${toolkit} toolkit's ${what} from Composio: ${why}`] };
      }
    }
  }
  const lines = [];
  for (const ref of refs) {
    const live = lists[ref.kind].get(ref.toolkit);
    if (live.has(ref.slug)) continue;
    const near = nearMatch(ref.slug, live);
    const noun = ref.kind === "tool" ? "tool" : "trigger event";
    lines.push(`${ref.template}: ${ref.field}: ${ref.slug} is not a ${ref.toolkit} ${noun} on Composio${near ? ` (did you mean ${near}?)` : ""}`);
  }
  if (lines.length) return { code: 1, lines };
  const unique = (kind) => new Set(refs.filter((r) => r.kind === kind).map((r) => `${r.toolkit}/${r.slug}`)).size;
  const toolkits = new Set(refs.map((r) => r.toolkit)).size;
  const templates = new Set(refs.map((r) => r.template)).size;
  return {
    code: 0,
    lines: [`composio check: ok, ${plural(unique("tool"), "tool")}, ${plural(unique("event"), "trigger event")} in ${plural(toolkits, "toolkit")} across ${plural(templates, "template")} all exist on Composio`],
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] ? resolve(process.argv[2]) : join(dirname(fileURLToPath(import.meta.url)), "..", "templates");
  const { code, lines } = await checkComposio({ root, key: process.env.COMPOSIO_API_KEY });
  for (const line of lines) (code ? console.error : console.log)(line);
  process.exitCode = code;
}
