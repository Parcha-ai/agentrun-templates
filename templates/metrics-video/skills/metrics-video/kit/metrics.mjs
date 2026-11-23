#!/usr/bin/env node
// metrics.mjs: every number of the weekly metrics film, worked out by code from Stripe's balance transactions.
// The agent saves Stripe's answers as files; this script does the calendar, the sums, the differences, the
// percentages, the rounding and the words the voice says for each figure, and writes the one data module every scene
// reads. Nothing here guesses: a figure it cannot work out is an error, never an estimate.
//
//   node metrics.mjs weeks   --today YYYY-MM-DD --timezone <IANA> [--week-of YYYY-MM-DD] [--carried stripe/carried.json]
//   node metrics.mjs compute --today YYYY-MM-DD --timezone <IANA> [--week-of YYYY-MM-DD] [--carried stripe/carried.json]
//                            --pages stripe --film film [--business "Name"]
//   node metrics.mjs place   --film film [--at revenue=5.2,change=14.0,...] [--seconds 47]
//   node metrics.mjs stem    --file media/run-keys.json --today YYYY-MM-DD --timezone <IANA> [--week-of YYYY-MM-DD]
//   node metrics.mjs scan    --pages stripe [--root .] [--final]
//
// --today is the run's date in the time zone: the day the schedule fired (its line names it in the schedule's zone),
// or for a run by hand the day the run's environment line gives. Never the sandbox's clock.
// weeks    prints the week to film (Monday 00:00 to the next Monday 00:00 in the time zone), the week before it, and
//          the window to read from Stripe: both weeks when the carried figures are for the week before (they are
//          compared), else the week alone.
// compute  reads every stripe/raw-<n>.json the agent saved, takes eight fields of each item (id, created, type,
//          reporting_category, currency, amount, fee, net) and nothing else, checks each (net = amount - fee), keeps the
//          revenue categories, adds each week up per currency (never across currencies), compares the week before
//          with the carried figures, and writes film/data.json and the same object into film/index.html (window.MV).
//          It prints the figures, the words to say for each, the film's plan and the carry for the answer.
// place    sets each scene's start and length in film/index.html and each scene's span from --at (scene=start,...),
//          the film's length, the captions host and the music (kept only when film/assets/music.mp3 exists).
// stem     prints the run's key stem: the one in the file when it was made for this week, else a new one from the
//          sandbox's random bytes, written there first. A model never makes one.
// scan     looks for customer data in every file the run wrote: each string a raw page's items hold (a description, a
//          name, an email, an id; not Stripe's enum fields, its fee lines or a single word alone), each pair of
//          capitalised words in one (a name's shape), and any email address. With --final and nothing found, it
//          removes the raw pages.
//
// A raw page is Stripe's list exactly as Composio answered it ({"object": "list", "data": [...], "has_more": ...}),
// or Composio's whole answer around it. It holds customers' details (a charge's description can name one), so only
// compute and scan read it, and scan --final removes it. Exit 2: wrong arguments, a film whose files don't match the
// kit (place reads every host and scene back after writing them; the message names the scene), or customer data in a
// file (scan names the file and the item, never the value); 3: the pages are wrong or incomplete (the message says
// what to fix); 0: done.
import { createHash, randomBytes } from "node:crypto";
import { existsSync, lstatSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const METRIC = {
  id: "net-of-refunds-and-fees",
  label: "Revenue: net of refunds and Stripe fees, from Stripe balance transactions",
};
// Stripe's reporting categories that make up the figure: money in (charge) and what takes it back off the charges (a
// charge that failed after it was credited, charge_failure; the uncaptured rest of a partial capture,
// partial_capture_reversal), money back (refund) and a refund that failed and returned (refund_failure), money taken
// back by a dispute and returned when it is won (dispute, dispute_reversal), and Stripe's own fees billed on their own
// (fee). Payouts, transfers, top-ups and every other category move money, not revenue, and are left out (and counted).
const KEPT = new Set(["charge", "charge_failure", "partial_capture_reversal", "refund", "refund_failure", "dispute", "dispute_reversal", "fee"]);
const MAX_PAGES = 10;
const MAX_FILMED = 3; // currencies the film shows; more are named on the end card and in the report
// Stripe's zero-decimal and three-decimal currencies (stripe.com/docs/currencies); every other one has two.
const ZERO = new Set("bif clp djf gnf jpy kmf krw mga pyg rwf ugx vnd vuv xaf xof xpf".split(" "));
const THREE = new Set("bhd jod kwd omr tnd".split(" "));
const UNIT = {
  usd: ["dollar", "dollars"], eur: ["euro", "euros"], gbp: ["pound", "pounds"], cad: ["Canadian dollar", "Canadian dollars"],
  aud: ["Australian dollar", "Australian dollars"], nzd: ["New Zealand dollar", "New Zealand dollars"], jpy: ["yen", "yen"],
  chf: ["Swiss franc", "Swiss francs"], sek: ["Swedish krona", "Swedish kronor"], nok: ["Norwegian krone", "Norwegian kroner"],
  dkk: ["Danish krone", "Danish kroner"], inr: ["rupee", "rupees"], mxn: ["Mexican peso", "Mexican pesos"], brl: ["real", "reais"],
  sgd: ["Singapore dollar", "Singapore dollars"], hkd: ["Hong Kong dollar", "Hong Kong dollars"], pln: ["zloty", "zloty"],
};

function fail(code, message) {
  console.error(message);
  process.exit(code);
}

// ---------- arguments ----------
const [command, ...rest] = process.argv.slice(2);
const args = {};
for (let i = 0; i < rest.length; i++) {
  if (!rest[i].startsWith("--")) fail(2, `unexpected argument ${rest[i]}`);
  args[rest[i].slice(2)] = rest[i + 1] !== undefined && !rest[i + 1].startsWith("--") ? rest[++i] : "true";
}
const need = (k) => (args[k] === undefined ? fail(2, `--${k} is required`) : args[k]);

// ---------- the calendar, in the owner's time zone ----------
function zoneOk(tz) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
const partsFmt = new Map();
function localParts(ms, tz) {
  if (!partsFmt.has(tz)) {
    partsFmt.set(tz, new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  }
  const p = Object.fromEntries(partsFmt.get(tz).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second };
}
const dayNumber = (y, m, d) => Math.floor(Date.UTC(y, m - 1, d) / 86400000); // days since 1970-01-01, a calendar count
const fromDayNumber = (n) => {
  const t = new Date(n * 86400000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
};
const iso = ({ y, m, d }) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
// The first instant (whole seconds) whose local date in tz is on or after day n: local midnight, or the first instant
// of the day when a clock change skips midnight.
function startOfDay(n, tz) {
  const target = n;
  const localDay = (ms) => {
    const p = localParts(ms, tz);
    return dayNumber(p.y, p.m, p.d);
  };
  let lo = (n * 86400 - 18 * 3600) * 1000; // every zone is within UTC-12..+14
  let hi = (n * 86400 + 18 * 3600) * 1000;
  while (hi - lo > 1000) {
    const mid = Math.floor((lo + hi) / 2000) * 1000;
    if (localDay(mid) >= target) hi = mid;
    else lo = mid;
  }
  return hi;
}
const MONTHS = "January February March April May June July August September October November December".split(" ");
const SHORT = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const DAYS = "Mon Tue Wed Thu Fri Sat Sun".split(" ");
function weekOf(mondayN, tz) {
  const a = fromDayNumber(mondayN);
  const b = fromDayNumber(mondayN + 6);
  const label = a.y !== b.y
    ? `${a.d} ${MONTHS[a.m - 1]} ${a.y} – ${b.d} ${MONTHS[b.m - 1]} ${b.y}`
    : a.m !== b.m ? `${a.d} ${MONTHS[a.m - 1]} – ${b.d} ${MONTHS[b.m - 1]} ${b.y}` : `${a.d}–${b.d} ${MONTHS[a.m - 1]} ${b.y}`;
  const short = a.m !== b.m ? `${SHORT[a.m - 1]} ${a.d} – ${SHORT[b.m - 1]} ${b.d}` : `${SHORT[a.m - 1]} ${a.d} – ${b.d}`;
  const days = Array.from({ length: 7 }, (_, i) => {
    const from = startOfDay(mondayN + i, tz);
    const to = startOfDay(mondayN + i + 1, tz);
    return { date: iso(fromDayNumber(mondayN + i)), label: DAYS[i], from: from / 1000, to: to / 1000 };
  });
  return {
    start: iso(a), end: iso(b), label, short,
    from_unix: days[0].from, to_unix: days[6].to,
    from_utc: new Date(days[0].from * 1000).toISOString(), to_utc: new Date(days[6].to * 1000).toISOString(),
    days,
  };
}
function readCarried(path) {
  if (!path) return null;
  if (!existsSync(path)) fail(2, `${path} does not exist: write the last result's carried object there, or leave --carried out`);
  let c;
  try {
    c = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(2, `${path} is not JSON (${e.message}): write the last result's carried object there exactly as it was handed`);
  }
  return c;
}
function weeks() {
  const tz = need("timezone");
  if (!zoneOk(tz)) fail(2, `${tz} is not a time zone this machine knows (an IANA name like Europe/Madrid)`);
  const t = /^(\d{4})-(\d{2})-(\d{2})$/.exec(need("today"));
  if (!t) fail(2, `--today ${args.today} is not a date (YYYY-MM-DD): the run's date in ${tz}`);
  const today = dayNumber(+t[1], +t[2], +t[3]);
  const endOfToday = startOfDay(today + 1, tz); // ms: no transaction read can be later than this
  const mondayOf = (n) => n - ((new Date(n * 86400000).getUTCDay() + 6) % 7);
  let monday;
  if (args["week-of"] && args["week-of"] !== "true") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(args["week-of"]);
    if (!m) fail(2, `--week-of ${args["week-of"]} is not a date (YYYY-MM-DD)`);
    monday = mondayOf(dayNumber(+m[1], +m[2], +m[3]));
    if (monday + 7 > today) fail(2, `the week holding ${args["week-of"]} is not over yet on ${args.today} in ${tz}: a film covers a whole week, Monday to Sunday`);
  } else {
    monday = mondayOf(today) - 7; // the last whole week
  }
  const week = weekOf(monday, tz);
  const before = weekOf(monday - 7, tz);
  const carried = readCarried(args.carried);
  let compare = { with_carried: false, reason: "no earlier result was handed to this run: the first film of this schedule, or a run by hand" };
  if (carried) {
    if (carried.metric !== METRIC.id) compare.reason = `the last result counted another figure (${String(carried.metric).slice(0, 60)}): no week over week`;
    else if (carried.timezone !== tz) compare.reason = `the last result's weeks were in ${String(carried.timezone).slice(0, 40)}, this run's in ${tz}: no week over week`;
    else if (!carried.week || carried.week.start !== before.start) compare.reason = `the last result covered the week of ${carried.week?.start ?? "an unknown day"}, not the week before this one (${before.start}): no week over week`;
    else compare = { with_carried: true, reason: `the last result carried the week of ${before.start}: it is read again from Stripe and compared` };
  }
  const read = compare.with_carried ? { created_gte: before.from_unix, created_lt: week.to_unix } : { created_gte: week.from_unix, created_lt: week.to_unix };
  return { today: iso(fromDayNumber(today)), end_of_today_unix: endOfToday / 1000, timezone: tz, week, week_before: compare.with_carried ? before : null, compare, read, carried };
}

// ---------- money ----------
const decimalsOf = (c) => (ZERO.has(c) ? 0 : THREE.has(c) ? 3 : 2);
const MINUS = "−";
function exactString(minor, c) {
  const dec = decimalsOf(c);
  const f = 10 ** dec;
  const neg = minor < 0;
  const abs = Math.abs(minor);
  const units = Math.floor(abs / f).toLocaleString("en-US");
  const frac = dec ? "." + String(abs % f).padStart(dec, "0") : "";
  return `${neg ? MINUS : ""}${symbolOf(c)}${units}${frac}`;
}
// Whole currency units, half away from zero, in integers: the film and the voice say every amount this way.
function wholeOf(minor, c) {
  const f = 10 ** decimalsOf(c);
  const abs = Math.abs(minor);
  const w = Math.floor(abs / f) + (2 * (abs % f) >= f ? 1 : 0);
  return minor < 0 ? -w : w;
}
function symbolOf(c) {
  const parts = new Intl.NumberFormat("en-US", { style: "currency", currency: c.toUpperCase(), maximumFractionDigits: 0 }).formatToParts(1);
  const s = parts.filter((x) => x.type === "currency").map((x) => x.value).join("");
  return /^[A-Z]{3}$/.test(s) ? `${s} ` : s;
}
function wholeString(w, c) {
  return `${w < 0 ? MINUS : ""}${symbolOf(c)}${Math.abs(w).toLocaleString("en-US")}`;
}
const ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split(" ");
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
function words(n) {
  if (n < 0) return `minus ${words(-n)}`;
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${words(n % 100)}` : ""}`;
  for (const [v, name] of [[1e12, "trillion"], [1e9, "billion"], [1e6, "million"], [1e3, "thousand"]]) {
    if (n >= v) return `${words(Math.floor(n / v))} ${name}${n % v ? ` ${words(n % v)}` : ""}`;
  }
  return String(n);
}
function unitWords(c, w) {
  const u = UNIT[c];
  if (u) return Math.abs(w) === 1 ? u[0] : u[1];
  const name = new Intl.NumberFormat("en-US", { style: "currency", currency: c.toUpperCase(), currencyDisplay: "name" }).formatToParts(Math.abs(w) === 1 ? 1 : 2).filter((x) => x.type === "currency").map((x) => x.value).join("");
  return name || c.toUpperCase().split("").join(" ");
}
function money(minor, c) {
  const w = wholeOf(minor, c);
  return { minor, exact: exactString(minor, c), whole: w, display: wholeString(w, c), spoken: `${words(w)} ${unitWords(c, w)}` };
}
function moneyWhole(w, c) {
  return { whole: w, display: wholeString(w, c), spoken: `${words(Math.abs(w))} ${unitWords(c, w)}` };
}
// A percentage to one decimal, half away from zero, from integers: change ÷ |before| × 100.
function percent(change, before) {
  if (before === 0) return null;
  const tenths = Math.floor((Math.abs(change) * 1000) / Math.abs(before));
  const rem = (Math.abs(change) * 1000) % Math.abs(before);
  const t = tenths + (2 * rem >= Math.abs(before) ? 1 : 0);
  const value = (change < 0 ? -t : t) / 10;
  const whole = Math.floor(t / 10);
  const tenth = t % 10;
  const spoken = `${words(whole)}${tenth ? ` point ${ONES[tenth]}` : ""} percent`;
  const display = `${change > 0 ? "+" : change < 0 ? MINUS : ""}${whole}.${tenth}%`;
  return { value, display, spoken };
}

// ---------- Stripe's pages ----------
// The eight fields the figures use; the script takes them from each item itself, and nothing else of an item is kept.
const FIELDS = ["id", "created", "type", "reporting_category", "currency", "amount", "fee", "net"];
const rawFiles = (dir) => readdirSync(dir).filter((f) => /^raw-\d+\.json$/.test(f)).sort((a, b) => parseInt(a.slice(4)) - parseInt(b.slice(4)));
// A raw page as the agent saved it: Stripe's list ({"object": "list", "data": [...], "has_more": ...}), or Composio's
// whole answer around it ({"data": <that list>, "successful": true, ...}).
function listOf(page) {
  if (Array.isArray(page?.data) && typeof page.has_more === "boolean") return page;
  if (page && typeof page === "object" && "successful" in page && Array.isArray(page.data?.data) && typeof page.data.has_more === "boolean") return page.data;
  return null;
}
function readRaw(dir) {
  if (!existsSync(dir)) fail(3, `${dir} does not exist: save each page Stripe answered to ${dir}/raw-1.json, raw-2.json ...`);
  const files = rawFiles(dir);
  if (!files.length) fail(3, `no raw-<n>.json in ${dir}: save each page Stripe answered there, exactly as it answered`);
  if (files.length > MAX_PAGES) fail(3, `${files.length} pages: this film reads at most ${MAX_PAGES} pages (${MAX_PAGES * 100} transactions)`);
  files.forEach((f, i) => {
    if (f !== `raw-${i + 1}.json`) fail(3, `the pages are numbered from 1 with no gap: found ${files.join(", ")}`);
  });
  return files.map((f) => {
    let page;
    try {
      page = JSON.parse(readFileSync(join(dir, f), "utf8"));
    } catch (e) {
      fail(3, `${dir}/${f} is not JSON (${e.message}): save it again exactly as Stripe answered`);
    }
    const list = listOf(page);
    if (!list) fail(3, `${dir}/${f} must be Stripe's list as it answered ({"object": "list", "data": [...], "has_more": true|false})`);
    return { file: f, list };
  });
}
function readPages(dir) {
  const problems = [];
  const byId = new Map();
  let last = null;
  const raw = readRaw(dir);
  for (const { file: f, list } of raw) {
    for (const [i, item] of list.data.entries()) {
      const at = `${f} item ${i + 1}`;
      const t = Object.fromEntries(FIELDS.map((k) => [k, item?.[k]]));
      // A whole item always says what it is. One cut down to a few fields would hide its description from the scan.
      if (item?.object !== "balance_transaction") problems.push(`${at}: "object": "balance_transaction" is missing: save each item whole, as Stripe gave it, never a part of it`);
      if (typeof t.id !== "string" || !t.id) problems.push(`${at}: id is missing`);
      for (const k of ["created", "amount", "fee", "net"]) if (!Number.isInteger(t[k])) problems.push(`${at}: ${k} is not a whole number as Stripe gives it`);
      for (const k of ["type", "reporting_category", "currency"]) if (typeof t[k] !== "string") problems.push(`${at}: ${k} is missing`);
      if (typeof t.currency === "string" && !/^[a-z]{3}$/.test(t.currency)) problems.push(`${at}: currency ${t.currency} is not Stripe's three lower-case letters`);
      if (Number.isInteger(t.amount) && Number.isInteger(t.fee) && Number.isInteger(t.net) && t.net !== t.amount - t.fee) {
        problems.push(`${at} (${t.id}): net ${t.net} is not amount ${t.amount} - fee ${t.fee}: a number was saved wrong`);
      }
      if (typeof t.id === "string" && byId.has(t.id)) {
        const a = JSON.stringify(byId.get(t.id));
        if (a !== JSON.stringify(t)) problems.push(`${at}: ${t.id} appears twice with different values`);
        continue;
      }
      if (typeof t.id === "string") byId.set(t.id, t);
    }
    last = list;
  }
  if (problems.length) fail(3, `the pages need fixing (save these pages again exactly as Stripe answered):\n- ${problems.slice(0, 20).join("\n- ")}`);
  return { transactions: [...byId.values()], lastHasMore: last.has_more, pages: raw.length };
}

// ---------- the figures ----------
function emptyFigures() {
  return { revenue: 0, gross: 0, charges: 0, refunds: [0, 0], disputes: [0, 0], reversals: [0, 0], fees: 0, days: [0, 0, 0, 0, 0, 0, 0], kept: 0 };
}
function addUp(transactions, week) {
  const by = new Map();
  const leftOut = {};
  for (const t of transactions) {
    if (t.created < week.from_unix || t.created >= week.to_unix) continue;
    if (!KEPT.has(t.reporting_category)) {
      leftOut[t.reporting_category] = (leftOut[t.reporting_category] ?? 0) + 1;
      continue;
    }
    if (!by.has(t.currency)) by.set(t.currency, emptyFigures());
    const f = by.get(t.currency);
    f.kept++;
    f.revenue += t.net;
    f.fees += t.fee;
    const day = week.days.findIndex((d) => t.created >= d.from && t.created < d.to);
    f.days[day] += t.net;
    switch (t.reporting_category) {
      case "charge":
        f.gross += t.amount;
        if (t.amount > 0) f.charges++;
        break;
      case "charge_failure":
      case "partial_capture_reversal":
        f.gross += t.amount; // negative: it takes money back off the charges, and is no charge of its own
        break;
      case "refund":
        f.refunds[0]++;
        f.refunds[1] += -t.amount;
        break;
      case "refund_failure":
        f.refunds[1] += -t.amount; // positive: a refund that failed returns its money, and is no refund of its own
        break;
      case "dispute":
        f.disputes[0]++;
        f.disputes[1] += -t.amount;
        break;
      case "dispute_reversal":
        f.reversals[0]++;
        f.reversals[1] += t.amount;
        break;
      case "fee":
        f.fees += -t.amount; // a fee billed on its own: its amount is the (negative) fee
        break;
    }
  }
  for (const [c, f] of by) {
    // The identity the figure must meet: net = charges - refunds - disputes + reversals - fees.
    if (f.revenue !== f.gross - f.refunds[1] - f.disputes[1] + f.reversals[1] - f.fees) fail(3, `the ${c} figures do not add up; a category this script does not know moved money`);
  }
  return { by, leftOut };
}
const carriedRow = (c, f) => ({
  currency: c, revenue_minor: f.revenue, gross_minor: f.gross, charges: f.charges,
  refunds_count: f.refunds[0], refunds_minor: f.refunds[1], disputes_count: f.disputes[0], disputes_minor: f.disputes[1], fees_minor: f.fees,
});
const COMPARED = ["revenue_minor", "gross_minor", "charges", "refunds_count", "refunds_minor", "disputes_count", "disputes_minor", "fees_minor"];

function compute() {
  const w = weeks();
  const film = need("film");
  if (!existsSync(join(film, "index.html"))) fail(2, `${film}/index.html is missing: copy the kit into ${film}/ first`);
  const { transactions, lastHasMore, pages } = readPages(need("pages"));
  const oldest = Math.min(...transactions.map((t) => t.created));
  if (lastHasMore && !(oldest < w.read.created_gte)) {
    fail(3, `Stripe said has_more on the last page and the oldest transaction read (${new Date(oldest * 1000).toISOString()}) is not before the window's start (${new Date(w.read.created_gte * 1000).toISOString()}): read the next page (starting_after the last id) and save it as raw-${pages + 1}.json`);
  }
  const late = transactions.filter((t) => t.created >= w.end_of_today_unix);
  if (late.length) fail(3, `${late.length} transaction(s) are dated after ${w.today} in ${w.timezone}: a created value was copied wrong (${late.slice(0, 3).map((t) => t.id).join(", ")})`);

  const thisWeek = addUp(transactions, w.week);
  const before = w.week_before ? addUp(transactions, w.week_before) : null;
  const order = [...thisWeek.by.entries()].sort((a, b) => b[1].kept - a[1].kept || a[0].localeCompare(b[0]));
  const empty = order.length === 0;

  // The carried figures against Stripe's figures for the same week, read again now.
  let compare = { state: "none", reason: w.compare.reason, restated: [] };
  const priorRow = new Map();
  if (before) {
    const carried = new Map((w.carried.figures ?? []).map((r) => [r.currency, r]));
    const currencies = new Set([...carried.keys(), ...before.by.keys()]);
    const restated = [];
    for (const c of [...currencies].sort()) {
      const reread = carriedRow(c, before.by.get(c) ?? emptyFigures());
      priorRow.set(c, reread);
      const had = carried.get(c) ?? carriedRow(c, emptyFigures());
      const changed = COMPARED.filter((k) => had[k] !== reread[k]);
      if (changed.length) {
        restated.push({
          currency: c,
          carried_revenue_minor: had.revenue_minor,
          reread_revenue_minor: reread.revenue_minor,
          fields: changed.map((k) => ({ field: k, carried: had[k], reread: reread[k] })),
        });
      }
    }
    compare = restated.length
      ? { state: "restated", reason: `Stripe's figures for the week of ${w.week_before.start} changed after the last film: the week over week uses them as read now`, restated }
      : { state: "carried", reason: `the week of ${w.week_before.start} read again matches the carried figures`, restated: [] };
  }

  const currencies = order.map(([c, f], i) => {
    const prior = priorRow.has(c) ? priorRow.get(c).revenue_minor : before ? 0 : null;
    const revenue = money(f.revenue, c);
    let change = null;
    if (prior !== null) {
      const p = money(prior, c);
      // The change shown is the difference of the two whole figures shown, so the film's figures add up as seen; the
      // exact change in minor units stays beside it, and the percentage is worked from the exact figures.
      const shown = revenue.whole - p.whole;
      change = {
        before: p,
        minor: f.revenue - prior,
        exact: exactString(f.revenue - prior, c),
        ...moneyWhole(shown, c),
        display: `${shown > 0 ? "+" : shown < 0 ? MINUS : ""}${wholeString(Math.abs(shown), c)}`,
        direction: f.revenue > prior ? "up" : f.revenue < prior ? "down" : "flat",
        percent: percent(f.revenue - prior, prior),
      };
    }
    const best = f.days.reduce((b, v, j) => (v > f.days[b] ? j : b), 0);
    const r = compare.restated.find((x) => x.currency === c);
    return {
      code: c, filmed: i < MAX_FILMED, decimals: decimalsOf(c), symbol: symbolOf(c).trim(),
      revenue, gross: money(f.gross, c), charges: f.charges,
      refunds: { count: f.refunds[0], ...money(f.refunds[1], c) },
      disputes: { count: f.disputes[0], ...money(f.disputes[1], c) },
      dispute_reversals: { count: f.reversals[0], ...money(f.reversals[1], c) },
      fees: money(f.fees, c),
      days: w.week.days.map((d, j) => ({ date: d.date, label: d.label, ...money(f.days[j], c) })),
      best_day: f.days[best] > 0 ? { index: best, label: w.week.days[best].label, date: w.week.days[best].date, ...money(f.days[best], c) } : null,
      change,
      restated: r ? { carried: money(r.carried_revenue_minor, c), reread: money(r.reread_revenue_minor, c) } : null,
    };
  });
  // A currency with money the week before and none this week is said too, never dropped silently.
  const gone = [...priorRow.entries()].filter(([c, r]) => !thisWeek.by.has(c) && r.revenue_minor !== 0).map(([c, r]) => ({ code: c, before: money(r.revenue_minor, c) }));
  const filmed = currencies.filter((c) => c.filmed);

  // The film's plan: scenes in order with their seconds, by how many currencies it shows.
  const n = filmed.length;
  const scenes = empty
    ? [["open", 5], ["revenue", 9], ["endcard", 6]]
    : n === 1
      ? [["open", 5], ["revenue", 8], ["days", 8], ["change", 8], ["refunds", 8], ["endcard", 8]]
      : n === 2
        ? [["open", 4.5], ["revenue", 12], ["change", 13], ["refunds", 10], ["endcard", 5.5]]
        : [["open", 4], ["revenue", 15], ["change", 15], ["refunds", 12], ["endcard", 5]];
  let at = 0;
  const plan = scenes.map(([name, seconds]) => {
    const s = { name, start: at, seconds };
    at += seconds;
    return s;
  });
  const filmSeconds = Math.round(at * 10) / 10;
  const maxWords = Math.floor((filmSeconds - 4.5) * 2.4);

  const business = args.business && args.business !== "true" ? String(args.business).slice(0, 40) : null;
  const tzNote = w.timezone === "UTC" ? "weeks in UTC" : `weeks in ${w.timezone}`;
  const data = {
    metric: METRIC,
    source_line: `${METRIC.label} · ${tzNote}`,
    business,
    timezone: w.timezone,
    week: { start: w.week.start, end: w.week.end, label: w.week.label, short: w.week.short, days: w.week.days.map((d) => ({ date: d.date, label: d.label })) },
    week_before: w.week_before ? { start: w.week_before.start, end: w.week_before.end, label: w.week_before.label, short: w.week_before.short } : null,
    empty,
    compare,
    currencies,
    not_filmed: currencies.filter((c) => !c.filmed).map((c) => ({ code: c.code, revenue: c.revenue })),
    gone,
    left_out: thisWeek.leftOut,
    read: { pages, transactions: transactions.length, from_utc: new Date(w.read.created_gte * 1000).toISOString(), to_utc: new Date(w.read.created_lt * 1000).toISOString() },
    plan: { film_seconds: filmSeconds, max_words: maxWords, voice_must_end_by: Math.round((filmSeconds - 3) * 10) / 10, scenes: plan },
    timing: Object.fromEntries(plan.map((s) => [s.name, { start: s.start, seconds: s.seconds }])),
    carry: {
      metric: METRIC.id,
      timezone: w.timezone,
      week: { start: w.week.start, end: w.week.end },
      figures: order.map(([c, f]) => carriedRow(c, f)).slice(0, 10),
    },
  };
  writeFileSync(join(film, "data.json"), JSON.stringify(data, null, 1) + "\n");
  writeData(film, data);
  place(film, data, null, null);

  // What the agent reads: every figure with its words, the plan, the carry.
  const out = [];
  out.push(`week: ${data.week.label} (${data.week.start} to ${data.week.end}, ${w.timezone}); read ${pages} page(s), ${transactions.length} transactions`);
  out.push(`metric: ${METRIC.label}`);
  out.push(`source line: ${data.source_line}`);
  out.push(`compare: ${compare.state}: ${compare.reason}`);
  if (empty) out.push("EMPTY WEEK: no charge, refund, dispute or fee in any currency. Say so plainly; no chart, no trend.");
  for (const c of currencies) {
    out.push(`--- ${c.code.toUpperCase()}${c.filmed ? "" : " (not filmed: named on the end card and in the report)"}`);
    out.push(`revenue: ${c.revenue.exact} exact; film ${c.revenue.display}; say "${c.revenue.spoken}"`);
    out.push(`charges: ${c.charges} for ${c.gross.exact} gross; fees ${c.fees.exact}`);
    out.push(`refunds: ${c.refunds.count}, ${c.refunds.exact}; film ${c.refunds.display}; say "${c.refunds.spoken}"`);
    out.push(`disputes: ${c.disputes.count}, ${c.disputes.exact}; film ${c.disputes.display}; say "${c.disputes.spoken}"${c.dispute_reversals.count ? `; won back: ${c.dispute_reversals.count}, ${c.dispute_reversals.exact}` : ""}`);
    if (c.best_day) out.push(`best day: ${c.best_day.label} ${c.best_day.date}, ${c.best_day.display}; say "${c.best_day.spoken}"`);
    if (c.change) {
      out.push(`week before: ${c.change.before.exact} exact; film ${c.change.before.display}; say "${c.change.before.spoken}"`);
      out.push(`change: ${c.change.direction}; film ${c.change.display}${c.change.percent ? ` ${c.change.percent.display}` : ""}; say "${c.change.direction} ${c.change.spoken}${c.change.percent ? `, ${c.change.percent.spoken}` : ""}" (exact ${c.change.exact})`);
    } else {
      out.push("change: none (no earlier week to compare: say so)");
    }
    if (c.restated) out.push(`RESTATED: the last film had ${c.restated.carried.display} for the week before; Stripe now says ${c.restated.reread.display}. Say so; the change above uses ${c.restated.reread.display}.`);
  }
  for (const g of gone) out.push(`--- ${g.code.toUpperCase()}: no money this week; the week before ${g.before.display} (say it)`);
  if (Object.keys(thisWeek.leftOut).length) out.push(`left out (not revenue): ${Object.entries(thisWeek.leftOut).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  out.push(`plan: ${filmSeconds} s film, at most ${maxWords} words of voice, the voice ends by ${data.plan.voice_must_end_by} s; scenes ${plan.map((s) => `${s.name}@${s.start}+${s.seconds}`).join(" ")}`);
  // The answer's fields, as they are: the agent copies them and computes nothing.
  const answer = {
    week: { start: data.week.start, end: data.week.end, label: data.week.label, timezone: w.timezone },
    metric: { id: METRIC.id, label: METRIC.label },
    source_line: data.source_line,
    compare: {
      state: compare.state,
      reason: compare.reason.slice(0, 400),
      restated: compare.restated.map((r) => ({ currency: r.currency, carried_minor: r.carried_revenue_minor, reread_minor: r.reread_revenue_minor })),
    },
    empty_week: empty,
    figures: currencies.map((c) => ({
      currency: c.code, filmed: c.filmed, revenue_minor: c.revenue.minor, revenue: c.revenue.exact, revenue_shown: c.revenue.display,
      gross_minor: c.gross.minor, charges: c.charges, refunds_count: c.refunds.count, refunds_minor: c.refunds.minor,
      disputes_count: c.disputes.count, disputes_minor: c.disputes.minor, fees_minor: c.fees.minor,
      best_day: c.best_day ? `${c.best_day.label} ${c.best_day.display}` : null,
      week_before_minor: c.change ? c.change.before.minor : null, change_minor: c.change ? c.change.minor : null,
      change_shown: c.change ? c.change.display : null, change_percent: c.change?.percent ? c.change.percent.value : null,
    })).slice(0, 20),
    gone: gone.map((g) => ({ currency: g.code, week_before_minor: g.before.minor })),
    left_out: Object.entries(thisWeek.leftOut).map(([category, count]) => ({ category: category.slice(0, 60), count })).slice(0, 20),
    carried: data.carry,
  };
  out.push(`answer fields (copy each into the answer exactly as printed): ${JSON.stringify(answer)}`);
  console.log(out.join("\n"));
}

// ---------- the film's files ----------
function writeData(film, data) {
  const path = join(film, "index.html");
  const html = readFileSync(path, "utf8");
  const re = /(<script id="mv-data">)[\s\S]*?(<\/script>)/;
  if (!re.test(html)) fail(2, `${path} has no <script id="mv-data"> block: copy the kit's index.html again`);
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  writeFileSync(path, html.replace(re, `$1\n      window.MV = ${json};\n    $2`));
}
function place(film, data, at, seconds) {
  const path = join(film, "index.html");
  let html = readFileSync(path, "utf8");
  const plan = data.plan.scenes;
  const total = seconds ?? data.plan.film_seconds;
  const starts = plan.map((s) => (at && at[s.name] !== undefined ? at[s.name] : s.start));
  if (starts[0] !== 0) fail(2, `the first scene (${plan[0].name}) starts at 0`);
  const timing = {};
  const hosts = plan.map((s, i) => {
    const start = Math.round(starts[i] * 100) / 100;
    const end = i + 1 < plan.length ? starts[i + 1] : total;
    const dur = Math.round((end - start) * 100) / 100;
    const n = Math.max(1, ["revenue", "days", "change", "refunds"].includes(s.name) ? data.currencies.filter((c) => c.filmed).length || 1 : 1);
    if (!(dur >= 2.5 * n)) fail(2, `${s.name} would last ${dur} s: each scene needs at least 2.5 s for each currency it shows (${n})`);
    timing[s.name] = { start, seconds: dur };
    return `      <div id="${s.name}" data-composition-id="${s.name}" data-composition-src="compositions/${s.name}.html" data-start="${start}" data-duration="${dur}" data-track-index="1" data-track-kind="graphics" data-width="1920" data-height="1080"></div>`;
  });
  const music = existsSync(join(film, "assets", "music.mp3"));
  const musicSeconds = Math.min(total, data.plan.film_seconds);
  const media = [
    `      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${total}" data-track-index="2" data-track-kind="captions" data-width="1920" data-height="1080"></div>`,
    `      <audio id="voiceover" class="clip" src="assets/voiceover.mp3" data-start="0.5" data-track-index="3" data-volume="1"></audio>`,
    ...(music ? [`      <audio id="music" class="clip" src="assets/music.mp3" data-start="0" data-duration="${musicSeconds}" data-track-index="4" data-volume="0.16" data-fade-in="0.4" data-fade-out="1.5"></audio>`] : []),
  ];
  html = html.replace(/(<!-- MV-HOSTS -->)[\s\S]*?(\s*<!-- \/MV-HOSTS -->)/, `$1\n${hosts.join("\n")}$2`);
  html = html.replace(/(<!-- MV-MEDIA -->)[\s\S]*?(\s*<!-- \/MV-MEDIA -->)/, `$1\n${media.join("\n")}$2`);
  html = html.replace(/(<div id="root" data-composition-id="main"[^>]*data-duration=")[0-9.]+(")/, `$1${total}$2`);
  writeFileSync(path, html);
  // Each scene's span (the clip every element of it sits in) lasts as long as its host.
  for (const s of plan) {
    const file = join(film, "compositions", `${s.name}.html`);
    if (!existsSync(file)) fail(2, `${file} is missing: copy the kit's compositions again`);
    // The span's opening tag, whatever order its attributes are in.
    const text = readFileSync(file, "utf8");
    const span = text.match(/<div\b[^>]*\bdata-mv-span\b[^>]*>/);
    const dur = /\bdata-duration="[0-9.]+"/;
    if (!span || !dur.test(span[0])) fail(2, `${file} has no <div data-mv-span> with a data-duration: copy the kit's compositions again`);
    writeFileSync(file, text.replace(span[0], () => span[0].replace(dur, `data-duration="${timing[s.name].seconds}"`)));
  }
  // Read back what was written: each host in index.html and its scene's span must last the same.
  const written = readFileSync(path, "utf8");
  const lasts = (tag) => (tag ? tag[0].match(/\bdata-duration="([0-9.]+)"/)?.[1] : undefined);
  for (const s of plan) {
    const host = lasts(written.match(new RegExp(`<div\\b[^>]*\\bid="${s.name}"[^>]*>`)));
    const span = lasts(readFileSync(join(film, "compositions", `${s.name}.html`), "utf8").match(/<div\b[^>]*\bdata-mv-span\b[^>]*>/));
    if (host === undefined || span === undefined || Number(host) !== Number(span) || Number(host) !== timing[s.name].seconds)
      fail(2, `${s.name}: its host in index.html lasts ${host ?? "(no host)"} s but its span lasts ${span ?? "(no span)"} s, and place set ${timing[s.name].seconds} s: copy the kit's index.html and compositions again, then run compute and place again`);
  }
  data.timing = timing;
  data.film_seconds = total;
  data.music = music;
  writeFileSync(join(film, "data.json"), JSON.stringify(data, null, 1) + "\n");
  writeData(film, data);
  return timing;
}

// ---------- customer data ----------
// Stripe's own words in an item: its enum fields, and its fee lines ("Stripe processing fees"). Every other string an
// item holds (its description above all, and anything an expanded object or metadata brings) can be a customer's.
const STRIPES_OWN = new Set(["object", "type", "reporting_category", "currency", "status", "balance_type"]);
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// A name's shape: two words side by side, each a capital and then letters, as a first and a last name.
const NAMEWORD = /^\p{Lu}[\p{L}'’-]+$/u;
// A pair is looked for in any case (in capitals, in lower case), as an email is, when it can be a name: both words in
// title case (a capital, then lower case somewhere), or any pair with a word that isn't one of Stripe's own. Stripe
// writes its own lines in capitals ("REFUND FOR CHARGE", "STRIPE PAYOUT"): a pair of only its words, and every whole
// value, is looked for as written, so a film that says "a refund for" in its own words is not taken for customer data.
// A name Stripe holds in capitals is still a name in any case.
const TITLED = (w) => NAMEWORD.test(w) && /\p{Ll}/u.test(w);
const STRIPES_WORDS = new Set(
  ("refund refunds for charge charges stripe payout payouts dispute disputes disputed fee fees chargeback withdrawal " +
    "reversal billing usage processing radar connect tax invoicing transfer adjustment application payment failure " +
    "failed partial capture account active of to from and the in on at by").split(" "),
);
const nameLike = (a, b) => (TITLED(a) && TITLED(b)) || !STRIPES_WORDS.has(a.toLowerCase()) || !STRIPES_WORDS.has(b.toLowerCase());
function customerValues(dir) {
  const found = new Map(); // value -> { where it came from, any case or not }, never printed with the value
  const add = (value, where, anyCase = false) => {
    if (value.length < 4) return;
    if (!found.has(value)) found.set(value, { where, anyCase });
    else if (anyCase) found.get(value).anyCase = true; // a whole description that is only a name is still a name
  };
  const walk = (value, key, where) => {
    if (key === "fee_details" || STRIPES_OWN.has(key)) return;
    if (typeof value === "string") {
      const v = value.trim();
      // One word of letters alone ("Refund", "Payment") is a common word as often as a name, and the kit's own scenes
      // hold such words: it is not looked for by itself. A name is looked for as a pair of words, below.
      if (!/^\p{L}+$/u.test(v)) add(v, `${where}: its ${key}`);
      for (const email of v.match(EMAIL) ?? []) add(email, `${where}: an email in its ${key}`, true);
      const words = v.split(/\s+/).map((w) => w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ""));
      for (let i = 0; i + 1 < words.length; i++) {
        if (NAMEWORD.test(words[i]) && NAMEWORD.test(words[i + 1])) {
          add(`${words[i]} ${words[i + 1]}`, `${where}: a name in its ${key}`, nameLike(words[i], words[i + 1]));
        }
      }
    } else if (Array.isArray(value)) value.forEach((v) => walk(v, key, where));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, k, where);
  };
  for (const { file, list } of readRaw(dir)) list.data.forEach((item, i) => walk(item, "item", `${file} item ${i + 1} (${item?.id ?? "no id"})`));
  return found;
}
// Every file the run wrote under `root`: dot-folders (the skills, the harness's own state) and node_modules are not
// the run's, the raw pages are where the values come from, a binary file (audio, video, images) holds no text, and a
// link is not followed (it points at a file the walk reaches anyway, or outside the run).
function runFiles(root, raw) {
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const st = lstatSync(path);
      if (st.isDirectory()) {
        if (!name.startsWith(".") && name !== "node_modules") walk(path);
      } else if (st.isFile() && !raw.has(path) && st.size <= 50e6) {
        const bytes = readFileSync(path);
        if (!bytes.subarray(0, 8000).includes(0)) out.push({ path, text: bytes.toString("utf8") });
      }
    }
  };
  walk(root);
  return out;
}
// Spacing is set aside for every value (a name broken over a line is the same name); case only for a name or an email.
// (No example value in this kit's text: a value the skill holds is not looked for, below.)
const squash = (s) => s.replace(/\s+/g, " ");
const fold = (s) => squash(s).toLowerCase();
function scan() {
  const dir = need("pages");
  const root = args.root && args.root !== "true" ? args.root : ".";
  const found = existsSync(dir) && rawFiles(dir).length ? customerValues(dir) : new Map();
  const raw = new Set(existsSync(dir) ? rawFiles(dir).map((f) => join(dir, f)) : []);
  // The template's own words: the skill folder the kit is copied from (film/ holds that copy, its comments included).
  // The run can write in that folder too, so only a file whose sha256 is the one kit/manifest.json gives (made with the
  // template, checked in its repository) is the template's; any other file there (one the run added or changed, the
  // manifest itself) is searched like every file the run wrote. With no manifest, no file there is the template's.
  const skill = join(root, typeof args.skill === "string" ? args.skill : ".agents/skills/metrics-video");
  let manifest = {};
  try {
    manifest = JSON.parse(readFileSync(join(skill, "kit", "manifest.json"), "utf8")).sha256 ?? {};
  } catch {
    manifest = {};
  }
  const skillFiles = existsSync(skill) ? runFiles(skill, new Set()) : [];
  const shipped = new Map(); // path inside the skill folder -> bytes, for each file the manifest vouches for
  for (const f of skillFiles) {
    const rel = relative(skill, f.path).split("\\").join("/");
    const bytes = readFileSync(f.path);
    if (manifest[rel] && createHash("sha256").update(bytes).digest("hex") === manifest[rel]) shipped.set(rel, { bytes, text: f.text });
  }
  // A value a shipped file holds as written ("Stripe processing fees" in a comment) is the template's text, not a
  // customer's, so it is not looked for. Held as written: a name made of two common words stays looked for when the
  // skill only has those words in lower case. So this kit's text holds no example name.
  const skillText = squash([...shipped.values()].map((f) => f.text).join("\n"));
  const values = new Map([...found].filter(([value]) => !skillText.includes(squash(value))));
  // A file in film/ still byte for byte a shipped kit file (metrics.mjs, review.mjs, a scene the run never changed)
  // holds only the template's words: it is not searched, so a customer's name that is also a phrase in the kit's code
  // can't fail every run. A copy the run changed is searched like any other file.
  const film = join(root, typeof args.film === "string" ? args.film : "film");
  const kitCopy = (path) => {
    const rel = relative(film, path).split("\\").join("/");
    const kitFile = shipped.get(`kit/${rel}`);
    return !rel.startsWith("..") && kitFile !== undefined && kitFile.bytes.equals(readFileSync(path));
  };
  const all = runFiles(root, raw);
  const written = skillFiles.filter((f) => !shipped.has(relative(skill, f.path).split("\\").join("/")));
  const files = [...all.filter((f) => !kitCopy(f.path)), ...written];
  const hits = [];
  for (const { path, text } of files) {
    const at = relative(root, path) || path;
    const asWritten = squash(text);
    const anyCase = asWritten.toLowerCase();
    for (const [value, { where, anyCase: folds }] of values) {
      const norm = folds ? fold : squash;
      const hay = folds ? anyCase : asWritten;
      const plain = norm(value);
      const escaped = norm(JSON.stringify(value).slice(1, -1));
      if (hay.includes(plain) || (escaped !== plain && hay.includes(escaped))) hits.push(`${at} holds a value from Stripe's ${where}`);
    }
    for (const email of text.match(EMAIL) ?? []) if (!values.has(email)) hits.push(`${at} holds an email address`);
  }
  if (hits.length) {
    fail(2, `customer data in the run's files: remove each from the file (and from anything made from it: the voiceover, the film), then scan again:\n- ${[...new Set(hits)].slice(0, 20).join("\n- ")}`);
  }
  const removed = [];
  if (args.final !== undefined) for (const path of raw) {
    unlinkSync(path);
    removed.push(path);
  }
  console.log(JSON.stringify({ clean: true, files: files.length, values: values.size, values_in_the_template: found.size - values.size, kit_copies_skipped: all.length - (files.length - written.length), skill_files_shipped: shipped.size, skill_files_searched: written.length, raw_pages_removed: removed }));
}

