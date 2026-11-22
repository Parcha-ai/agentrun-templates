#!/usr/bin/env node
// build-captions.mjs: the voiceover's words on the film's clock, as caption groups, a WebVTT file and a word list.
// Code does the exact work here (joining fal's character chunks, finding each word, the arithmetic); the film's
// author reads words.json to time scenes to the words that name them.
//
//   node build-captions.mjs --script vo.txt --timestamps vo-timestamps.json --duration 27.4 --offset 0.5 \
//     --film film --vtt media/captions.vtt
//
// --script      the exact text sent to ElevenLabs v3, audio tags included
// --timestamps  fal's `timestamps` value as it answered it: a list of chunks, each {characters,
//               character_start_times_seconds, character_end_times_seconds}. Missing, null or [] is allowed.
// --duration    the voiceover's length in seconds, measured with ffprobe (used only without usable timestamps)
// --offset      the second of the film at which the voiceover starts (its <audio> data-start)
// --film        the HyperFrames project: its index.html gives the canvas and the film's length; this writes
//               compositions/captions.html and words.json there
// --vtt         where the WebVTT file goes
// --max-words   most words in one caption group (default 4; a clause of one more with no good place to cut stays whole)
//
// Timing, in order of preference:
// 1. aligned: the chunks' letters and digits spell the script's words in order; each word starts at its first
//    letter's start time and ends at its last letter's end time.
// 2. anchored: the chunks are there but do not spell the script (another take, a fake): the words share the time
//    between the first letter's start and the last letter's end, each by its share of the script's letters.
// 3. measured: no timestamps; the words share 0.05 s to (duration - 0.1 s) the same way.
// It prints one line of JSON saying which, so the run can report it. None of them is an error.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const need = (k) => {
  if (args[k] === undefined) throw new Error(`--${k} is required`);
  return args[k];
};
const script = readFileSync(need("script"), "utf8");
const filmDir = need("film");
const vttPath = need("vtt");
const offset = Number(args.offset ?? 0.5);
const maxWords = Math.max(2, Math.min(6, Number(args["max-words"] ?? 4)));
let chunks = [];
if (args.timestamps) {
  try {
    const raw = JSON.parse(readFileSync(args.timestamps, "utf8"));
    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.timestamps) ? raw.timestamps : raw ? [raw] : [];
    chunks = list.filter((c) => c && Array.isArray(c.characters));
  } catch (e) {
    console.error(`timestamps unreadable (${e.message}): timing from the measured length`);
  }
}

// The film's canvas and length, from the root of index.html.
const index = readFileSync(join(filmDir, "index.html"), "utf8");
const rootTag = index.match(/<[^>]*data-composition-id="main"[^>]*>/)?.[0] ?? "";
const attr = (name, fallback) => Number(rootTag.match(new RegExp(`${name}="([0-9.]+)"`))?.[1] ?? fallback);
const W = attr("data-width", 1920);
const H = attr("data-height", 1080);
const filmLength = attr("data-duration", 30);

