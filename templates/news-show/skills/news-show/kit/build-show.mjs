#!/usr/bin/env node
// build-show.mjs: lays the show's nine segments end to end on the voices' real lengths and writes the HyperFrames
// project from film/scenes/: the root, one scene per segment and the end card, the captions, the share card, the words'
// times and the WebVTT file. Code does the exact work (lengths, times, alignment, escaping); the run writes the words.
//
//   node film/build-show.mjs --show film/show.json --film film --vtt media/show.vtt
//
// show.json (paths are from the run's folder, where this runs):
// {
//   "show": { "name": "The Daily Desk", "date_label": "Monday, November 23", "anchor_name": "Rowan",
//             "anchor_image": "media/anchor.png" or null },
//   "segments": [ nine, in order: cold-open, headlines, lead-a, story-a, lead-b, story-b, lead-c, story-c, closing;
//     every one: { "name", "script": the exact text sent to fal, tags included, "voice": "media/voice-<name>.mp3",
//                  "timestamps": "evidence/fal/<request_id>.json", the voice's result as the run filed it from fal's
//                  answer ({audio, timestamps}: the kit takes its timestamps, so the model never retypes them), or null;
//                  on a server that files no fal results, a file holding fal's `timestamps` list as it answered it },
//     an anchor segment also: { "anchor": "media/anchor-<name>.mp4" or null (a desk card), "chyron": at most 40 characters,
//                               "tag": optional, the strap's tag (the cold open's and the closing's are the AI label) },
//     headlines also: { "lines": [three lines, A to C] },
//     a story also: { "headline": at most 8 words, "source": "TransitWire, November 22",
//                     "facts": [one or two { "text": a figure or a quote exactly as the page gives it, "label": what it
//                               counts, or who said it }], "chyron": at most 40 characters } ]
// }
//
// Lengths come from ffprobe: each voice's, and each anchor clip's with its width and height. An anchor scene starts its
// clip and its voice together and lasts the longer of the two plus 0.1 s; a voiceover scene starts its voice 0.35 s in
// and lasts the voice plus 0.7 s; the end card follows the closing for 3 s.
// Captions, per segment, in order of preference: aligned (fal's characters spell the script), anchored (they don't: the
// words share the time between the first letter's start and the last letter's end), measured (no timestamps: the words
// share the voice's length). None of them is an error; the printed `method` is the weakest a segment used. A
// timestamps file that is named but isn't there, isn't fal's chunks, is uneven, is a result object outside the run's
// evidence/fal/ (or a link there to one outside) or another job's result stops the build first: exit 3, nothing written,
// and the message says what to pass.
// It writes film/captions-source.json, one line per segment: its method and where its timestamps came from, the
// request_id of the filed result it read ("bare list" for a list, null for none). Small, so a grader's cut input shows
// it whole.
// It prints one line of JSON: the method, the film's length, each segment's start, end, voice, clip and mode, and when
// the cold open's AI sentence ends.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const fail = (message) => {
  console.error(`build-show: ${message}`);
  process.exit(2);
};
if (!args.show || !args.vtt) fail("usage: node film/build-show.mjs --show film/show.json --film film --vtt media/show.vtt");
const filmDir = args.film ?? dirname(args.show);
const show = JSON.parse(readFileSync(args.show, "utf8"));

const ORDER = ["cold-open", "headlines", "lead-a", "story-a", "lead-b", "story-b", "lead-c", "story-c", "closing"];
const ANCHOR = new Set(["cold-open", "lead-a", "lead-b", "lead-c", "closing"]);
const PREFIX = { "cold-open": "co", headlines: "hl", "lead-a": "la", "story-a": "sa", "lead-b": "lb", "story-b": "sb", "lead-c": "lc", "story-c": "sc", closing: "cl", endcard: "ec" };
const W = 1920, H = 1080;
const r3 = (n) => Math.round(n * 1000) / 1000;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// --- The show's words, checked before anything is written.
const s = show.show ?? {};
for (const k of ["name", "date_label", "anchor_name"]) if (typeof s[k] !== "string" || !s[k].trim()) fail(`show.${k} is missing`);
const segs = show.segments;
if (!Array.isArray(segs) || segs.map((g) => g?.name).join(",") !== ORDER.join(","))
  fail(`segments must be the nine in order: ${ORDER.join(", ")} (a show is built only when every voice exists)`);
