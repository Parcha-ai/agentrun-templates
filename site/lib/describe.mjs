// Turns manifest fields into the plain sentences the pages show. Each function returns text (the page escapes it).

import { upperFirst } from "./util.mjs";

const DAYS = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"];

/** A cron line in words when it is a common shape, else null. */
export function cronWords(cron) {
  const parts = String(cron ?? "").trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [min, hour, dom, mon, dow] = parts;
  if (!/^\d{1,2}$/.test(min) || !/^\d{1,2}$/.test(hour) || mon !== "*") return null;
  const at = `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  if (dom === "*" && dow === "*") return `every day at ${at}`;
  if (dom === "*" && /^[0-7]$/.test(dow)) return `${DAYS[Number(dow)]} at ${at}`;
  if (dom === "*" && dow === "1-5") return `weekdays at ${at}`;
  if (/^\d{1,2}$/.test(dom) && dow === "*") return `on day ${dom} of each month at ${at}`;
  return null;
}

function resolveParam(value, pkg) {
  if (typeof value !== "string") return { value, fromParameter: null };
  const m = /^\$\{parameters\.([a-z][a-z0-9_]*)\}$/.exec(value);
  if (!m) return { value, fromParameter: null };
  const spec = pkg.parameters.find((p) => p.key === m[1]);
  return { value: spec?.default, fromParameter: m[1] };
}

/** One entry per trigger: {kind, text}. Always ends with the by-hand way. */
export function triggerLines(pkg) {
  const out = [];
  for (const t of pkg.triggers) {
    const src = t.source ?? {};
    if (src.kind === "schedule") {
      const cron = resolveParam(src.cron, pkg);
      const tz = resolveParam(src.timezone, pkg);
      const when = cron.value ? cronWords(cron.value) ?? `on the cron line ${cron.value}` : "on a schedule you set";
      const zone = tz.value ? ` (${tz.value})` : "";
      const yours = cron.fromParameter ? `, unless you pick another time when you install it` : "";
      out.push({ kind: "schedule", text: `On a schedule: ${when}${zone}${yours}.` });
    } else if (src.kind === "github") {
      for (const a of Array.isArray(src.accept) ? src.accept : []) {
        const actions = Array.isArray(a.actions) && a.actions.length ? a.actions.join(", ").replace(/_/g, " ") : "any action";
        const event = String(a.event ?? "event").replace(/_/g, " ");
        const scoped = Array.isArray(a.where) && a.where.some((w) => w?.pointer === "/repository/full_name");
        out.push({ kind: "github", text: `A GitHub ${event} on ${scoped ? "your repository" : "a repository the AgentRun GitHub App is installed on"} (${actions}). Needs the GitHub App connected.` });
      }
    } else if (src.kind === "webhook") {
      const events = (Array.isArray(src.accept) ? src.accept : []).map((a) => a?.event).filter(Boolean);
      out.push({ kind: "webhook", text: `A signed webhook${events.length ? ` (event ${events.join(", ")})` : ""}, sent by your form, CRM or any service that signs Standard Webhooks.` });
    } else if (src.kind === "composio") {
      // GITHUB_ISSUE_CREATED_TRIGGER on server github: "A GitHub event through Composio: issue created."
      const app = TOOLKIT_NAMES[src.server] ?? src.server ?? "an app's";
      const prefix = new RegExp(`^${String(src.server ?? "").toUpperCase()}_`);
      const event = String(src.event ?? "").replace(prefix, "").replace(/_TRIGGER$/, "").replace(/_/g, " ").toLowerCase();
      out.push({ kind: "composio", text: `${app === "an app's" ? "An app's" : `A ${app}`} event through Composio${event ? `: ${event}` : ""}.` });
    } else if (src.kind === "feed") {
      // urls: a list of URLs, parameters inside each shown as <name>, or one whole array parameter: the feeds you list.
      const urls = Array.isArray(src.urls) ? src.urls.map((u) => String(u).replace(/\$\{parameters\.([a-z][a-z0-9_]*)\}/g, "<$1>")) : [];
      const what = urls.length === 1 ? urls[0] : urls.length ? `${urls.length} feeds (${urls.join(", ")})` : "the feeds you list (an empty list: none)";
      const minutes = Math.round((Number.isInteger(src.every_s) ? src.every_s : 900) / 60);
      out.push({ kind: "feed", text: `Checks ${what} every ${minutes} minutes: each new or updated item starts one run.` });
    } else if (src.kind) {
      out.push({ kind: String(src.kind), text: `${/^[aeiou]/i.test(String(src.kind)) ? "An" : "A"} ${src.kind} trigger.` });
    }
    const cap = t.max_active_runs;
    if (Number.isInteger(cap) && out.length) out[out.length - 1].text += ` At most ${cap} at once.`;
  }
  out.push({ kind: "manual", text: "By hand, any time: from the console, the API or the CLI." });
  return out;
}

/** The type column of an inputs or parameters table. */
export function typeWords(spec) {
  const bits = [];
  if (spec.type === "array") bits.push(`list of ${spec.items?.type ?? "string"}`);
  else bits.push(spec.type ?? "string");
  if (Array.isArray(spec.enum)) bits.push(`one of ${spec.enum.map(String).join(", ")}`);
  if (spec.format) bits.push(spec.format);
  if (spec.minimum !== undefined && spec.maximum !== undefined) bits.push(`${spec.minimum} to ${spec.maximum}`);
  else if (spec.minimum !== undefined) bits.push(`at least ${spec.minimum}`);
  else if (spec.maximum !== undefined) bits.push(`at most ${spec.maximum}`);
  if (spec.minLength !== undefined || spec.maxLength !== undefined) bits.push(`${spec.minLength ?? 0} to ${spec.maxLength ?? "any"} characters`);
  return bits.join(", ");
}

export function modelWords(model) {
  if (!model) return "Your default model";
  const prefer = model.prefer ? `, prefers ${model.prefer}` : "";
  return `${model.tier ?? "default"} tier${prefer}`;
}

/** The models an owner may pick instead at install (model.choices), each as the package wrote it: label, model,
 *  harness, the keys it needs, and its warning and note word for word. Empty when the package offers none. */
export function modelChoices(model) {
  const list = Array.isArray(model?.choices) ? model.choices : [];
  return list
    .filter((c) => c && typeof c.label === "string" && typeof c.model === "string")
    .map((c) => ({
      label: c.label,
      model: c.model,
      harness: typeof c.harness === "string" ? c.harness : undefined,
      secrets: Array.isArray(c.secrets) ? c.secrets.filter((s) => typeof s === "string") : [],
      warning: typeof c.warning === "string" ? c.warning : undefined,
      note: typeof c.note === "string" ? c.note : undefined,
    }));
}

export function computerWords(computer) {
  if (!computer || computer[0] === "default") return "Wherever your AgentRun puts a new agent";
  return computer.map((c) => (c === "shell" ? "a computer with a shell" : c === "none" ? "no computer (file tools only)" : c)).join(", else ");
}

const PROVIDERS = { openrouter: "OpenRouter", anthropic: "Anthropic", openai: "OpenAI" };

const MONID_PROVIDERS = { dataforseo: "DataForSEO", apollo: "Apollo", keenable: "Keenable" };

/** The providers of the monid endpoints a package grants in `tools` (monid:<provider>/<endpoint>), by display name. */
export function monidProviders(pkg) {
  const slugs = pkg.tools.map((t) => /^monid:([^/]+)\//.exec(t)?.[1]).filter(Boolean);
  return [...new Set(slugs)].map((p) => MONID_PROVIDERS[p] ?? p);
}

/** The model key a run needs, read off model.prefer's provider; a package granting monid endpoints needs monid's key. */
export function keyWords(pkg) {
  const keys = [...pkg.secrets];
  if (monidProviders(pkg).length && !keys.includes("MONID_API_KEY")) keys.push("MONID_API_KEY");
  const provider = pkg.model?.prefer?.split("/")[0];
  const name = PROVIDERS[provider] ?? provider;
  const model = provider ? `A model key for the ${pkg.model.tier ?? "default"} tier; the preferred model runs with a key for ${name}` : onPlan(pkg) ? "A ChatGPT sign-in (Codex runs on your plan), or a model key" : "A model key";
  return { model, secrets: keys };
}

/** A package whose default harness (its first) is Codex and that prefers no model: on a server signed in with ChatGPT it
 *  runs on the owner's plan with no model key. */
const onPlan = (pkg) => pkg.harness?.[0] === "codex" && !pkg.model?.prefer;

const TOOLKIT_NAMES = { github: "GitHub", gmail: "Gmail", googlecalendar: "Google Calendar", slack: "Slack", linear: "Linear", hubspot: "HubSpot", stripe: "Stripe" };
/** A url need's toolkit when it is a server with its own name: the console's presets (packages.mjs MCP_PRESETS). */
const URL_NAMES = { github: "GitHub", parallel: "Parallel Search", firecrawl: "Firecrawl", linear: "Linear", notion: "Notion" };

/** Where an MCP need's tools come from, as a short name: "GitHub", "Composio Gmail", "slack MCP server". */
export function mcpWords(need) {
  if (need.source === "github") return "GitHub";
  if (need.source === "composio") return `Composio ${TOOLKIT_NAMES[need.toolkit] ?? need.toolkit ?? ""}`.trim();
  if (need.source === "url") return URL_NAMES[need.toolkit] ? `${URL_NAMES[need.toolkit]} MCP server` : need.toolkit ? `${need.toolkit} MCP server` : "An MCP server";
  return need.server ? `${need.server} MCP server` : "An MCP server";
}

/** The page's warning for a template whose tools come through Composio and that no one has yet run against real
 *  accounts (site/proven-live.json lists the ones that have been), or null. */
export function unprovenWords(pkg) {
  const toolkits = [...new Set(pkg.mcp.filter((n) => n.source === "composio").map((n) => TOOLKIT_NAMES[n.toolkit] ?? n.toolkit))];
  if (!toolkits.length || pkg.provenLive) return null;
  return `No one has run this against real ${listWords(toolkits)} accounts through Composio yet. Its eval cases use stand-ins.`;
}

/** The line for a template someone has run against real accounts, with the day: "Proven live against real Gmail
 *  accounts on 2026-11-20". Null when proven-live.json does not list it. */
export function provenWords(pkg) {
  if (!pkg.provenLive) return null;
  const toolkits = [...new Set((pkg.mcp ?? []).filter((n) => n.source === "composio").map((n) => TOOLKIT_NAMES[n.toolkit] ?? n.toolkit))];
  return `Proven live against real ${toolkits.length ? `${listWords(toolkits)} ` : ""}accounts on ${pkg.provenLive}`;
}

/** A template that prefers a free model: it costs nothing to run. */
export function isFree(pkg) {
  return typeof pkg.model?.prefer === "string" && pkg.model.prefer.endsWith(":free");
}

const HARNESS_NAMES = { pi: "pi", "claude-agent": "Claude Code", codex: "Codex" };

/** "a, b and c" */
function listWords(items) {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The eval results measured.json records per harness, as [harness name, passed, total]; a non-count ("cap hold") is left out. */
function passCounts(pkg, live = false) {
  const passed = live ? pkg.measured?.live?.passed : pkg.measured?.passed;
  if (!passed || typeof passed !== "object") return [];
  return Object.entries(passed).flatMap(([h, v]) => {
    const m = /^(\d+)\/(\d+)$/.exec(String(v));
    return m ? [[HARNESS_NAMES[h] ?? h, Number(m[1]), Number(m[2])]] : [];
  });
}

const LOGO_TOOLKITS = new Set(["github", "gmail", "googlecalendar", "hubspot", "linear", "slack", "stripe"]);

/** What a template requires beyond a model, read off the package itself (its tools, MCP needs and triggers) so the
 *  page can't drift from it: one {id, logo, text} each, logo a file in site/assets. Required things come first, then
 *  the schedule or webhook that starts it, then optional tools. Empty when it needs nothing more. */
export function requirements(pkg) {
  const triggers = (pkg.triggers ?? []).map((t) => t?.source?.kind);
  const mcp = pkg.mcp ?? [];
  const tools = pkg.tools ?? [];
  const toolkitLogo = (toolkit) => (LOGO_TOOLKITS.has(toolkit) ? `logo-${toolkit}.svg` : "logo-plug.svg");
  const need = (n) => {
    const name = mcpName(n);
    if (n.source === "github") return { id: "github-app", logo: "logo-github.svg", what: "GitHub", how: "the AgentRun GitHub App" };
    if (n.source === "composio") return { id: `composio-${n.toolkit}`, logo: toolkitLogo(n.toolkit), what: name, how: "Composio" };
    if (n.source === "url" && URL_NAMES[n.toolkit]) return { id: `mcp-${n.toolkit}`, logo: toolkitLogo(n.toolkit), what: name, how: "its own MCP server" };
    return { id: `mcp-${n.server ?? n.toolkit ?? "server"}`, logo: "logo-plug.svg", what: `the ${name}`, how: null };
  };
  const line = ({ what, how }, optional) => optional ? `Can use ${what}${how ? `, through ${how}` : ""} (optional)` : `Requires ${what}${how ? `, through ${how}` : ""}`;
  const out = [];
  const add = (r) => { if (!out.some((o) => o.id === r.id)) out.push({ id: r.id, logo: r.logo, text: r.text }); };

  // A free model it prefers ("openrouter/inclusionai/ling-3.2-flash:free"): first, as it is what the template costs.
  const prefer = typeof pkg.model?.prefer === "string" ? pkg.model.prefer : "";
  if (prefer.endsWith(":free")) add({ id: "free", logo: "logo-free.svg", text: `Runs free, on ${modelName(prefer)}${prefer.startsWith("openrouter/") ? " through OpenRouter" : ""}` });
  // Someone has run it against real accounts (site/proven-live.json): said next, as it is what a reader can rely on.
  const proven = provenWords(pkg);
  if (proven) add({ id: "proven", logo: "logo-proven.svg", text: proven });
  const emailTools = tools.some((t) => t.startsWith("email_"));
  if (triggers.includes("email")) add({ id: "email", logo: "logo-email.svg", text: "Requires your email account, through AgentRun's email trigger" });
  else if (emailTools) add({ id: "email", logo: "logo-email.svg", text: "Requires your email account, through AgentRun's email tools" });
  if (triggers.includes("github")) add({ id: "github-app", logo: "logo-github.svg", text: line({ what: "GitHub", how: "the AgentRun GitHub App" }) });
  for (const n of mcp.filter((m) => m.required)) { const r = need(n); add({ ...r, text: line(r) }); }
  for (const p of monidProviders(pkg)) add({ id: `monid-${p}`, logo: "logo-plug.svg", text: line({ what: p, how: "monid" }) });
  if (tools.includes("web_search")) add({ id: "web_search", logo: "logo-exa.svg", text: "Requires web search, through Exa" });
  if (tools.includes("web_fetch")) add({ id: "web_fetch", logo: "logo-web.svg", text: "Requires web fetch" });
  if (triggers.includes("webhook")) add({ id: "webhook", logo: "logo-webhook.svg", text: "Starts from a signed webhook your service sends" });
  if (triggers.includes("schedule")) add({ id: "schedule", logo: "logo-schedule.svg", text: "Runs on a schedule" });
  if (triggers.includes("feed")) add({ id: "feed", logo: "logo-web.svg", text: "Starts from a public feed it checks" });
  for (const n of mcp.filter((m) => !m.required)) { const r = need(n); add({ ...r, text: line(r, true) }); }
  return out;
}

/** A model id's own name, from its last part: "openrouter/inclusionai/ling-3.2-flash:free" is "Ling 3.2 Flash". */
function modelName(id) {
  // "gemma-4-31b-it:free" reads "Gemma 4 31B": the size as its maker writes it (an active size too, "a55b" is A55B),
  // the instruction-tuned suffix left off.
  const words = id.split("/").pop().replace(/:free$/, "").replace(/-(it|instruct)$/i, "").split("-");
  return words.map((w) => (/^a?\d+(\.\d+)?b$/i.test(w) ? w.toUpperCase() : upperFirst(w))).join(" ");
}

/** An MCP need's toolkit or server as a name: "Gmail", "GitHub", "slack MCP server". */
function mcpName(need) {
  if (need.source === "github") return "GitHub";
  if (need.source === "composio") return TOOLKIT_NAMES[need.toolkit] ?? need.toolkit ?? "a Composio toolkit";
  if (need.source === "url" && URL_NAMES[need.toolkit]) return URL_NAMES[need.toolkit];
  return need.server || need.toolkit ? `${need.server ?? need.toolkit} MCP server` : "MCP server";
}

/** The page's small Tested line, from measured.json: "Passes 5 of 5 eval cases on pi and 4 of 5 on Codex." Null when
 *  nothing is measured. A web template's eval cases hand it its pages; only a live case shows it on the real web, so
 *  the two counts are never merged, and a measured web template without a live count says so. */
export function testedLine(pkg) {
  const counts = passCounts(pkg);
  if (!counts.length) return null;
  const evals = `Passes ${listWords(counts.map(([h, p, t], k) => (k ? `${p} of ${t} on ${h}` : `${p} of ${t} eval cases on ${h}`)))}.`;
  // measured.json's `note`: what a reader needs to read the counts right (a grader changed before the run).
  const note = typeof pkg.measured?.note === "string" && pkg.measured.note.trim() ? ` ${pkg.measured.note.trim()}` : "";
  if (!pkg.tools.some((t) => t === "web_search" || t === "web_fetch")) return `${evals}${note}`;
  const live = passCounts(pkg, true);
  return `${live.length ? `${evals} On the live web, ${listWords(live.map(([h, p, t]) => `${p} of ${t} on ${h}`))}.` : `${evals} Not yet tried on the live web.`}${note}`;
}

/** The short form for a search snippet: "Passes 5 of 5 eval cases." (the first harness's count when measured). */
export function factsShort(pkg) {
  const [first] = passCounts(pkg);
  const [live] = passCounts(pkg, true);
  const web = pkg.tools.some((t) => t === "web_search" || t === "web_fetch");
  const evals = first ? `passes ${first[1]} of ${first[2]} eval cases${live ? ` and ${live[1]} of ${live[2]} on the live web` : ""}` : null;
  const untried = web && pkg.measured && !live ? "not yet tried on the live web" : null;
  const parts = [evals, untried].filter(Boolean);
  return parts.length ? `${upperFirst(parts.join("; "))}.` : "";
}

export const CATEGORY_TEXT = {
  engineering: { title: "Engineering", blurb: "Code review, release notes, dependencies and repository chores." },
  security: { title: "Security", blurb: "Checks on code, dependencies and what you expose to the internet." },
  sales: { title: "Sales", blurb: "Lead research, account briefs and prospect lists." },
  marketing: { title: "Marketing", blurb: "Competitor tracking, market news and content research." },
  research: { title: "Research", blurb: "Topic, literature and market research with every claim cited." },
  finance: { title: "Finance", blurb: "Filings, company financials and spend checks." },
  operations: { title: "Operations", blurb: "Vendor checks, monitoring and recurring chores." },
  compliance: { title: "Compliance", blurb: "KYB, sanctions screening and due diligence." },
  personal: { title: "Personal", blurb: "Research and tracking for yourself." },
};