// The words as spoken: tags out, whitespace split, punctuation kept for display.
const spoken = script.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
const words = spoken.split(" ").filter(Boolean).map((text) => ({ text, key: norm(text) }));
function norm(s) {
  return s.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

// fal's characters joined, tags dropped, letters and digits only, each with its own times.
const letters = [];
let inTag = false;
for (const c of chunks) {
  const st = c.character_start_times_seconds ?? [];
  const en = c.character_end_times_seconds ?? [];
  c.characters.forEach((ch, i) => {
    if (ch === "[") inTag = true;
    if (!inTag) {
      const k = norm(String(ch));
      for (const one of k) letters.push({ ch: one, start: Number(st[i]), end: Number(en[i]) });
    }
    if (ch === "]") inTag = false;
  });
}
const usable = letters.filter((l) => Number.isFinite(l.start) && Number.isFinite(l.end));

let method = "measured";
let span = null;
const target = words.map((w) => w.key).join("");
if (usable.length && words.length) {
  if (usable.map((l) => l.ch).join("") === target) {
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
  const dur = Number(args.duration);
  if (!span) {
    if (!Number.isFinite(dur) || dur <= 0) throw new Error("no usable timestamps and no --duration: measure the voiceover with ffprobe");
    span = [0.05, Math.max(0.2, dur - 0.1)];
  }
  const total = words.reduce((n, w) => n + Math.max(1, w.key.length), 0);
  let acc = 0;
  for (const w of words) {
    const share = Math.max(1, w.key.length);
    w.start = span[0] + ((span[1] - span[0]) * acc) / total;
    acc += share;
    w.end = span[0] + ((span[1] - span[0]) * acc) / total;
  }
}
// Words with no letters (a lone dash) take their neighbour's time.
words.forEach((w, i) => {
  if (w.start === undefined) {
    const prev = words[i - 1];
    w.start = prev?.end ?? 0;
    w.end = w.start;
  }
});
const r3 = (n) => Math.round(n * 1000) / 1000;
for (const w of words) {
  w.start = r3(w.start + offset);
  w.end = r3(Math.max(w.end + offset, w.start + 0.04));
}

// Caption groups end at phrase ends. First the script is cut into clauses: after a sentence or clause mark, or at a
// pause of 0.3 s or more in the voice. A clause longer than maxWords is cut again, one cut at a time, at the best
// place inside it: the longest pause between two words (fal's character times show where the speaker breathes),
// before a word that opens a phrase ("as", "with", "to", "when"...), never after one that needs the next word ("a",
// "the", "of", "at"...), and near the middle. A clause of maxWords + 1 with no good place stays whole.
const OPENS = new Set("as with and but or so to in on for from into at by when where which that who because if without now then than while after before until".split(" "));
const NEEDS_NEXT = new Set("a an the its their your our my his her this these those of to at in on for with and or as by from into is are was were be than".split(" "));
const gapAt = (ws, i) => ws[i].start - ws[i - 1].end; // the pause before word i
function cutClause(ws) {
  if (ws.length <= maxWords) return [ws];
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 1; i < ws.length; i++) {
    if (i < 2 && ws.length > 2) continue; // no one-word chunk at the front
    if (ws.length - i < 2 && ws.length > 2) continue; // nor at the back
    let score = Math.min(gapAt(ws, i), 0.6) * 20; // a real pause decides first
    if (OPENS.has(ws[i].key)) score += 3;
    if (NEEDS_NEXT.has(ws[i - 1].key)) score -= 6;
    score -= Math.abs(i - ws.length / 2) * 0.8; // then balance
    if (i <= maxWords && ws.length - i <= maxWords) score += 1; // one cut that leaves both sides short
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  if (ws.length === maxWords + 1 && bestScore < 0) return [ws];
  return [...cutClause(ws.slice(0, best)), ...cutClause(ws.slice(best))];
}
const clauses = [];
let clause = [];
words.forEach((w, i) => {
  clause.push(w);
  const next = words[i + 1];
  if (!next || /[.!?;:,]$/.test(w.text) || next.start - w.end >= 0.3) {
    clauses.push(clause);
    clause = [];
  }
});
const groups = clauses.flatMap(cutClause);
// A group opens at its first word (never before 0.15 s) and closes after its last, before the next one opens.
const timed = groups.map((g, i) => {
  const start = Math.max(0.15, g[0].start - 0.05);
  const nextStart = groups[i + 1] ? Math.max(0.15, groups[i + 1][0].start - 0.05) : filmLength;
  const end = Math.min(nextStart, g[g.length - 1].end + 0.35, filmLength);
  return { start: r3(start), end: r3(Math.max(end, start + 0.3)), words: g };
});

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const portrait = H > W;
const bottom = portrait ? 36 : W === H ? 10 : 9; // % of height: above every 9:16 safe area, 80-120 px at 1080p
const groupHtml = timed
  .map((g, gi) => {
    const spans = g.words.map((w, wi) => `<span class="cw" id="cw-${gi}-${wi}">${esc(w.text)}</span>`).join(" ");
    return `    <div id="cap-${gi}" class="clip cap" data-start="${g.start}" data-duration="${r3(g.end - g.start)}"><div class="cap-in" id="cap-in-${gi}">${spans}</div></div>`;
  })
  .join("\n");
const tweens = timed
  .map((g, gi) => {
    const local = (t) => r3(t - g.start);
    const lines = [
      `  tl.fromTo("#cap-in-${gi}", { filter: "blur(6px)", scale: 0.96 }, { filter: "blur(0px)", scale: 1, duration: 0.12, ease: "power4.out" }, ${g.start});`,
    ];
    g.words.forEach((w, wi) => {
      lines.push(`  tl.fromTo("#cw-${gi}-${wi}", { opacity: 0.5 }, { opacity: 1, duration: 0.08, ease: "none" }, ${r3(g.start + Math.max(0, local(w.start)))});`);
    });
    return lines.join("\n");
  })
  .join("\n");
const captionsHtml = `<template>
  <style>
    #root { position: absolute; inset: 0; container-type: size; pointer-events: none; }
    .cap { position: absolute; left: 0; right: 0; bottom: ${bottom}cqh; text-align: center; overflow: visible; }
    .cap-in { display: inline-block; max-width: 84cqw; padding: 0.18em 0.42em; background: var(--cap-bg);
      font-family: var(--cap-font); font-weight: 700; font-size: 5.4cqmin; line-height: 1.15; letter-spacing: -0.01em; }
    .cw { color: var(--cap-ink); opacity: 0.5; white-space: nowrap; }
    ${portrait ? ".cap { left: 11.5cqw; right: 28cqw; } .cap-in { font-size: 5cqw; } /* portrait-cap: inside every 9:16 clear area */" : ""}
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
`;
mkdirSync(join(filmDir, "compositions"), { recursive: true });
writeFileSync(join(filmDir, "compositions", "captions.html"), captionsHtml);

// WebVTT: one cue per sentence, a sentence over 12 words split at a comma.
const sentences = [];
let s = [];
words.forEach((w, i) => {
  s.push(w);
  if (/[.!?]$/.test(w.text) || i === words.length - 1) {
    sentences.push(s);
    s = [];
  }
});
const cues = sentences.flatMap((sent) => {
  if (sent.length <= 12) return [sent];
  const out = [];
  let part = [];
  sent.forEach((w, i) => {
    part.push(w);
    const left = sent.length - i - 1;
    if ((/,$/.test(w.text) && part.length >= 4 && left >= 3) || i === sent.length - 1) {
      out.push(part);
      part = [];
    }
  });
  return out;
});
const ts = (t) => {
  const ms = Math.max(0, Math.round(t * 1000));
  const h = String(Math.floor(ms / 3600000)).padStart(2, "0");
  const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0");
  const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${sec}.${String(ms % 1000).padStart(3, "0")}`;
};
const vtt = ["WEBVTT", ""];
for (const c of cues) {
  vtt.push(`${ts(c[0].start)} --> ${ts(c[c.length - 1].end)}`, c.map((w) => w.text).join(" "), "");
}
mkdirSync(dirname(vttPath), { recursive: true });
writeFileSync(vttPath, vtt.join("\n"));
writeFileSync(
  join(filmDir, "words.json"),
  JSON.stringify({ method, offset, words: words.map(({ text, start, end }) => ({ text, start, end })) }, null, 1),
);
console.log(
  JSON.stringify({
    method,
    words: words.length,
    groups: timed.length,
    cues: cues.length,
    first_word_s: words[0]?.start ?? null,
    last_word_end_s: words.at(-1)?.end ?? null,
    film_s: filmLength,
    canvas: `${W}x${H}`,
  }),
);