const texts = [];
const walk = (v, at) => (typeof v === "string" ? texts.push([at, v]) : v && typeof v === "object" ? Object.entries(v).forEach(([k, x]) => walk(x, `${at}.${k}`)) : null);
walk(show, "show.json");
for (const [at, v] of texts) if (/^\s*KIT\b/.test(v)) fail(`${at} is still the example's placeholder: ${v.slice(0, 60)}`);
for (const g of segs) {
  if (typeof g.script !== "string" || !g.script.trim()) fail(`${g.name}: script is missing`);
  if (!g.voice || !existsSync(g.voice)) fail(`${g.name}: its voice file ${g.voice} is missing`);
  if (ANCHOR.has(g.name) || g.name.startsWith("story-")) {
    if (typeof g.chyron !== "string" || !g.chyron.trim()) fail(`${g.name}: chyron is missing`);
    if ([...g.chyron].length > 40) fail(`${g.name}: the chyron "${g.chyron}" is ${[...g.chyron].length} characters; at most 40`);
  }
  if (ANCHOR.has(g.name) && g.anchor && !existsSync(g.anchor)) fail(`${g.name}: its anchor clip ${g.anchor} is missing (use null for a desk card)`);
  if (g.name === "headlines" && (!Array.isArray(g.lines) || g.lines.length !== 3)) fail("headlines: lines must be the three stories' lines, A to C");
  if (g.name.startsWith("story-")) {
    if (typeof g.headline !== "string" || !g.headline.trim()) fail(`${g.name}: headline is missing`);
    if (typeof g.source !== "string" || !g.source.trim()) fail(`${g.name}: source is missing`);
    if (!Array.isArray(g.facts) || g.facts.length < 1 || g.facts.length > 2) fail(`${g.name}: facts must be one or two {text, label}`);
  }
}

// --- Each voice's timestamps, read before anything is written. The run files fal's answer itself under evidence/fal/ in
// the run's folder, where this runs; a result object anywhere else (work/evidence/fal/ included) was written by the
// model. A file that can't be read as fal's chunks is a copy gone wrong, never "no timestamps": timing that segment
// another way would put its captions off its words. Exit 3, write nothing, and say what to pass.
const RUN_FAL = resolve("evidence", "fal");
const FILED = "evidence/fal/<request_id>.json";
const PASS = `Pass ${FILED}, the request_id fal answered for this voice's job, as its timestamps, and write no copy.`;
const refuse = (g, message) => {
  console.error(`build-show: ${g.name}: ${message} Nothing written.`);
  process.exit(3);
};
const filedResults = () => (existsSync(RUN_FAL) ? readdirSync(RUN_FAL).filter((f) => f.endsWith(".json")) : []);
const holds = (there) => `evidence/fal/ holds ${there.slice(0, 20).join(", ")}${there.length > 20 ? ", ..." : ""}`;
// Each segment's timestamps and where they came from: the request_id of the filed result the build read (the file a
// link in evidence/fal/ points at, never the name show.json gives), "bare list", or null.
function readTimestamps(g) {
  const path = g.timestamps;
  if (path === null || path === undefined || path === "") return { list: [], from: null };
  if (typeof path !== "string") refuse(g, `timestamps names a file, never holds fal's list. ${PASS}`);
  const filed = dirname(resolve(path)) === RUN_FAL;
  const bad = (why) => {
    if (filed) refuse(g, `${path} does not hold fal's timestamps as chunks (${why}): it is the run's own copy of fal's answer, so don't write another. Check it is this voice's request_id.`);
    const there = filedResults();
    refuse(g, `${path} is not fal's timestamps as fal answered them (${why}). ${there.length ? `${holds(there)}. ${PASS}` : "Write it again, copied exactly from fal's answer, and build again."}`);
  };
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") {
      // Whatever path was named, the run's own evidence/fal/ says which file to pass, or that this server files none.
      const there = filedResults();
      if (there.length) refuse(g, `${path} is not in the run's files; ${holds(there)}. ${PASS}`);
      refuse(
        g,
        `${path} is not in the run's files, and the run has no fal results in evidence/fal/: this server files none. Write ` +
          `fal's \`timestamps\` value for this voice exactly as fal answered it, the whole list, to media/voice-${g.name}-timestamps.json and name that.`,
      );
    }
    bad(e.message);
  }
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    bad(e.message);
  }
  let list;
  let from = "bare list";
  if (Array.isArray(raw)) list = raw;
  else if (raw && typeof raw === "object" && !("characters" in raw)) {
    // A result object: fal's answer for one job, {audio, timestamps} for a voice.
    if (!filed) refuse(g, `${path} is a result object, which the kit takes only as the run filed it from fal's answer. ${PASS}`);
    const read = realpathSync(path);
    if (dirname(read) !== realpathSync(RUN_FAL)) refuse(g, `${path} is a link to ${relative(process.cwd(), read)}, a result object the run did not file. ${PASS}`);
    from = basename(read, ".json");
    if (!("audio" in raw) && !("timestamps" in raw)) refuse(g, `${path} is not a voice's result (it holds ${Object.keys(raw).join(", ") || "nothing"}): pass this voice's request_id.`);
    list = raw.timestamps ?? [];
    if (!Array.isArray(list)) bad("its timestamps is not a list");
  } else list = raw ? [raw] : [];
  list.forEach((c, i) => {
    const st = c?.character_start_times_seconds;
    const en = c?.character_end_times_seconds;
    if (!Array.isArray(c?.characters) || !Array.isArray(st) || !Array.isArray(en)) bad(`chunk ${i + 1} lacks characters, character_start_times_seconds or character_end_times_seconds`);
    if (st.length !== c.characters.length || en.length !== c.characters.length) bad(`chunk ${i + 1} has ${c.characters.length} characters, ${st.length} starts and ${en.length} ends`);
    if (![...st, ...en].every((x) => typeof x === "number" && Number.isFinite(x))) bad(`chunk ${i + 1} has a time that is not a number`);
  });
  return { list, from };
}
for (const g of segs) ({ list: g.chunks, from: g.from } = readTimestamps(g));

