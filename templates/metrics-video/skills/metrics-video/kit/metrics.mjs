#!/usr/bin/env node
// metrics.mjs: every number of the weekly metrics film, worked out by code from Stripe's balance transactions.
// AgentRun files Stripe's answers in the run's folder (the template's `file` setting); this script does the calendar, the sums, the differences, the
// percentages, the rounding and the words the voice says for each figure, and writes the one data module every scene
// reads. Nothing here guesses: a figure it cannot work out is an error, never an estimate.
//
//   node metrics.mjs weeks   --today YYYY-MM-DD --timezone <IANA> [--week-of YYYY-MM-DD] [--carried carried.json]
//   node metrics.mjs compute --today YYYY-MM-DD --timezone <IANA> [--week-of YYYY-MM-DD] [--carried carried.json]
//                            --pages stripe --film film [--business "Name"]
//   node metrics.mjs place   --film film [--at revenue=5.2,change=14.0,...] [--seconds 47]
//   node metrics.mjs stem    --file media/run-keys.json --today YYYY-MM-DD --timezone <IANA> [--week-of YYYY-MM-DD]
//   node metrics.mjs scan    --pages stripe [--root .] [--film film] [--final]
//   node metrics.mjs scan    --pages stripe --purge
//
// --today is the run's date in the time zone: the day the schedule fired (its line names it in the schedule's zone),
// or for a run by hand the day the run's environment line gives. Never the sandbox's clock.
// weeks    prints the week to film (Monday 00:00 to the next Monday 00:00 in the time zone), the week before it, and
//          the window to read from Stripe: both weeks when the carried figures are for the week before (they are
//          compared), else the week alone.
// compute  reads every answer of STRIPE_LIST_BALANCE_TRANSACTIONS AgentRun filed in stripe/, in name order (an error
//          answer passed over, a transaction on two pages counted once), takes eight fields of each item (id, created, type,
//          reporting_category, currency, amount, fee, net) and nothing else, checks each (net = amount - fee), keeps the
//          revenue categories, adds each week up per currency (never across currencies), compares the week before
//          with the carried figures, and writes film/data.json and the same object into film/index.html (window.MV).
//          It prints the figures, the words to say for each, the film's plan and the carry for the answer.
// place    sets each scene's start and length in film/index.html and each scene's span from --at (scene=start,...),
//          the film's length, the captions host and the music (kept only when film/assets/music.mp3 exists).
// stem     prints the run's key stem: the one in the file when it was made for this week, else a new one from the
//          sandbox's random bytes, written there first. A model never makes one.
// scan     looks for customer data in every file the run wrote: each string a filed page's items hold (a description, a
//          name, an email, an id; not Stripe's enum fields, its fee lines or a single word alone), each name in one (a
//          pair of capitalised words, or two through an initial; in any case, with or without the initial), each
//          pair of lower-case words in one, neither a common word nor Stripe's (in any case), a name in an identity
//          field (a customer's, a billing or shipping name) in every shape, and any email address, in each file as
//          written and in what each voice says (the letters of fal's timestamps, in any JSON file that holds them).
//          Each word of a capitalised pair or of an identity name is looked for alone too (in any case; four letters
//          or more from a pair, not a common word), in every text file the run wrote and what a voice says: a JSON
//          file's strings, the text an HTML file shows, and each text file's name below the kit's own folders (a path
//          the kit or the skill names is no one's; never printed when it holds one). Not
//          in the kit's code (film/'s and the skill folder's .js, .mjs, .cjs and .css; an HTML file's styles, scripts,
//          comments, tags and attributes: "font-family", "white-space"), a tool's output at the paths the skill names
//          (media/check.json, media/render.log, media/review*/snapshot.log) or inputs/. The
//          kit's own phrases (a currency's unit, compute's sentences) are taken out first, and a description's pair
//          inside one ("swiss francs") is not a name.
//          The business's own name, as compute was given it (film/data.json, which the run can write, as it types
//          compute's --business), is set aside; scan takes no other; a time zone in it that no machine knows is no
//          kit phrase. With --final (after billing), a word of a description's name found alone in media/answer.json
//          only warns on stderr, naming the file and line, never the word: the answer keeps tool words on purpose. In
//          every other file, in what a voice says, and for an identity field's name anywhere, it exits 2, as whole
//          values, pairs and emails do. The first --final that only warns keeps the filed pages, notes the files and
//          lines inside each page (MARK, never a file of the run's own) and exits 4 ("clean": false): the agent takes
//          a customer's name out of the answer and runs --final once more, whether it edited or not. When no page can
//          carry the note (each a link, or holding no JSON object), that --final would be a first again, every time:
//          it stops instead (exit 3, failed_step "stripe"), the pages removed, links as links. Otherwise that run is the
//          last: a word may warn again and that's fine, anything else found stops the film, and the filed pages are
//          removed on every exit (its own, a refused argument, bad pages, a throw, SIGTERM, SIGINT or SIGHUP). A first
//          --final removes them on every exit but two, which keep them for its retry: a value found (exit 2: take it
//          out, --final again) and a warning alone (exit 4). Any other exit of it (a refused argument, bad pages, a
//          throw) leaves no scan able to check the run's files again, so the film stops. A --final that exits 0 has
//          removed every filed page. Every --final removes a page the run wrote too.
// --purge  removes every page (filed, or the run's own) and searches nothing: for a run that stops with customer data
//          still in a file (failed_step customer_data), whose --final would keep the pages for a retry. Found only where the whole description is written as it is: a word of a lower-case pair alone,
//          a name with a lower-case particle ("da Silva", "van Gogh", "de la Cruz"), one given name alone in a
//          longer description ("Tip from Sarah"), a pair in mixed case ("Marisol quintero"). Not found: a
//          description of one word, a name spelled another way.
//
// A filed page is Composio's whole answer as AgentRun filed it ({"data": <Stripe's list>, "successful": ...}), or
// Stripe's list alone ({"object": "list", "data": [...], "has_more": ...}), at
// stripe/STRIPE_LIST_BALANCE_TRANSACTIONS-<time>-<id>.json. It holds customers' details (a charge's description can name
// one), so only compute and scan read it, scan never searches it as a file the run wrote, and scan --final removes it.
// The tool's result the model gets never holds it; the model's own bash can still open it, so the skill says never to.
// A page the run wrote itself (stripe/raw-<n>.json) is refused by both, exit 3: the answers were not filed.
// Every exit 3 that says to answer failed removes every page first (filed, or the run's own), so no copy of Stripe's
// answers outlives a run that stops there; but one, the refusal of --pages itself, which removes nothing and says to
// run scan --pages stripe --purge from the run's folder first. Exit 3 asking for the next page, or for the run's
// --today, keeps them for the compute that follows. A page is removed by its name in the folder: a link goes, never
// what it points at; a folder is never entered, nor a pages folder that is itself a link.
// --pages names a folder inside the run's folder, wherever its links lead: compute and scan refuse any other (exit 3),
// read nothing there and remove nothing. The run's folder is the one that holds the kit's own folder (film/ in a run),
// never where the kit runs nor scan's --root: the run chooses both. It is never the pages folder itself.
// The first --final's note is written only into a page that is a file of its own, never a link (nor a hard link: its
// file has another name). Removal and the note work from inside the folder checked (the same device and inode, and
// once entered really inside the run's folder), and the note opens each page without following a link and checks the
// open file is the one looked at: a name swapped after the check, the folder's or a parent's, is never followed. A note
// that can't be written whole (a short write, a full disk) stops the run: exit 3, every page removed.
// A throw in compute removes the pages too, as its refusals do.
// Exit 2: wrong arguments, a film whose files don't match the kit (place reads every host and scene back after writing
// them; the message names the scene), or customer data in a file (scan names the file and the item, never the value);
// 3: the pages are wrong or incomplete, or a page is the run's own (the message says what to do); 4: scan --final only warned, the filed pages are kept for one more --final (not done); 0: done.
import { createHash, randomBytes } from "node:crypto";
import { closeSync, constants, existsSync, fstatSync, ftruncateSync, lstatSync, openSync, readFileSync, readdirSync, realpathSync, statSync, unlinkSync, writeFileSync, writeSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const METRIC = {
  id: "net-of-refunds-and-fees",
  label: "Revenue: net of refunds and Stripe fees, from Stripe balance transactions",
};
// The words compute writes into data.json itself: its sentences (each "{}" filled with a value, in order), the
// comparison's states, a change's directions and the words it says a figure in. They are written from here only, and
// scan takes each sentence's fixed parts and each word out of a text, whole, as the kit's own phrases, before a
// name's words alone are looked for: the run can't reword them, and a value filled into one is still searched.
const SAYS = {
  first: "no earlier result was handed to this run: the first film of this schedule, or a run by hand",
  otherMetric: "the last result counted another figure ({}): no week over week",
  otherZone: "the last result's weeks were in {}, this run's in {}: no week over week",
  otherWeek: "the last result covered the week of {}, not the week before this one ({}): no week over week",
  unknownDay: "an unknown day",
  carried: "the last result carried the week of {}: it is read again from Stripe and compared",
  restated: "Stripe's figures for the week of {} changed after the last film: the week over week uses them as read now{}",
  matches: "the week of {} read again matches the carried figures{}",
  unchecked: " ({}: not in the last result's carried figures, which hold only {} currencies, so not checked against them)",
  zone: "weeks in {}",
};
const says = (key, ...values) => {
  let i = 0;
  return SAYS[key].replace(/\{\}/g, () => String(values[i++]));
};
const STATE = { none: "none", carried: "carried", restated: "restated" };
const DIRECTION = { up: "up", down: "down", flat: "flat" };
const NUMBER_WORDS = { minus: "minus", point: "point", scales: [[1e12, "trillion"], [1e9, "billion"], [1e6, "million"], [1e3, "thousand"]] };
// Stripe's reporting categories that make up the figure: money in (charge) and what takes it back off the charges (a
// charge that failed after it was credited, charge_failure; the uncaptured rest of a partial capture,
// partial_capture_reversal), money back (refund) and a refund that failed and returned (refund_failure), money taken
// back by a dispute and returned when it is won (dispute, dispute_reversal), and Stripe's own fees billed on their own
// (fee). Payouts, transfers, top-ups and every other category move money, not revenue, and are left out (and counted).
const KEPT = new Set(["charge", "charge_failure", "partial_capture_reversal", "refund", "refund_failure", "dispute", "dispute_reversal", "fee"]);
const MAX_PAGES = 10;
const MAX_FILMED = 3; // currencies the film shows; more are named on the end card and in the report
// The least time one figure of the refunds scene is on screen: its count (1.4 s from 0.25 s in), a second to read it,
// and its fade. A currency whose figures can't each have it in turn shows them side by side, so the scene needs this
// much for each currency it shows (place refuses less).
const ITEM_SECONDS = 3;
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

// Set by every exit this script chooses, so an exit hook can tell a throw from them.
let chosenExit = false;
function fail(code, message) {
  chosenExit = true;
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
  let compare = { with_carried: false, reason: says("first") };
  if (carried) {
    if (carried.metric !== METRIC.id) compare.reason = says("otherMetric", String(carried.metric).slice(0, 60));
    else if (carried.timezone !== tz) compare.reason = says("otherZone", String(carried.timezone).slice(0, 40), tz);
    else if (!carried.week || carried.week.start !== before.start) compare.reason = says("otherWeek", carried.week?.start ?? says("unknownDay"), before.start);
    else compare = { with_carried: true, reason: says("carried", before.start) };
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
  if (n < 0) return `${NUMBER_WORDS.minus} ${words(-n)}`;
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${words(n % 100)}` : ""}`;
  for (const [v, name] of NUMBER_WORDS.scales) {
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
  const spoken = `${words(whole)}${tenth ? ` ${NUMBER_WORDS.point} ${ONES[tenth]}` : ""} percent`;
  const display = `${change > 0 ? "+" : change < 0 ? MINUS : ""}${whole}.${tenth}%`;
  return { value, display, spoken };
}

// ---------- Stripe's pages ----------
// The eight fields the figures use; the script takes them from each item itself, and nothing else of an item is kept.
const FIELDS = ["id", "created", "type", "reporting_category", "currency", "amount", "fee", "net"];
// The pages are Stripe's answers as AgentRun files them: the template's `file` setting on the balance list has serve
// write each answer whole, scrubbed, at <folder>/STRIPE_LIST_BALANCE_TRANSACTIONS-<time>-<id>.json before the model gets
// its turn back, and the model gets only a summary (its bytes, the path, the values at the show paths, the shape). The
// time is an ISO instant with ":" and "." as "-", so the names sort in the order the answers came. Nothing else in the
// folder is a page: not carried.json, not a file the run wrote.
const TOOL = "STRIPE_LIST_BALANCE_TRANSACTIONS";
const FILED = /^STRIPE_LIST_BALANCE_TRANSACTIONS-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-[A-Za-z0-9]+\.json$/;
const rawFiles = (dir) => readdirSync(dir).filter((f) => FILED.test(f)).sort();
// A page the run wrote itself (stripe/raw-<n>.json, as this kit once had the agent save them): refused, never read.
const OWN_PAGE = /^raw-\d+\.json$/;
const notFiled = (dir, own) =>
  `${own.map((f) => `${dir}/${f}`).join(", ")}: a page the run wrote itself. Stripe's answers were not filed by AgentRun: the owner removed the agent's file setting on ${TOOL}, or the call was not made through it. The kit reads only the answers AgentRun files (${dir}/${TOOL}-<time>-<id>.json) and never a page the run wrote: make nothing, pay nothing, and answer failed, failed_step "stripe", with these words.`;
function refuseOwnPages(dir) {
  const own = existsSync(pagesAt) ? readdirSync(pagesAt).filter((f) => OWN_PAGE.test(f)).sort() : [];
  if (own.length) stop(notFiled(dir, own));
}
// Every page in the folder, filed or the run's own, removed by its name in the folder itself and nothing else: a link
// is removed as a link (what it points at stays), a folder named as a page is not entered, and a folder that is itself
// a link is not entered at all. Returns what went and what could not.
// The folder is the one pagesFolder (below) checks: inside the run's folder, and not a link. It is listed and each page
// removed from inside it (inPagesFolder), never through a path looked up again after the check.
function removePagesIn(dir) {
  const removed = [];
  const left = [];
  const { refused } = inPagesFolder(dir, () => {
    let names;
    try {
      names = readdirSync(".");
    } catch {
      left.push(dir);
      return;
    }
    for (const f of names.filter((f) => FILED.test(f) || OWN_PAGE.test(f)).sort()) {
      const path = join(dir, f);
      try {
        if (lstatSync(f).isDirectory()) {
          left.push(path);
          continue;
        }
        unlinkSync(f);
        removed.push(path);
      } catch {
        left.push(path);
      }
    }
  });
  if (refused) return { removed, left: [`${dir} (${refused}: never entered)`] };
  return { removed, left };
}
// The folder of pages this command was given (compute's and scan's --pages), as given: it names the folder in messages.
let pagesDir = null;
// Where checkPages found it (pagesFolder's real path): every page is listed and read there, never through the path as
// given, whose ".." would be taken after a link it passes ("a/../stripe" with a a link is the link's ../stripe).
let pagesAt = null;
// The folder --pages must be inside: the run's, the one that holds the kit's own folder (film/metrics.mjs in a run).
// Not the folder the kit runs in, nor scan's --root: the run chooses those, and `cd /` or `--root /` would make the
// whole disk the run's.
const runFolder = () => realpathSync(dirname(dirname(fileURLToPath(import.meta.url))));
// A path with every link in it resolved, as far as it exists; the rest as written.
function realOf(path) {
  const rest = [];
  for (let head = path; ; head = dirname(head)) {
    try {
      return join(realpathSync(head), ...rest);
    } catch (e) {
      if (e?.code !== "ENOENT" || dirname(head) === head) throw e;
      rest.unshift(basename(head));
    }
  }
}
// Where --pages is, once its links are resolved: its parent folder's real path, and its own name looked at with lstat
// (never followed). It must be inside runFolder() (its path from there neither starts with .. nor is absolute), not be
// that folder itself, and be a folder, not a link. "stripe/", "stripe//" and "stripe/." are looked at as resolve()
// writes them, so a link named stripe is seen as the link. Returns { at, st } (the real path, and its lstat),
// { at, missing } (no folder there: no page), or { refused } (why: nothing in it is read or removed).
function pagesFolder(dir) {
  let at;
  let rel;
  try {
    const given = resolve(dir);
    at = join(realOf(dirname(given)), basename(given));
    rel = relative(runFolder(), at);
  } catch (e) {
    return { refused: `it can't be looked at (${e?.code ?? e})` };
  }
  // The run's folder itself ("." or "" from there) holds the run's files, never Stripe's pages alone.
  if (rel === "") return { refused: "it is the run's folder itself" };
  if (isAbsolute(rel) || rel.split(sep)[0] === "..") return { refused: "it is outside the run's folder" };
  let st;
  try {
    st = lstatSync(at);
  } catch (e) {
    if (e?.code === "ENOENT") return { at, missing: true };
    return { refused: `it can't be looked at (${e?.code ?? e})` };
  }
  if (st.isSymbolicLink()) return { refused: "it is a link" };
  if (!st.isDirectory()) return { refused: "it is not a folder" };
  return { at, st };
}
// Runs fn with the pages folder as the folder the kit works in, once that is the very folder pagesFolder checked (the
// same device and inode) and, entered, is really inside the run's folder: every name fn uses is a bare name in that
// folder, so a name on the folder's path swapped for a link after the check changes nothing fn reads, writes or
// removes. The kit's own folder is restored after, and must
// be the one it left. Returns { value } (fn's), or { refused } or { missing } when fn never ran. fn must not exit.
function inPagesFolder(dir, fn) {
  const checked = pagesFolder(dir);
  if (checked.refused || checked.missing) return checked;
  const back = process.cwd();
  const home = statSync(".");
  try {
    process.chdir(checked.at);
  } catch (e) {
    return { refused: `it can't be entered (${e?.code ?? e})` };
  }
  try {
    const here = statSync(".");
    if (here.dev !== checked.st.dev || here.ino !== checked.st.ino) return { refused: "it changed after it was checked" };
    // And where the folder entered really is: the working folder's real path, as the system gives it after the chdir,
    // never the path text checked. A folder on that path swapped for a link after the check (stripe's parent, say)
    // leads elsewhere, and the device and inode, read through the same link, would agree; this does not.
    const where = relative(runFolder(), process.cwd());
    if (where === "" || isAbsolute(where) || where.split(sep)[0] === "..") return { refused: "it changed after it was checked" };
    return { value: fn() };
  } finally {
    process.chdir(back);
    const now = statSync(".");
    if (now.dev !== home.dev || now.ino !== home.ino) throw new Error(`${back} changed while the kit worked in ${dir}: it can't go on there`);
  }
}
// compute and scan start here: a pages folder outside the run's, or one that is a link, is refused before any page
// is read or removed.
function checkPages(dir) {
  const { at, refused } = pagesFolder(dir);
  pagesAt = at;
  if (refused) fail(3, `--pages ${dir}: ${refused}. The kit reads and removes pages only in a folder inside the run's (the folder that holds film/), never through a link, so it read and removed nothing. AgentRun files Stripe's answers in stripe/ in the run's folder: run from there with --pages stripe. Otherwise make nothing and pay nothing; this exit removed no page, so when stripe/ in the run's folder holds pages, run \`node film/metrics.mjs scan --pages stripe --purge\` from the run's folder first (with this --pages it would be refused too), then answer failed, failed_step "stripe", with these words.`);
}
// A refusal that ends the run's use of the pages (the message says to answer failed): every page goes before it exits,
// so no copy of Stripe's answers outlives a run that stops here.
function stop(message) {
  const { left } = pagesDir === null ? { left: [] } : removePagesIn(pagesDir);
  fail(3, `${message}\n${left.length ? `Could not remove ${left.join(", ")}: remove them before answering.` : "Stripe's pages are removed."}`);
}
// A page: Stripe's list ({"object": "list", "data": [...], "has_more": ...}), or Composio's whole answer around it
// ({"data": <that list>, "successful": true, ...}).
function listOf(page) {
  if (Array.isArray(page?.data) && typeof page.has_more === "boolean") return page;
  if (page && typeof page === "object" && "successful" in page && Array.isArray(page.data?.data) && typeof page.data.has_more === "boolean") return page.data;
  return null;
}
// An answer that is an error, filed as every answer is: Composio's `successful: false`, a tool error's text that is no
// JSON, or JSON that says isError. The model saw `successful` and `error` in the summary; the kit passes it over, and
// the check that the pages reach the window's start still holds without it.
const errorAnswer = (text) => {
  let page;
  try {
    page = JSON.parse(text);
  } catch {
    return true;
  }
  return page !== null && typeof page === "object" && (page.successful === false || page.isError === true);
};
// Each filed page's list, in name order, and how many filed answers were errors. A page the run wrote is refused; a
// filed answer that is neither a list nor an error is too.
function filedPages(dir) {
  refuseOwnPages(dir);
  const pages = [];
  let errors = 0;
  for (const f of existsSync(pagesAt) ? rawFiles(pagesAt) : []) {
    const text = readFileSync(join(pagesAt, f), "utf8");
    if (errorAnswer(text)) {
      errors++;
      continue;
    }
    const list = listOf(JSON.parse(text));
    if (!list) stop(`${dir}/${f} is not Stripe's list ({"object": "list", "data": [...], "has_more": true|false}) nor Composio's answer around it: the film can't be made from it. Answer failed, failed_step "stripe".`);
    pages.push({ file: f, list });
  }
  return { pages, errors };
}
// compute's pages: at least one list, at most MAX_PAGES.
function readRaw(dir) {
  const { pages, errors } = filedPages(dir);
  if (!pages.length && !errors) stop(`no answer of ${TOOL} is filed in ${dir}: call the tool (AgentRun files each answer there, whole). If you called it and nothing was filed, the owner removed the agent's file setting on it: make nothing and answer failed, failed_step "stripe".`);
  if (!pages.length) stop(`every answer of ${TOOL} filed in ${dir} is an error (${errors}): nothing to work out. Answer failed, failed_step "stripe", with the error the tool's result showed.`);
  if (pages.length > MAX_PAGES) stop(`${pages.length} pages: this film reads at most ${MAX_PAGES} pages (${MAX_PAGES * 100} transactions). Answer failed, failed_step "stripe".`);
  return Object.assign(pages, { errors });
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
      if (item?.object !== "balance_transaction") problems.push(`${at}: "object": "balance_transaction" is missing: not a whole balance transaction`);
      if (typeof t.id !== "string" || !t.id) problems.push(`${at}: id is missing`);
      for (const k of ["created", "amount", "fee", "net"]) if (!Number.isInteger(t[k])) problems.push(`${at}: ${k} is not a whole number as Stripe gives it`);
      for (const k of ["type", "reporting_category", "currency"]) if (typeof t[k] !== "string") problems.push(`${at}: ${k} is missing`);
      if (typeof t.currency === "string" && !/^[a-z]{3}$/.test(t.currency)) problems.push(`${at}: currency ${t.currency} is not Stripe's three lower-case letters`);
      if (Number.isInteger(t.amount) && Number.isInteger(t.fee) && Number.isInteger(t.net) && t.net !== t.amount - t.fee) {
        problems.push(`${at} (${t.id}): net ${t.net} is not amount ${t.amount} - fee ${t.fee}`);
      }
      // A transaction on two pages (a call made again, a page asked for twice) is the same transaction: counted once.
      if (typeof t.id === "string" && byId.has(t.id)) {
        const a = JSON.stringify(byId.get(t.id));
        if (a !== JSON.stringify(t)) problems.push(`${at}: ${t.id} appears twice with different values`);
        continue;
      }
      if (typeof t.id === "string") byId.set(t.id, t);
    }
    last = list;
  }
  // Serve files Stripe's answers whole: an item that fails these checks is Stripe's (or Composio's) as it answered, and
  // nothing the run does can fix it.
  if (problems.length) stop(`Stripe's answers as filed don't check, so the film can't be made from them. Answer failed, failed_step "stripe", with these lines:\n- ${problems.slice(0, 20).join("\n- ")}`);
  return { transactions: [...byId.values()], lastHasMore: last.has_more, pages: raw.length, errors: raw.errors };
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
    if (f.revenue !== f.gross - f.refunds[1] - f.disputes[1] + f.reversals[1] - f.fees) stop(`the ${c} figures do not add up; a category this script does not know moved money. Answer failed, failed_step "figures", with these words.`);
  }
  return { by, leftOut };
}
const carriedRow = (c, f) => ({
  currency: c, revenue_minor: f.revenue, gross_minor: f.gross, charges: f.charges,
  refunds_count: f.refunds[0], refunds_minor: f.refunds[1], disputes_count: f.disputes[0], disputes_minor: f.disputes[1], fees_minor: f.fees,
});
// The most currencies a result carries to the next week's run (the schema's carried.figures maxItems). A week with more
// carries the ten it lists first and says it holds only some (complete: false).
const CARRIED_MAX = 10;
// The most currencies a week may have, this week or the week before: the answer lists every one of them (figures and
// gone, maxItems 20 in the schema; restated, at most the carried ten and the week before's twenty, maxItems 30), so a
// week with more is refused in words, never cut short.
const MAX_CURRENCIES = 20;
// The most kinds of movement that are not revenue (Stripe's reporting categories: payout, transfer, topup and the like)
// a week may have. Stripe lists about thirty; the answer names every one with its count (left_out, maxItems 40), so a
// week with more is refused in words, never cut short.
const MAX_LEFT_OUT = 40;
const COMPARED = ["revenue_minor", "gross_minor", "charges", "refunds_count", "refunds_minor", "disputes_count", "disputes_minor", "fees_minor"];