// ---------- the key stem ----------
// One stem per run, made here from the sandbox's random bytes, never by a model. It is kept with the week it was made
// for, so a stem file left from another week's film is never reused.
function stem() {
  const file = need("file");
  const w = weeks();
  const week = `${w.week.start} ${w.timezone}`;
  let kept = null;
  if (existsSync(file)) {
    try {
      kept = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      kept = null;
    }
  }
  if (kept && typeof kept.stem === "string" && /^[a-z0-9]{8}$/.test(kept.stem) && kept.week === week) {
    console.log(JSON.stringify({ stem: kept.stem, week, made: false }));
    return;
  }
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const made = [...randomBytes(8)].map((b) => letters[b % letters.length]).join("");
  writeFileSync(file, JSON.stringify({ stem: made, week }) + "\n");
  console.log(JSON.stringify({ stem: made, week, made: true }));
}

if (command === "weeks") {
  const w = weeks();
  delete w.carried;
  console.log(JSON.stringify(w, null, 1));
} else if (command === "compute") {
  compute();
} else if (command === "place") {
  const film = need("film");
  const data = JSON.parse(readFileSync(join(film, "data.json"), "utf8"));
  let at = null;
  if (args.at && args.at !== "true") {
    at = {};
    for (const pair of args.at.split(",")) {
      const [k, v] = pair.split("=");
      if (!data.plan.scenes.some((s) => s.name === k) || !Number.isFinite(Number(v))) fail(2, `--at takes scene=seconds for the plan's scenes (${data.plan.scenes.map((s) => s.name).join(", ")}): ${pair}`);
      at[k] = Number(v);
    }
  }
  const seconds = args.seconds && args.seconds !== "true" ? Number(args.seconds) : null;
  if (seconds !== null && !(seconds >= data.plan.film_seconds && seconds <= data.plan.film_seconds + 10)) fail(2, `--seconds is the film's length when the voice runs long: from ${data.plan.film_seconds} to ${data.plan.film_seconds + 10}`);
  const timing = place(film, data, at, seconds);
  console.log(JSON.stringify({ film_seconds: seconds ?? data.plan.film_seconds, music: existsSync(join(film, "assets", "music.mp3")), timing }));
} else if (command === "scan") {
  scan();
} else if (command === "stem") {
  stem();
} else {
  fail(2, "usage: node metrics.mjs weeks|compute|place|scan|stem ... (the header of this file says each)");
}