// --- Lengths, from the files.
function probe(path) {
  const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=width,height,codec_type", "-of", "json", path], { encoding: "utf8" });
  if (p.status !== 0) fail(`ffprobe could not read ${path}: ${(p.stderr ?? "").trim()}`);
  const j = JSON.parse(p.stdout);
  const v = (j.streams ?? []).find((x) => x.codec_type === "video");
  const seconds = Number(j.format?.duration);
  if (!(seconds > 0)) fail(`${path} has no duration`);
  return { seconds, width: v?.width ?? null, height: v?.height ?? null };
}

mkdirSync(join(filmDir, "assets"), { recursive: true });
mkdirSync(join(filmDir, "compositions"), { recursive: true });
mkdirSync(join(filmDir, "card", "assets"), { recursive: true });
let still = null;
if (s.anchor_image && existsSync(s.anchor_image)) {
  still = `anchor${extname(s.anchor_image) || ".png"}`;
  copyFileSync(s.anchor_image, join(filmDir, "assets", still));
  copyFileSync(s.anchor_image, join(filmDir, "card", "assets", still));
}

let t = 0;
const laid = segs.map((g) => {
  const voice = probe(g.voice);
  copyFileSync(g.voice, join(filmDir, "assets", `voice-${g.name}.mp3`));
  let clip = null;
  if (ANCHOR.has(g.name) && g.anchor) {
    clip = probe(g.anchor);
    copyFileSync(g.anchor, join(filmDir, "assets", `anchor-${g.name}.mp4`));
  }
  const anchor = ANCHOR.has(g.name);
  const start = r3(t);
  const audioAt = anchor ? start : r3(start + 0.35);
  const D = r3(anchor ? (clip ? Math.max(voice.seconds, clip.seconds) + 0.1 : voice.seconds + 0.3) : voice.seconds + 0.7);
  t = start + D;
  return { ...g, anchor, start, D, end: r3(start + D), audioAt, V: r3(voice.seconds), clip };
});
const endStart = r3(t);
const END_D = 3;
const TOTAL = r3(endStart + END_D);