// A throw in compute (a page it can't read, a fault of its own) ends the run's use of the pages, as its refusals do:
// they go, once, from a try/finally around compute and from an exit hook. compute's own exits (fail) are left as they
// are: the asks for the next page and for --today keep the pages, and stop() has removed them.
let removedAfterThrow = false;
function removeAfterThrow() {
  if (removedAfterThrow || pagesDir === null) return;
  removedAfterThrow = true;
  const { left } = removePagesIn(pagesDir);
  console.error(`compute stopped on an error, not a refusal. Stripe's pages are removed${left.length ? ` (but not ${left.join(", ")}: remove them before answering)` : ""}. Make nothing, pay nothing, and answer failed, failed_step "figures", with the error's first line.`);
}
function compute() {
  const w = weeks();
  const film = need("film");
  if (!existsSync(join(film, "index.html"))) fail(2, `${film}/index.html is missing: copy the kit into ${film}/ first`);
  pagesDir = need("pages");
  checkPages(pagesDir);
  process.on("exit", (code) => {
    if (code !== 0 && !chosenExit) removeAfterThrow();
  });
  const { transactions, lastHasMore, pages, errors } = readPages(pagesDir);
  const oldest = Math.min(...transactions.map((t) => t.created));
  if (lastHasMore && !(oldest < w.read.created_gte)) {
    fail(3, `Stripe said has_more on the last page filed and the oldest transaction read (${new Date(oldest * 1000).toISOString()}) is not before the window's start (${new Date(w.read.created_gte * 1000).toISOString()}): call ${TOOL} again with starting_after the last id its result showed (AgentRun files that page too), then compute again`);
  }
  const late = transactions.filter((t) => t.created >= w.end_of_today_unix);
  if (late.length) fail(3, `${late.length} transaction(s) are dated after ${w.today} in ${w.timezone}: --today must be the run's date (${late.slice(0, 3).map((t) => t.id).join(", ")})`);

  const thisWeek = addUp(transactions, w.week);
  const before = w.week_before ? addUp(transactions, w.week_before) : null;
  const order = [...thisWeek.by.entries()].sort((a, b) => b[1].kept - a[1].kept || a[0].localeCompare(b[0]));
  const empty = order.length === 0;
  for (const [which, week, by] of [["this week", w.week, thisWeek.by], ["the week before", w.week_before, before?.by]]) {
    if (by && by.size > MAX_CURRENCIES) stop(`${by.size} currencies in ${which} (${week.start} to ${week.end}): this film reports at most ${MAX_CURRENCIES} currencies a week, each with its figures, so it makes nothing for this week. Answer failed, failed_step "figures", with these words.`);
  }
  const kinds = Object.keys(thisWeek.leftOut).length;
  if (kinds > MAX_LEFT_OUT) stop(`${kinds} kinds of movement that are not revenue in the week (${w.week.start} to ${w.week.end}): this film names at most ${MAX_LEFT_OUT} with their counts, so it makes nothing for this week. Answer failed, failed_step "figures", with these words.`);

  // The carried figures against Stripe's figures for the same week, read again now.
  let compare = { state: STATE.none, reason: w.compare.reason, restated: [] };
  const priorRow = new Map();
  if (before) {
    const carried = new Map((w.carried.figures ?? []).map((r) => [r.currency, r]));
    // A currency the carry doesn't hold had no money that week only when the carry holds every currency: it says so
    // (complete), or, from a result before that field, it holds fewer than the most it could. Else its carried figure
    // is unknown: it is never checked against the carry, and never said to be restated. Its week before is still
    // Stripe's, read again, as for every currency.
    const whole = w.carried.complete === true || (w.carried.complete === undefined && carried.size < CARRIED_MAX);
    const currencies = new Set([...carried.keys(), ...before.by.keys()]);
    const restated = [];
    const notCarried = [];
    for (const c of [...currencies].sort()) {
      const reread = carriedRow(c, before.by.get(c) ?? emptyFigures());
      priorRow.set(c, reread);
      if (!carried.has(c) && !whole) {
        notCarried.push(c);
        continue;
      }
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
    const unchecked = notCarried.length ? says("unchecked", notCarried.map((c) => c.toUpperCase()).join(", "), CARRIED_MAX) : "";
    compare = restated.length
      ? { state: STATE.restated, reason: says("restated", w.week_before.start, unchecked), restated }
      : { state: STATE.carried, reason: says("matches", w.week_before.start, unchecked), restated: [] };
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
        direction: f.revenue > prior ? DIRECTION.up : f.revenue < prior ? DIRECTION.down : DIRECTION.flat,
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
  const tzNote = says("zone", w.timezone);
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
    plan: { film_seconds: filmSeconds, max_words: maxWords, voice_must_end_by: Math.round((filmSeconds - 3) * 10) / 10, item_seconds: ITEM_SECONDS, scenes: plan },
    timing: Object.fromEntries(plan.map((s) => [s.name, { start: s.start, seconds: s.seconds }])),
    carry: {
      metric: METRIC.id,
      timezone: w.timezone,
      week: { start: w.week.start, end: w.week.end },
      figures: order.map(([c, f]) => carriedRow(c, f)).slice(0, CARRIED_MAX),
      complete: order.length <= CARRIED_MAX,
    },
  };
  writeFileSync(join(film, "data.json"), JSON.stringify(data, null, 1) + "\n");
  writeData(film, data);
  place(film, data, null, null);

  // What the agent reads: every figure with its words, the plan, the carry.
  const out = [];
  out.push(`week: ${data.week.label} (${data.week.start} to ${data.week.end}, ${w.timezone}); read ${pages} page(s), ${transactions.length} transactions${errors ? `; ${errors} error answer(s) filed and passed over` : ""}`);
  out.push(`metric: ${METRIC.label}`);
  out.push(`source line: ${data.source_line}`);
  out.push(`compare: ${compare.state}: ${compare.reason}`);
  if (empty) out.push("EMPTY WEEK: no charge, refund, dispute or fee in any currency. Say so plainly; no chart, no trend.");
  for (const c of currencies) {
    out.push(`--- ${c.code.toUpperCase()}${c.filmed ? "" : " (not filmed: named on the end card and in the report)"}`);
    out.push(`revenue: ${c.revenue.exact} exact; film ${c.revenue.display}; say "${c.revenue.spoken}"`);
    out.push(`charges: ${c.charges} for ${c.gross.exact} gross; fees ${c.fees.exact}`);
    out.push(`refunds: ${c.refunds.count}, ${c.refunds.exact}; film ${c.refunds.display}; say "${c.refunds.spoken}"`);
    out.push(`disputes: ${c.disputes.count}, ${c.disputes.exact}; film ${c.disputes.display}; say "${c.disputes.spoken}"${c.dispute_reversals.count ? `; won back: ${c.dispute_reversals.count}, ${c.dispute_reversals.exact}; film ${c.dispute_reversals.display}; say "${c.dispute_reversals.spoken}"` : ""}`);
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
    })),
    gone: gone.map((g) => ({ currency: g.code, week_before_minor: g.before.minor })),
    left_out: Object.entries(thisWeek.leftOut).map(([category, count]) => ({ category: category.slice(0, 60), count })),
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
  writeFileSync(path, html.replace(re, (_, a, b) => `${a}\n      window.MV = ${json};\n    ${b}`));
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
    if (s.name === "refunds" && !(dur >= ITEM_SECONDS * n)) fail(2, `refunds would last ${dur} s: each currency's refunds, disputes and money won back need ${ITEM_SECONDS} s to count and be read (${n} currencies, ${ITEM_SECONDS * n} s)`);
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
  html = html.replace(/(<!-- MV-HOSTS -->)[\s\S]*?(\s*<!-- \/MV-HOSTS -->)/, (_, a, b) => `${a}\n${hosts.join("\n")}${b}`);
  html = html.replace(/(<!-- MV-MEDIA -->)[\s\S]*?(\s*<!-- \/MV-MEDIA -->)/, (_, a, b) => `${a}\n${media.join("\n")}${b}`);
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
// A word of a pair held in lower case that can be half of a name: three letters or more, all lower case, not a common
// word nor Stripe's (checked against COMMON below).
const LOWER = /^\p{Ll}[\p{Ll}'’-]{2,}$/u;
// Words too common to be a name on their own: English's most used words, the calendar, money and shop words, and the
// words a film of a week's revenue says. A pair held in lower case is a name only when neither word is one of these,
// and a word of a name looked for alone never is one.
const COMMON = new Set(
  (
    // the calendar
    "january february march april may june july august september october november december jan feb mar apr jun jul aug " +
    "sep sept oct nov dec monday tuesday wednesday thursday friday saturday sunday mon tue tues wed thu thur thurs fri " +
    "sat sun today tomorrow yesterday tonight morning afternoon evening night day days week weeks weekly weekend month " +
    "months monthly year years yearly annual annually daily hour hours minute minutes second seconds quarter quarterly " +
    "spring summer autumn fall winter holiday holidays christmas easter season " +
    // money, shops and orders
    "revenue gross net total totals subtotal sum amount amounts price prices cost costs paid pay pays paying sale sales " +
    "sold buy bought purchase purchases order orders ordered invoice invoices receipt bill bills balance deposit " +
    "deposits subscription subscriptions renewal renewals plan plans membership member members premium basic standard " +
    "pro plus starter trial monthly annual credit credits debit card cards gift gifts voucher coupon discount discounts " +
    "promo code codes shipping delivery handling service services product products item items package packages bundle " +
    "set sets kit kits class classes course courses lesson lessons workshop workshops session sessions booking bookings " +
    "ticket tickets event events pass passes entry admission rental rent hire commission commissions custom made " +
    "handmade shop store stores online web website app checkout cart customer customers client clients guest guests " +
    "user users account accounts business company team staff studio office home house dollar dollars euro euros pound " +
    "pounds cent cents currency currencies money cash tax taxes vat fees fee tip tips donation donations " +
    // a film of the week
    "film films video videos movie scene scenes screen title voice voiceover narration music caption captions storyboard " +
    "week change changes up down open opening end endcard days figure figures number numbers thousand thousands hundred " +
    "hundreds million millions percent per cent zero one two three four five six seven eight nine ten eleven twelve " +
    "thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety " +
    "first second third fourth fifth last next previous before after earlier later new old best good great big small " +
    "more less most least high higher low lower same thank thanks welcome hello note notes message please " +
    // English's most used words
    "the and for are but not you all any can had her was one our out has him his how its may new now old see two way who " +
    "boy did get let put say she too use that with have this will your from they know want been much some time very when " +
    "come here just like long make many over such take than them well were what also back call each even find give hand " +
    "high keep kind last left life live look made more most move must name need only part place right same seem show side " +
    "tell turn used want ways work world would about above again along also always among another around because become " +
    "being below between both bring came could does doing done during every from going gone into item itself later might " +
    "mine more never other ours own rather really said should since still such than that their theirs then there these " +
    "thing things think those though three through thus under until upon using what whatever where whether which while " +
    "whom whose why with within without would yours yourself making made saying showing asked asks ask said says tell " +
    "told thank thanked remember forget write read written words word line lines list today ever only just very really " +
    "small large little great real full half whole extra free paid final main other others"
  ).split(/\s+/),
);
// Stripe's fields that say who a customer is: an email, a customer's name, and the name on a billing or shipping
// address (a list of balance transactions holds them only when a host expands them; this template never does).
const IDENTITY_OWNERS = new Set(["customer", "customer_details", "billing_details", "shipping", "owner", "cardholder"]);
const identity = (key, owner) => /(^|_)email$/.test(key) || key === "customer_name" || (key === "name" && IDENTITY_OWNERS.has(owner));
function customerValues(dir) {
  // value -> { where it came from, any case or not, a name or not, from a description's pair, from an identity field },
  // never printed with the value
  const found = new Map();
  // A name's word in lower case -> { where it came from, from an identity field or not }: looked for alone, in any
  // case. From an identity field's name, and from a pair of capitalised words in a description; never from any other
  // word of a description.
  const alone = new Map();
  const add = (value, where, anyCase = false, name = false, from = "") => {
    if (value.length < 4) return;
    const seen = found.get(value);
    if (!seen) found.set(value, { where, anyCase, name, pair: from === "pair", identity: from === "identity" });
    else {
      if (anyCase) seen.anyCase = true; // a whole description that is only a name is still a name
      if (name) seen.name = true;
      if (from === "pair") seen.pair = true;
      if (from === "identity") seen.identity = true;
    }
  };
  // A name pair: looked for whole, and each of its words alone (four letters or more, not a common word nor Stripe's),
  // in any case, in what the run says and writes, as a first name or a last name said by itself is still the
  // customer's. A pair of capitalised words that isn't a name ("Market Day") has its words looked for too: the run
  // rewords and scans again.
  const pair = (a, b, where, key, anyCase) => {
    add(`${a} ${b}`, `${where}: a name in its ${key}`, anyCase, true, "pair");
    if (!anyCase) return;
    for (const w of `${a} ${b}`.split(/[^\p{L}]+/u)) {
      if (w.length >= 4 && !COMMON.has(w.toLowerCase()) && !STRIPES_WORDS.has(w.toLowerCase()) && !alone.has(w.toLowerCase())) alone.set(w.toLowerCase(), { where: `${where}: a word of a name in its ${key}`, identity: false });
    }
  };
  // A name from an identity field is the customer's in every shape: whole, each pair of its words (an initial left
  // out), in any case, and each of its words alone (two letters or more, not a common word), in any case.
  const identityName = (v, where, key) => {
    add(v, `${where}: its ${key}`, true, true, "identity");
    const parts = v.split(/\s+/).map((w) => w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "")).filter((w) => /^\p{L}{2,}$/u.test(w));
    for (let i = 0; i + 1 < parts.length; i++) add(`${parts[i]} ${parts[i + 1]}`, `${where}: a name in its ${key}`, true, true, "identity");
    // An identity name's word is the customer's wherever it is found, after billing too: it replaces a description's.
    for (const w of parts) if (!COMMON.has(w.toLowerCase()) && !alone.get(w.toLowerCase())?.identity) alone.set(w.toLowerCase(), { where: `${where}: a word of the name in its ${key}`, identity: true });
  };
  const plain = (w) => LOWER.test(w) && !COMMON.has(w) && !STRIPES_WORDS.has(w);
  const walk = (value, key, where, owner) => {
    if (key === "fee_details" || STRIPES_OWN.has(key)) return;
    // An identity field's name (not an email: that is found below, whole, in any case).
    if (typeof value === "string" && identity(key, owner) && !value.includes("@")) identityName(value.trim(), where, key);
    else if (typeof value === "string") {
      const v = value.trim();
      // A description of one word of letters alone ("Refund", "Payment") is a common word as often as a name, and the
      // kit's own scenes hold such words: it is not looked for by itself. A name in it is looked for as a pair of
      // capitalised words, and each word of the pair alone, below.
      if (!/^\p{L}+$/u.test(v)) add(v, `${where}: its ${key}`);
      for (const email of v.match(EMAIL) ?? []) add(email, `${where}: an email in its ${key}`, true);
      const words = v.split(/\s+/).map((w) => w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ""));
      for (let i = 0; i + 1 < words.length; i++) {
        const [a, b, c] = [words[i], words[i + 1], words[i + 2]];
        // Two capitalised words, or two through an initial between them ("First Q. Last").
        if (NAMEWORD.test(a) && NAMEWORD.test(b)) pair(a, b, where, key, nameLike(a, b));
        else if (/^\p{L}$/u.test(b) && c !== undefined && NAMEWORD.test(a) && NAMEWORD.test(c)) pair(a, c, where, key, nameLike(a, c));
        // Two words in lower case (or through an initial), neither a common word nor Stripe's: a name held that way
        // ("marisol quintero") or a description's ordinary words ("ceramic vase"), which the film never says either.
        // Looked for as the pair, in any case; never its words alone, which a description's ordinary words would be.
        else if (plain(a) && plain(b)) add(`${a} ${b}`, `${where}: a pair of words in its ${key}`, true, true, "pair");
        else if (/^\p{L}$/u.test(b) && c !== undefined && plain(a) && plain(c)) add(`${a} ${c}`, `${where}: a pair of words in its ${key}`, true, true, "pair");
      }
    } else if (Array.isArray(value)) value.forEach((v) => walk(v, key, where, owner));
    else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, k, where, key);
  };
  for (const { file, list } of filedPages(dir).pages) list.data.forEach((item, i) => walk(item, "item", `${file} item ${i + 1} (${item?.id ?? "no id"})`, undefined));
  return { found, alone };
}
// The words of a text, in lower case: a name's word alone is found in any case ("Marisol", "marisol", "MARISOL").
// What a tool writes while the run runs it, at the path the skill names: hyperframes check (SKILL.md, 7:
// media/check.json), hyperframes render (SKILL.md, 8: media/render.log), and hyperframes snapshot through review.mjs
// (its <out>/snapshot.log; SKILL.md, 7: media/review, media/review-2). A tool's words ("families", "track",
// "phone"), never the run's: a name's word alone is not looked for there.
const TOOL_OUTPUT = [/^media\/check\.json$/, /^media\/render\.log$/, /^media\/review(?:-\d+)?\/snapshot\.log$/];
// After billing (--final), a name's word found alone only warns in the answer: it keeps tool and kit words on purpose
// (a kept warning's code, "timeline_track_too_dense"), and a description can share one ("Track Day Pass"). Everywhere
// else (what the film says and shows: a voice's timestamps, media/vo.txt, media/film.vtt, film/words.json, the
// captions, the scenes, film/data.json; and every other file the run wrote) it stops the film, and an identity
// field's word stops it in the answer too.
const WARN_ONLY = new Set(["media/answer.json"]);
// The paths the kit and the skill name, whose words ("media", "review", "timestamps") are not a customer's when a
// file's name is read for one. With the kit's shipped files' paths (kit/compositions/open.html), in scan.
const NAMED_PATHS = ["media/vo.txt", "media/music.txt", "media/answer.json", "media/film.vtt", "media/film.mp4", "media/voiceover.mp3", "media/voiceover-2.mp3", "media/voiceover-timestamps.json", "media/voiceover-2-timestamps.json", "media/music.mp3", "media/check.json", "media/render.log", "media/review/snapshot.log", "media/review-2/snapshot.log", "media/run-keys.json", "film/STORYBOARD.md", "film/data.json", "film/words.json", "film/compositions/captions.html", "film/assets/voiceover.mp3", "film/assets/music.mp3", "carried.json", "evidence/fal"];
// The note the first --final that warns keeps, inside each raw page (a key of the page's own object, which compute and
// scan never read as an item): the files and lines it warned on, never a word. It lives and goes with the pages, so no
// file of the run's own (a media cleanup, another --root) can make a later --final a first again.
const MARK = "metrics_video_final_warned";
// The string values on one line of a JSON file, unescaped: each literal in order, a key (a literal followed by a
// colon) left out.
const jsonLineStrings = (line) =>
  [...line.matchAll(/"(?:[^"\\]|\\.)*"(\s*:)?/g)]
    .filter((m) => m[1] === undefined)
    .map((m) => {
      try {
        return JSON.parse(m[0]);
      } catch {
        return m[0];
      }
    })
    .join(" ");
