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

/** The model key a run needs, read off model.prefer's provider. */
export function keyWords(pkg) {
  const keys = [...pkg.secrets];
  const provider = pkg.model?.prefer?.split("/")[0];
  const name = PROVIDERS[provider] ?? provider;
  const model = provider ? `A model key for the ${pkg.model.tier ?? "default"} tier; the preferred model runs with a key for ${name}` : "A model key";
  return { model, secrets: keys };
}

/** Where an MCP need's tools come from, as a short name: "GitHub", "Composio gmail", "slack". */
export function mcpWords(need) {
  if (need.source === "github") return "GitHub";
  if (need.source === "composio") return `Composio ${need.toolkit ?? ""}`.trim();
  if (need.source === "url") return need.toolkit ? `${need.toolkit} MCP server` : "An MCP server";
  return need.server ? `${need.server} MCP server` : "An MCP server";
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