// --- Words on the film's clock, per segment.
const norm = (x) => x.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
const RANK = { aligned: 0, anchored: 1, measured: 2 };
function timeWords(g) {
  const spoken = g.script.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
  const words = spoken.split(" ").filter(Boolean).map((text) => ({ text, key: norm(text), seg: g.name }));
  const chunks = g.chunks;
  const letters = [];
  let inTag = false;
  for (const c of chunks) {
    const st = c.character_start_times_seconds ?? [];
    const en = c.character_end_times_seconds ?? [];
    c.characters.forEach((ch, i) => {
      if (ch === "[") inTag = true;
      if (!inTag) for (const one of norm(String(ch))) letters.push({ ch: one, start: Number(st[i]), end: Number(en[i]) });
      if (ch === "]") inTag = false;
    });
  }
  const usable = letters.filter((l) => Number.isFinite(l.start) && Number.isFinite(l.end));
  let method = "measured";
  let span = null;
  if (usable.length && words.length) {
    if (usable.map((l) => l.ch).join("") === words.map((w) => w.key).join("")) {
      method = "aligned";
      let at = 0;
      for (const w of words) {
        if (!w.key.length) continue;
        w.start = usable[at].start;
        w.end = usable[at + w.key.length - 1].end;
        at += w.key.length;
      }
    } else {
      method = "anchored";
      span = [usable[0].start, usable[usable.length - 1].end];
    }
  }
  if (method !== "aligned") {
    span = span ?? [0.05, Math.max(0.2, g.V - 0.1)];
    const total = words.reduce((n, w) => n + Math.max(1, w.key.length), 0);
    let acc = 0;
    for (const w of words) {
      w.start = span[0] + ((span[1] - span[0]) * acc) / total;
      acc += Math.max(1, w.key.length);
      w.end = span[0] + ((span[1] - span[0]) * acc) / total;
    }
  }
  // A word with no letters (a spaced dash) takes the end of the word before it, on the voice's clock, before any word
  // is moved to the film's: filled in the same pass, it would take an end already moved and be moved again.
  words.forEach((w, i) => {
    if (w.start === undefined) {
      w.start = words[i - 1]?.end ?? 0;
      w.end = w.start;
    }
  });
  for (const w of words) {
    w.start = r3(w.start + g.audioAt);
    w.end = r3(Math.max(w.end + g.audioAt, w.start + 0.04));
  }
  return { words, method };
}
const timed = laid.map((g) => ({ g, ...timeWords(g) }));
const method = timed.reduce((m, x) => (RANK[x.method] > RANK[m] ? x.method : m), "aligned");
const allWords = timed.flatMap((x) => x.words);

