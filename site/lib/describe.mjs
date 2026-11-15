// Turns manifest fields into the plain sentences the pages show. Each function returns text (the page escapes it).

import { usd } from "./util.mjs";

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
    } else if (src.kind) {
      out.push({ kind: String(src.kind), text: `A ${src.kind} trigger.` });
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
  const model = provider ? `A model key for the ${pkg.model.tier ?? "default"} tier; the preferred model runs with a key for ${name}` : "A model key";
  return { model, secrets: keys };
}

const TOOLKIT_NAMES = { github: "GitHub", gmail: "Gmail", googlecalendar: "Google Calendar", slack: "Slack", linear: "Linear", hubspot: "HubSpot", stripe: "Stripe" };

/** Where an MCP need's tools come from, as a short name: "GitHub", "Composio Gmail", "slack MCP server". */
export function mcpWords(need) {
  if (need.source === "github") return "GitHub";
  if (need.source === "composio") return `Composio ${TOOLKIT_NAMES[need.toolkit] ?? need.toolkit ?? ""}`.trim();
  if (need.source === "url") return need.toolkit ? `${need.toolkit} MCP server` : "An MCP server";
  return need.server ? `${need.server} MCP server` : "An MCP server";
}

/** The page's warning for a template whose tools come through Composio and that no one has yet run against real
 *  accounts (site/proven-live.json lists the ones that have been), or null. */
export function unprovenWords(pkg) {
  const toolkits = [...new Set(pkg.mcp.filter((n) => n.source === "composio").map((n) => TOOLKIT_NAMES[n.toolkit] ?? n.toolkit))];
  if (!toolkits.length || pkg.provenLive) return null;
  return `Integration not yet proven live: no one has run it against real ${listWords(toolkits)} accounts through Composio yet; its eval cases run against stand-ins, not live accounts.`;
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

/** One plain sentence for a template's page and its search snippet: what it needs, what a run costs, how its evals went.
 *  "Needs only a model key and the web, costs about $0.06 a run, and passes 5 of 5 eval cases on pi and 4 of 5 on Codex." */
export function factsLine(pkg) {
  const required = pkg.mcp.filter((n) => n.required).map(mcpWords);
  const optional = pkg.mcp.filter((n) => !n.required).map(mcpWords);
  const web = pkg.tools.some((t) => t === "web_search" || t === "web_fetch");
  const monid = monidProviders(pkg);
  const paid = [...required, ...(monid.length ? [`a monid key (for ${listWords(monid)})`] : [])];
  let needs = paid.length ? `Needs ${listWords(paid)}` : `Needs only a model key${web ? " and the web" : ""}`;
  if (optional.length) needs += ` (${listWords(optional)} optional)`;
  const cap = pkg.budget?.per_run_usd;
  const cost = pkg.measured ? `costs about ${usd(pkg.measured.median_usd)} a run` : typeof cap === "number" ? `stops each run at ${usd(cap)}` : null;
  const counts = passCounts(pkg);
  const evals = counts.length
    ? `passes ${listWords(counts.map(([h, p, t], k) => (k ? `${p} of ${t} on ${h}` : `${p} of ${t} eval cases on ${h}`)))}`
    : pkg.evals.length ? `is tested by ${pkg.evals.length} eval case${pkg.evals.length === 1 ? "" : "s"}` : null;
  // A web template's eval cases hand it its pages; only a live case shows it searching the real web, so the two
  // counts are never merged, and a measured web template without one says so.
  const live = passCounts(pkg, true);
  const liveWords = !web || !pkg.measured ? null
    : live.length ? `on the live web passes ${listWords(live.map(([h, p, t]) => `${p} of ${t} on ${h}`))}`
    : "has not been tried on the live web yet";
  const parts = [needs, cost, evals, liveWords].filter(Boolean);
  return `${parts.length > 1 ? `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}` : parts[0]}.`;
}

/** The short form for a search snippet: "About $0.06 a run; passes 5 of 5 eval cases." (pi's count when measured). */
export function factsShort(pkg) {
  const [first] = passCounts(pkg);
  const [live] = passCounts(pkg, true);
  const web = pkg.tools.some((t) => t === "web_search" || t === "web_fetch");
  const evals = first ? `passes ${first[1]} of ${first[2]} eval cases${live ? ` and ${live[1]} of ${live[2]} on the live web` : ""}` : null;
  const untried = web && pkg.measured && !live ? "not yet tried on the live web" : null;
  const parts = [pkg.measured ? `About ${usd(pkg.measured.median_usd)} a run` : null, evals, untried].filter(Boolean);
  return parts.length ? `${parts.join("; ")}.` : "";
}

export function costWords(pkg) {
  const cap = typeof pkg.budget?.per_run_usd === "number" ? `Each run stops at ${usd(pkg.budget.per_run_usd)}.` : "";
  if (pkg.measured) {
    const m = pkg.measured;
    const how = [m.model, m.harness].filter(Boolean).join(" on ");
    return { measured: true, headline: `${usd(m.median_usd)} median per run`, detail: `Median of ${m.runs} eval runs${how ? ` with ${how}` : ""}${m.measured_on ? `, measured ${m.measured_on}` : ""}. ${cap}`.trim() };
  }
  return { measured: false, headline: "Not measured yet", detail: `No measured eval report ships with this template yet. ${cap}`.trim() };
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