// The text an HTML (or SVG) file shows: its comments, styles, scripts and tags (attributes and all) left out.
const shownText = (t) =>
  t
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ");
const wordsIn = (text) => new Set((text.match(/\p{L}+/gu) ?? []).map((w) => w.toLowerCase()));
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
// (No example name or email in this kit's text: none is set aside for being there, below, so one would fail a run.)
const squash = (s) => s.replace(/\s+/g, " ");
const fold = (s) => squash(s).toLowerCase();
// Letters and digits only, in lower case, one space between words: how a name is compared with the business's.
const wordsOf = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
function scan() {
  const dir = need("pages");
  pagesDir = dir;
  const root = args.root && args.root !== "true" ? args.root : ".";
  checkPages(dir);
  // --purge: every page goes, nothing is searched. For a run that stops with customer data still in a file (failed_step
  // customer_data): its last --final would find it and keep the pages for a retry the run won't make.
  if (args.purge !== undefined) {
    const { removed, left } = removePagesIn(dir);
    console.log(JSON.stringify({ raw_pages_removed: removed }));
    if (left.length) fail(2, `could not remove ${left.join(", ")}: remove them before answering`);
    return;
  }
  const final = args.final !== undefined;
  const pageFiles = () => {
    try {
      return existsSync(pagesAt) ? rawFiles(pagesAt) : [];
    } catch {
      return [];
    }
  };
  // Every --final removes the pages on every exit (its own, a refused argument, bad pages, a throw) but two, where a
  // retry needs them: a first --final that found a value (exit 2: the run takes it out and runs --final again, which
  // must still know what to look for), and one that only warned (exit 4, the pages noted with MARK). A --final whose
  // pages hold that note is the last: it removes them on every exit, a value found included, and on a signal too
  // (SIGTERM, SIGINT, SIGHUP: it ends with 128 + the signal's number). A signal on a first --final leaves them, for its
  // retry. Each page is removed on its own, best effort. Only a SIGKILL (which no process can catch) leaves them.
  const marked = (f) => {
    try {
      const page = JSON.parse(readFileSync(join(pagesAt, f), "utf8"));
      return page !== null && typeof page === "object" && Object.hasOwn(page, MARK);
    } catch {
      return false;
    }
  };
  const rerun = final && pageFiles().some(marked);
  const removed = [];
  const left = [];
  // Filed pages and pages the run wrote: the last --final leaves neither.
  const removePages = () => {
    const r = removePagesIn(dir);
    removed.push(...r.removed);
    left.length = 0;
    left.push(...r.left);
  };
  // Set where this --final keeps the pages for a retry, or has removed them itself.
  let keep = false;
  if (final) {
    process.on("exit", (code) => {
      if (keep) return;
      removePages();
      if (left.length) process.stderr.write(`the --final could not remove ${left.join(", ")}: remove them before answering\n`);
      else if (code !== 0) process.stderr.write(`Stripe's pages are removed, so no scan can check the run's files again: the film stops here. Answer failed, failed_step "customer_data" unless the words above name another step.\n`);
    });
    if (rerun) for (const [signal, code] of [["SIGTERM", 143], ["SIGINT", 130], ["SIGHUP", 129]]) process.on(signal, () => process.exit(code));
  }
  // A page the run wrote itself: refused, as compute refuses it. Its values would never be looked for (only filed pages
  // give them), so a scan beside one is never clean.
  refuseOwnPages(dir);
  // No pages (removed by an earlier scan --final, or never saved): nothing to look for, and nothing to remove.
  const pages = pageFiles();
  const { found, alone } = pages.length ? customerValues(dir) : { found: new Map(), alone: new Map() };
  const raw = new Set(pages.map((f) => join(dir, f)));
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
  // customer's, so it is not looked for; but only a value looked for as written. A name or an email (looked for in any
  // case) is the customer's wherever else it is written, the skill's text included: a run that read it from Stripe
  // must not write it, so it is always looked for.
  const skillText = squash([...shipped.values()].map((f) => f.text).join("\n"));
  // The business's own name (the name the film opens and ends on) is the film's, not a customer's, though a charge's
  // description holds it (shop plugins write "<store name> - Order <n>"): a value equal to it, or a name pair inside
  // it, is not looked for. A customer's name beside it in the same description still is. It is the name compute was
  // given (film/data.json's business), never one handed to scan: a --business here that isn't compute's is refused,
  // so a customer's name can't be set aside by naming it the business. Neither name is printed.
  const film = join(root, typeof args.film === "string" ? args.film : "film");
  let computed = "";
  let zone = "";
  try {
    const d = JSON.parse(readFileSync(join(film, "data.json"), "utf8"));
    if (typeof d.business === "string") computed = d.business;
    if (typeof d.timezone === "string") zone = d.timezone;
  } catch {
    computed = "";
  }
  // The run can write data.json: a time zone no machine knows is no kit phrase ("Marisol Quintero" would set a pair
  // aside).
  if (!zoneOk(zone)) zone = "";
  const business = wordsOf(computed);
  if (args.business !== undefined && wordsOf(args.business === "true" ? "" : String(args.business)) !== business) {
    fail(2, `scan sets aside only the business's name compute was given (${business ? "in film/data.json" : "none: film/data.json names no business"}), and the --business given here is another. Run scan without --business.`);
  }
  // The kit's own phrases (each currency's spoken unit, "Hong Kong dollars"; the tools the skill names; the run's time
  // zone, "weeks in Australia/Sydney" on the source line; compute's own words in data.json, from SAYS and the rest
  // above; the text a shipped kit HTML file shows, read the way a run's HTML is read below) are the film's, not a
  // customer's: they are taken out of a text before a name's words alone are looked for, so a customer named Hong is
  // found and "Hong Kong dollars" is not taken for her. Only the whole phrase is taken out.
  const computeWords = [METRIC.label, ...Object.values(SAYS).flatMap((t) => t.split("{}").map((x) => x.trim())), ...Object.values(STATE), ...Object.values(DIRECTION), NUMBER_WORDS.minus, NUMBER_WORDS.point, ...NUMBER_WORDS.scales.map(([, name]) => name)];
  const kitHtml = [...shipped].filter(([rel]) => /^kit\/.*\.html?$/i.test(rel)).flatMap(([, f]) => shownText(f.text).split("\n").map((x) => squash(x).trim()));
  const codes = new Set();
  if (pages.length) for (const { list } of filedPages(dir).pages) for (const item of list.data) if (typeof item?.currency === "string") codes.add(item.currency.toLowerCase());
  const phrases = [...new Set([...Object.values(UNIT).flat(), ...[...codes].flatMap((c) => { try { return [unitWords(c, 1), unitWords(c, 2)]; } catch { return []; } }), "Composio", "ElevenLabs", "HyperFrames", "fal", "Stripe", zone, ...computeWords, ...kitHtml])]
    .filter((x) => /\p{L}/u.test(x))
    .sort((a, b) => b.length - a.length);
  const kitPhrase = new RegExp(`(?<![\\p{L}])(?:${phrases.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+")).join("|")})(?![\\p{L}])`, "giu");
  // A pair a description holds inside one of those phrases ("swiss francs", "Hong Kong" of "Hong Kong dollars") is the
  // kit's words, which compute writes for every figure in that currency: it is not a name. A name from an identity
  // field stays whole, and a pair beside a kit word ("Anna Hong") is still a name, its words alone still looked for.
  const phraseWords = phrases.map((x) => ` ${wordsOf(x)} `);
  const inKitPhrase = (value, { pair, identity }) => pair && !identity && phraseWords.some((x) => x.includes(` ${wordsOf(value)} `));
  const theBusiness = (value, { name }) => business !== "" && (wordsOf(value) === business || (name && ` ${business} `.includes(` ${wordsOf(value)} `)));
  const values = new Map([...found].filter(([value, seen]) => !(!seen.anyCase && skillText.includes(squash(value))) && !theBusiness(value, seen) && !inKitPhrase(value, seen)));
  // A name's word alone is not looked for when it is a word of the business's name. The words the kit has the run say
  // or write ("Canadian dollars", "Composio") are common words (COMMON), so never a name's word: a fixed list, never
  // whatever the skill's text happens to hold.
  const ownWords = new Set(business.split(" "));
  const words = new Map([...alone].filter(([w]) => !ownWords.has(w)));
  // A file in film/ still byte for byte a shipped kit file (metrics.mjs, review.mjs, a scene the run never changed)
  // holds only the template's words: it is not searched, so a customer's name that is also a phrase in the kit's code
  // can't fail every run. A copy the run changed is searched like any other file.
  const kitCopy = (path) => {
    const rel = relative(film, path).split("\\").join("/");
    const kitFile = shipped.get(`kit/${rel}`);
    return !rel.startsWith("..") && kitFile !== undefined && kitFile.bytes.equals(readFileSync(path));
  };
  const all = runFiles(root, raw);
  const written = skillFiles.filter((f) => !shipped.has(relative(skill, f.path).split("\\").join("/")));
  const files = [...all.filter((f) => !kitCopy(f.path)), ...written];
  // What fal spoke: a voice's timestamps hold its words one letter to a JSON string, which no value matches as the
  // file is written. Their letters joined are the text the voice says, searched as well, so a name sent to fal but
  // kept out of media/vo.txt is still found. They are read in any JSON file that holds them (the timestamps the run
  // wrote, fal's result as filed, anything else), not only a file named for them. fal splits the letters into chunks,
  // at times in a word and at times between two: the chunks are read joined as they are and joined with a space.
  const voices = [];
  const letters = (c) => c.characters.map(String).join("");
  const spoken = (v, out) => {
    if (Array.isArray(v)) {
      const chunks = v.filter((c) => c && Array.isArray(c.characters)).map(letters);
      if (chunks.length) out.push(chunks.join(""), chunks.join(" "));
      for (const x of v) if (!(x && Array.isArray(x.characters))) spoken(x, out);
    } else if (v && typeof v === "object") {
      if (Array.isArray(v.characters)) out.push(letters(v));
      else for (const x of Object.values(v)) spoken(x, out);
    }
  };
  for (const f of files) {
    if (!/^\s*[[{]/.test(f.text)) continue;
    let json;
    try {
      json = JSON.parse(f.text);
    } catch {
      continue;
    }
    const out = [];
    spoken(json, out);
    const said = [...new Set(out.filter(Boolean))];
    if (said.length) voices.push({ path: f.path, text: said.join("\n"), label: " (the words its voice says)" });
  }
  // A name said through an initial ("marisol q. quintero", "Marisol Q Quintero", "marisol q quintero") is its pair with
  // the initial left out.
  const noInitials = (t) => t.replace(/(\p{L}{2,})\s+\p{L}\.?\s+(?=\p{L}{2,})/gu, "$1 ");
  // A name's word alone is looked for in every text file the run wrote and in what each voice says, read for its
  // words: a JSON file by its strings (its keys are a schema's), an HTML or SVG file by the text it shows (its styles,
  // scripts, comments and tags are the kit's code, "font-family", "white-space", "power2.out", and the run's restyling
  // of it). Not in the kit's code (.js, .mjs, .cjs, .css), not in the host's input (inputs/), and not in a tool's own
  // output at the paths the skill names (TOOL_OUTPUT): the run can't reword those. Any other file, a log the run
  // writes itself included, is read. Whole values, pairs and emails are looked for in every file.
  const strings = (text) => {
    const out = [];
    const walk = (v) => {
      if (typeof v === "string") out.push(v);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    };
    try {
      walk(JSON.parse(text));
    } catch {
      return text;
    }
    return out.join("\n");
  };
  // The kit's code is film/'s and the skill folder's .js, .mjs, .cjs and .css (the run's restyling of it included):
  // a script or stylesheet the run writes anywhere else is read for words like any other file.
  const relOf = (path) => (relative(root, path) || path).split("\\").join("/");
  const codeDirs = [relOf(film), relOf(skill)];
  const kitCode = (rel) => /\.(?:m?js|cjs|css)$/i.test(rel) && codeDirs.some((d) => rel.startsWith(`${d}/`));
  const wordText = (path, text, label) => {
    if (label) return text;
    const rel = relOf(path);
    if (kitCode(rel) || rel.startsWith("inputs/") || TOOL_OUTPUT.some((x) => x.test(rel))) return null;
    if (/\.(?:html?|svg)$/i.test(rel)) return shownText(text);
    return /\.json$/i.test(rel) ? strings(text) : text;
  };
  // The line of a file a name's word alone is on, read the way the file is read for words: a JSON line by its string
  // values, an HTML line by the text it shows. 0 when no one line holds it (a kit phrase across two lines).
  const lineOf = (path, text, w) => {
    const rel = (relative(root, path) || path).split("\\").join("/");
    const read = /\.json$/i.test(rel) ? jsonLineStrings : /\.(?:html?|svg)$/i.test(rel) ? shownText : (l) => l;
    return text.split("\n").findIndex((l) => wordsIn(read(l).replace(kitPhrase, " ")).has(w)) + 1;
  };
  const hits = [];
  // After billing (--final), a description's name word found alone in the answer (WARN_ONLY) only warns, naming the
  // file and the line; anywhere else, or an identity name's word, it stops the film, as whole values, pairs and emails
  // do. Before billing, a word alone stops it anywhere.
  const warnings = new Map(); // the warning's line -> { file, line }: never the word
  // A file's name is read too (its words, and a name or email in any case), but the words of the paths the kit and the
  // skill name are no one's. A file whose name holds a value is never named: every line about it says "a file whose
  // name holds a customer's word".
  const pathWords = new Set([...NAMED_PATHS, ...[...shipped.keys()].map((rel) => `film/${rel.replace(/^kit\//, "")}`), ...shipped.keys(), relOf(skill)].flatMap((p) => [...wordsIn(p)]));
  // The kit's paths are no one's, whole, so a description's pair can't match them ("Media Review Group" and the review
  // step's media/review/snapshot.log): a path the kit or the skill names (or a tool's output at one) is read as empty,
  // and a path below one of their folders (media/review/, film/assets/, evidence/fal/, the skill folder) only below the
  // deepest such folder, which is the part the run or a tool chose.
  const kitPaths = new Set([...NAMED_PATHS, ...[...shipped.keys()].map((rel) => `film/${rel.replace(/^kit\//, "")}`), ...[...shipped.keys()].map((rel) => `${relOf(skill)}/${rel}`)]);
  const kitDirs = new Set([...kitPaths].flatMap((p) => p.split("/").slice(0, -1).map((_, i, a) => a.slice(0, i + 1).join("/"))));
  kitDirs.add("evidence/fal");
  kitDirs.add(relOf(skill));
  const ownPart = (rel) => {
    if (kitPaths.has(rel) || TOOL_OUTPUT.some((x) => x.test(rel))) return "";
    const under = [...kitDirs].filter((d) => rel.startsWith(`${d}/`)).sort((a, b) => b.length - a.length)[0];
    return under ? rel.slice(under.length + 1) : rel;
  };
  const nameHit = (path) => {
    const rel = ownPart(path);
    const said = wordsIn(rel);
    for (const [w, { where }] of words) if (!pathWords.has(w) && said.has(w)) return where;
    const spaced = fold(rel.replace(/[^\p{L}\p{N}@.+]+/gu, " "));
    for (const [value, { where, anyCase }] of values) if (anyCase && spaced.includes(fold(value))) return where;
    return undefined;
  };
  let wordsRead = 0;
  for (const { path, text, label = "" } of [...files, ...voices]) {
    const rel = relOf(path);
    const inName = nameHit(rel);
    if (inName && !label) hits.push(`the name of a file the run wrote holds a value from Stripe's ${inName}: rename it (its name is not printed here)`);
    const at = inName ? `a file whose name holds a customer's word${label}` : (relative(root, path) || path) + label;
    const asWritten = squash(text);
    const anyCase = asWritten.toLowerCase();
    const anyCaseNoInitials = noInitials(asWritten).toLowerCase();
    for (const [value, { where, anyCase: folds }] of values) {
      const norm = folds ? fold : squash;
      const plain = norm(value);
      const escaped = norm(JSON.stringify(value).slice(1, -1));
      const holds = (hay) => hay.includes(plain) || (escaped !== plain && hay.includes(escaped));
      if (folds ? holds(anyCase) || holds(anyCaseNoInitials) : holds(asWritten)) hits.push(`${at} holds a value from Stripe's ${where}`);
    }
    const shown = wordText(path, text, label);
    if (shown !== null) {
      wordsRead++;
      const said = wordsIn(shown.replace(kitPhrase, " "));
      for (const [w, { where, identity }] of words) {
        if (!said.has(w)) continue;
        if (!final || label || identity || !WARN_ONLY.has(rel)) hits.push(`${at} holds a value from Stripe's ${where}`);
        else {
          const line = label ? 0 : lineOf(path, text, w);
          warnings.set(`warning: a customer's word may be in ${at}${line ? ` line ${line}` : ""} (words-alone check, not a failure after billing)`, line ? { file: at, line } : { file: at });
        }
      }
    }
    for (const email of text.match(EMAIL) ?? []) if (!values.has(email)) hits.push(`${at} holds an email address`);
  }
  // The pages go, each on its own; one that can't be removed is named and the scan exits 2, so exit 0 from a --final
  // always means no raw page is left.
  const removeAll = () => {
    removePages();
    keep = true;
    if (left.length) fail(2, `could not remove ${left.join(", ")}: remove them before answering`);
  };
  const stats = (clean, again) => JSON.stringify({ clean, files: files.length, values: values.size, name_words: words.size, values_in_the_template: found.size - values.size, kit_copies_skipped: all.length - (files.length - written.length), voices_read: voices.length, files_read_for_words: wordsRead, skill_files_shipped: shipped.size, skill_files_searched: written.length, words_alone_warnings: warnings.size, final_again: again, raw_pages_removed: removed });
  for (const warning of warnings.keys()) console.error(warning);
  if (hits.length) {
    const list = `- ${[...new Set(hits)].slice(0, 20).join("\n- ")}`;
    // The --final after a warning is the last: what it finds stops the film, and the raw pages go either way.
    if (rerun) {
      removeAll();
      console.log(stats(false, false));
      fail(2, `customer data in the run's files, found by the last --final: the film stops here (the filed pages are removed):\n${list}`);
    }
    keep = true;
    fail(2, `customer data in the run's files: remove each from the file (and from anything made from it: the voiceover, the film), then scan again:\n${list}`);
  }
  const again = final && warnings.size > 0 && !rerun && raw.size > 0;
  if (again) {
    // The note goes into each raw page (MARK), never a file of the run's: the next --final is the last.
    // An error answer filed as text (no JSON object) holds no note; the lists do. A page-named link (or anything not a
    // file of its own: a hard link shares its file with another name) is never written: the note would reach a file
    // that isn't the page's alone. It is skipped, and said. Each page is opened without following a link
    // (O_NOFOLLOW), in the folder checked (inPagesFolder), and must be, as opened, the file its lstat saw (same device
    // and inode, one name): a name swapped after the look is skipped, never written through.
    const skipped = [];
    // A page whose note could not be written whole: it may now hold broken JSON, which the next --final would take for
    // a filed error answer and never search. It is never counted; the run stops below.
    let unwritten = null;
    const { value: noted = 0 } = inPagesFolder(dir, () => {
      let n = 0;
      for (const f of pages) {
        let seen;
        try {
          seen = lstatSync(f);
        } catch {
          continue;
        }
        if (!seen.isFile() || seen.nlink !== 1) {
          skipped.push(join(dir, f));
          continue;
        }
        let fd;
        try {
          fd = openSync(f, constants.O_RDWR | constants.O_NOFOLLOW | constants.O_NONBLOCK);
        } catch {
          skipped.push(join(dir, f));
          continue;
        }
        try {
          const st = fstatSync(fd);
          if (!st.isFile() || st.nlink !== 1 || st.dev !== seen.dev || st.ino !== seen.ino) {
            skipped.push(join(dir, f));
            continue;
          }
          let page;
          try {
            page = JSON.parse(readFileSync(fd, "utf8"));
          } catch {
            continue;
          }
          if (page === null || typeof page !== "object" || Array.isArray(page)) continue;
          page[MARK] = { warned: [...warnings.values()] };
          // Every byte goes through the fd: a write may take fewer bytes than asked (a full disk, a quota), and one
          // that takes none, or throws, leaves the page cut short.
          const bytes = Buffer.from(JSON.stringify(page));
          try {
            ftruncateSync(fd, 0);
            for (let done = 0; done < bytes.length; ) {
              const wrote = writeSync(fd, bytes, done, bytes.length - done, done);
              if (!(wrote > 0)) throw new Error("a write took no bytes");
              done += wrote;
            }
          } catch (e) {
            unwritten = `${join(dir, f)} (${e?.code ?? e?.message ?? e})`;
            break;
          }
          n++;
        } finally {
          closeSync(fd);
        }
      }
      return n;
    });
    if (skipped.length) console.error(`not marked: ${skipped.join(", ")} (a link, not a file, or a file another name shares: the note is never written through one)`);
    if (unwritten !== null) stop(`the note could not be written into ${unwritten}, so the next --final can't check the run's files: make nothing, pay nothing, and answer failed, failed_step "stripe", with these words.`);
    // No note written: the next --final would be a first again, and warn and exit 4 again, for ever. It stops here.
    if (noted === 0) stop(`no page could carry the note the next --final needs (each was a link or shared its file, or held no list), so the run's files can't be checked again: make nothing, pay nothing, and answer failed, failed_step "stripe", with these words.`);
    console.log(stats(false, true));
    keep = true;
    fail(4, "exit 4, not done: the filed pages are kept for one more --final. Read each line named above; if it holds a customer's name, take the name out of media/answer.json; then run scan --pages stripe --final once more, whether you edited or not. That run is the last.");
  } else if (final) removeAll();
  console.log(stats(!again, again));
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
  let returned = false;
  try {
    compute();
    returned = true;
  } finally {
    if (!returned) removeAfterThrow();
  }
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