// The starts of a segment's sentences, on the scene's own clock.
function sentenceStarts(x) {
  const out = [];
  let open = true;
  for (const w of x.words) {
    if (open) out.push(r3(w.start - x.g.start));
    open = /[.!?]["”’)]*$/.test(w.text);
  }
  return out;
}

// --- Scenes.
function fill(file, values) {
  let html = readFileSync(join(filmDir, "scenes", file), "utf8");
  html = html.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => (k in values ? String(values[k]) : m));
  const left = html.match(/\{\{[A-Z_]+\}\}/);
  if (left) fail(`scenes/${file}: ${left[0]} has no value`);
  return html;
}
const wordSpans = (text, cls) => esc(text).split(/\s+/).filter(Boolean).map((w) => `<span class="${cls}">${w}</span>`).join(" ");
const LETTER = { "story-a": "A", "story-b": "B", "story-c": "C", "lead-a": "A", "lead-b": "B", "lead-c": "C" };
const modes = {};
for (const x of timed) {
  const g = x.g;
  const P = PREFIX[g.name];
  let html;
  if (g.anchor) {
    let mode = "desk";
    let panelW = 0;
    if (g.clip) {
      const aspect = g.clip.width && g.clip.height ? g.clip.width / g.clip.height : 16 / 9;
      mode = aspect < 1.5 ? "panel" : "video";
      panelW = mode === "panel" ? Math.min(60, Math.round((aspect * H * 100) / W)) : 0;
    }
    modes[g.name] = mode;
    const video = g.clip
      ? `<video id="${P}-video" class="clip" src="assets/anchor-${g.name}.mp4" muted playsinline data-start="0" data-duration="${r3(g.clip.seconds)}" data-track-index="0"></video>`
      : "";
    // The cold open's strap is there from frame 0 and holds; the others come in 0.3 s in for at most 6 s.
    const first = g.name === "cold-open";
    const strapIn = first ? 0 : 0.3;
    const strapDur = first ? g.D : r3(Math.min(g.D - 0.35, 6));
    const tag = g.tag ?? (first || g.name === "closing" ? "AI-generated news" : `Story ${LETTER[g.name]}`);
    html = fill("anchor.html", {
      P, ID: g.name, D: g.D, MODE: mode, PANEL_W: panelW, VIDEO: video, SHOW: esc(s.name), DESK_LINE: esc(g.chyron),
      TAG: esc(tag), CHYRON: esc(g.chyron), STRAP_IN: strapIn, STRAP_DUR: strapDur,
    });
  } else if (g.name === "headlines") {
    const rows = g.lines.map((line, i) => `<div class="${P}-row"><div class="${P}-slot">${"ABC"[i]}</div><div class="${P}-line">${esc(line)}</div></div>`).join("");
    const at = sentenceStarts(x).slice(0, 3);
    html = fill("headlines.html", { P, ID: g.name, D: g.D, LABEL: "Today's headlines", SHOW: esc(`${s.name} · ${s.date_label}`), ROWS: rows, LINE_AT: JSON.stringify(at) });
  } else {
    const facts = g.facts
      .map((f) => {
        const kind = [...String(f.text)].length <= 14 ? "fig" : "quote";
        return `<div class="${P}-fx ${kind}"><div class="fv">${esc(f.text)}</div><div class="fl">${esc(f.label ?? "")}</div></div>`;
      })
      .join("");
    // Fact i lands on sentence i + 2's start (the first sentence says what happened), never in the last 2.5 s.
    const starts = sentenceStarts(x);
    const at = g.facts.map((_, i) => r3(Math.min(starts[i + 1] ?? 1.6 + i * 3, Math.max(1, g.D - 2.5))));
    const strapDur = r3(Math.min(g.D - 1.2, 6));
    html = fill("story.html", {
      P, ID: g.name, D: g.D, SLOT: LETTER[g.name], SOURCE: esc(g.source), HEADLINE: wordSpans(g.headline, `${P}-hw`),
      FACTS: facts, CHYRON: esc(g.chyron), FACT_AT: JSON.stringify(at), STRAP_IN: 0.8, STRAP_DUR: strapDur,
    });
  }
  writeFileSync(join(filmDir, "compositions", `${g.name}.html`), html);
}
const presenter = `${s.anchor_name} is AI-generated. Sources are in the description.`;
writeFileSync(
  join(filmDir, "compositions", "endcard.html"),
  fill("endcard.html", {
    P: PREFIX.endcard, ID: "endcard", D: END_D, SHOW_CHARS: [...s.name].map((c) => `<span class="${PREFIX.endcard}-ch">${c === " " ? "&nbsp;" : esc(c)}</span>`).join(""),
    DATE: esc(s.date_label), AI_LINE: esc(presenter),
  }),
);

// --- The root.
const host = (id, start, D) =>
  `      <div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${start}" data-duration="${D}" data-track-index="1" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>`;
const hosts = [...laid.map((g) => host(g.name, g.start, g.D)), host("endcard", endStart, END_D)].join("\n");
const audio = laid
  .map((g) => `      <audio id="voice-${g.name}" class="clip" src="assets/voice-${g.name}.mp3" data-start="${g.audioAt}" data-duration="${g.V}" data-track-index="3" data-volume="1"></audio>`)
  .join("\n");
writeFileSync(join(filmDir, "index.html"), fill("index.html", { TOTAL, HOSTS: hosts, AUDIO: audio }));

// --- Captions: caption groups end at phrase ends and never cross a segment.
const OPENS = new Set("as with and but or so to in on for from into at by when where which that who because if without now then than while after before until".split(" "));
const NEEDS_NEXT = new Set("a an the its their your our my his her this these those of to at in on for with and or as by from into is are was were be than".split(" "));
const MAX_WORDS = 4;
const gapAt = (ws, i) => ws[i].start - ws[i - 1].end;
function cutClause(ws) {
  if (ws.length <= MAX_WORDS) return [ws];
  let best = -1, bestScore = -Infinity;
  for (let i = 1; i < ws.length; i++) {
    if ((i < 2 || ws.length - i < 2) && ws.length > 2) continue;
    let score = Math.min(gapAt(ws, i), 0.6) * 20;
    if (OPENS.has(ws[i].key)) score += 3;
    if (NEEDS_NEXT.has(ws[i - 1].key)) score -= 6;
    score -= Math.abs(i - ws.length / 2) * 0.8;
    if (i <= MAX_WORDS && ws.length - i <= MAX_WORDS) score += 1;
    if (score > bestScore) [bestScore, best] = [score, i];
  }
  if (ws.length === MAX_WORDS + 1 && bestScore < 0) return [ws];
  return [...cutClause(ws.slice(0, best)), ...cutClause(ws.slice(best))];
}
const clauses = [];
let clause = [];
allWords.forEach((w, i) => {
  clause.push(w);
  const next = allWords[i + 1];
  if (!next || next.seg !== w.seg || /[.!?;:,]["”’)]*$/.test(w.text) || next.start - w.end >= 0.3) {
    clauses.push(clause);
    clause = [];
  }
});
const groups = clauses.flatMap(cutClause);
const capGroups = groups.map((g, i) => {
  const start = Math.max(0.15, g[0].start - 0.05);
  const nextStart = groups[i + 1] ? Math.max(0.15, groups[i + 1][0].start - 0.05) : endStart;
  const end = Math.min(nextStart, g[g.length - 1].end + 0.35, endStart);
  return { start: r3(start), end: r3(Math.min(nextStart, endStart, Math.max(end, start + 0.3))), words: g };
});
const groupHtml = capGroups
  .map((c, gi) => {
    const spans = c.words.map((w, wi) => `<span class="cw" id="cw-${gi}-${wi}">${esc(w.text)}</span>`).join(" ");
    return `    <div id="cap-${gi}" class="clip cap" data-start="${c.start}" data-duration="${r3(c.end - c.start)}"><div class="cap-in" id="cap-in-${gi}">${spans}</div></div>`;
  })
  .join("\n");
const tweens = capGroups
  .map((c, gi) =>
    [
      `  tl.fromTo("#cap-in-${gi}", { filter: "blur(6px)", scale: 0.96 }, { filter: "blur(0px)", scale: 1, duration: 0.12, ease: "power4.out" }, ${c.start});`,
      ...c.words.map((w, wi) => `  tl.fromTo("#cw-${gi}-${wi}", { opacity: 0.5 }, { opacity: 1, duration: 0.08, ease: "none" }, ${r3(Math.max(c.start, w.start))});`),
    ].join("\n"),
  )
  .join("\n");
writeFileSync(
  join(filmDir, "compositions", "captions.html"),
  `<template>
  <style>
    #root { position: absolute; inset: 0; container-type: size; pointer-events: none; }
    .cap { position: absolute; left: 0; right: 0; bottom: 7cqh; text-align: center; overflow: visible; }
    .cap-in { display: inline-block; max-width: 84cqw; padding: 0.18em 0.42em; background: var(--cap-bg); box-shadow: inset 0 0 0 0.05em var(--cap-edge);
      font-family: var(--cap-font); font-weight: 700; font-size: 5cqmin; line-height: 1.15; letter-spacing: -0.01em; }
    .cw { color: var(--cap-ink); opacity: 0.5; white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="captions" data-width="${W}" data-height="${H}" data-layout-allow-caption-zone>
${groupHtml}
  </div>
  <script>
  const tl = gsap.timeline({ paused: true });
${tweens}
  window.__timelines["captions"] = tl;
  </script>
</template>
`,
);

// --- The share card.
const textRight = still ? 42 : 6;
const showSize = r3(Math.min(17, ((1200 * (1 - 0.06 - textRight / 100)) / ([...s.name].length * 0.42)) / 6.3));
const cardRows = laid
  .filter((g) => g.name.startsWith("story-"))
  .map((g) => `<div class="card-row"><div class="card-slot">${LETTER[g.name]}</div><div class="card-line">${esc(g.headline)}</div></div>`)
  .join("\n        ");
let card = fill("card.html", {
  FACE: still ? `<img id="card-face" class="clip" data-start="0" data-duration="1" src="assets/${still}" alt="" />` : "",
  TEXT_RIGHT: textRight, DATE: esc(s.date_label), SHOW: esc(s.name), ROWS: cardRows,
});
card = card.replace("#card-show { font-family: var(--font-display); text-transform: uppercase; font-size: 17cqh;", `#card-show { font-family: var(--font-display); text-transform: uppercase; font-size: ${showSize}cqh;`);
writeFileSync(join(filmDir, "card", "index.html"), card);

// --- WebVTT: one cue per sentence, a sentence over 12 words split at a comma; never across a segment.
const sentences = [];
let sent = [];
allWords.forEach((w, i) => {
  sent.push(w);
  const next = allWords[i + 1];
  if (/[.!?]["”’)]*$/.test(w.text) || !next || next.seg !== w.seg) {
    sentences.push(sent);
    sent = [];
  }
});
const cues = sentences.flatMap((one) => {
  if (one.length <= 12) return [one];
  const out = [];
  let part = [];
  one.forEach((w, i) => {
    part.push(w);
    if ((/,$/.test(w.text) && part.length >= 4 && one.length - i - 1 >= 3) || i === one.length - 1) {
      out.push(part);
      part = [];
    }
  });
  return out;
});
const ts = (x) => {
  const ms = Math.max(0, Math.round(x * 1000));
  const p = (n, k = 2) => String(n).padStart(k, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor((ms % 3600000) / 60000))}:${p(Math.floor((ms % 60000) / 1000))}.${p(ms % 1000, 3)}`;
};
const vtt = ["WEBVTT", ""];
for (const c of cues) vtt.push(`${ts(c[0].start)} --> ${ts(c[c.length - 1].end)}`, c.map((w) => w.text).join(" "), "");
mkdirSync(dirname(args.vtt), { recursive: true });
writeFileSync(args.vtt, vtt.join("\n"));

// --- The cold open's AI sentence: the first sentence that says "AI", and when its last word ends.
const cold = timed[0].words;
let disclosure = null;
for (let i = 0, from = 0; i < cold.length; i++) {
  if (/[.!?]["”’)]*$/.test(cold[i].text) || i === cold.length - 1) {
    const sentence = cold.slice(from, i + 1);
    if (sentence.some((w) => /\bAI\b/.test(w.text))) {
      disclosure = { sentence: sentence.map((w) => w.text).join(" "), spoken_by_s: sentence.at(-1).end };
      break;
    }
    from = i + 1;
  }
}
writeFileSync(
  join(filmDir, "words.json"),
  JSON.stringify({ method, segments: timed.map((x) => ({ name: x.g.name, method: x.method, words: x.words.map(({ text, start, end }) => ({ text, start, end })) })) }, null, 1),
);
const report = {
  method,
  film_s: TOTAL,
  canvas: `${W}x${H}`,
  segments: timed.map((x) => ({ name: x.g.name, method: x.method, start: x.g.start, end: x.g.end, voice_s: x.g.V, voice_at: x.g.audioAt, clip_s: x.g.clip ? r3(x.g.clip.seconds) : null, mode: x.g.anchor ? modes[x.g.name] : "voiceover" })),
  disclosure,
  over_30s: laid.filter((g) => g.anchor && g.V > 30).map((g) => g.name),
  groups: capGroups.length,
  cues: cues.length,
};
writeFileSync(join(filmDir, "timeline.json"), JSON.stringify(report, null, 1));
writeFileSync(
  join(filmDir, "captions-source.json"),
  `{\n${timed.map((x) => ` ${JSON.stringify(x.g.name)}: ${JSON.stringify({ method: x.method, request_id: x.g.from })}`).join(",\n")}\n}\n`,
);
if (!disclosure || disclosure.spoken_by_s > 10) console.error(`build-show: the cold open's AI sentence ${disclosure ? `ends at ${disclosure.spoken_by_s} s` : "is missing"}: it must be said by 10 s`);
console.log(JSON.stringify(report));
