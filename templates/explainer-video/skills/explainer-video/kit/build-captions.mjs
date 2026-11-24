#!/usr/bin/env node
// build-captions.mjs: the explainer's captions, timed in code from the voiceover's character timestamps.
// Code does the exact work here (joining fal's character chunks, finding each word, cutting cues, the arithmetic);
// the agent never times a cue itself. Ported from release-film's kit, with this template's cue and timing rules.
//
//   node .agents/skills/explainer-video/kit/build-captions.mjs --script work/script.txt \
//     --timestamps work/voiceover-timestamps.json --audio-seconds 29.2 --vtt media/explainer.vtt
//
// --script         the exact text sent to ElevenLabs v3, audio tags included
// --timestamps     fal's `timestamps` value as it answered it: a list of chunks, each {characters,
//                  character_start_times_seconds, character_end_times_seconds}. Missing, null or [] is allowed.
// --audio-seconds  V, the voiceover's length (its file_size x 8 / 128000, or its last character's end). Times never
//                  pass it; without usable timestamps the cues run from 0 to V.
// --vtt            where the WebVTT file goes
//
// Cues: the script as spoken, audio tags removed, one or two lines of at most 42 characters each. A whole sentence
// when it fits in two lines; else cut at a comma, semicolon or colon, clauses packed while they fit; a clause still too
// long is cut at a phrase break.
//
// Timing, in order of preference (the voice starts at the video's start, so O = 0):
// 1. aligned: the chunks' letters and digits, tags left out, spell the script's words in order. A cue starts at its
//    first letter's own start time and ends at its last letter's own end time.
// 2. anchored: the chunks are there but don't spell the script (another take, a stand-in). The start anchor is the
//    first letter's start, the end anchor the last letter's end; each word lasts P = span / W (W the spoken words,
//    a hyphenated word is one), and the cues run back to back by their word counts.
// 3. measured: no timestamps (no --timestamps file, or an empty list); the same, between 0 and V.
// It prints one line of JSON (the method and the cue count), then the WebVTT file it wrote. None of them is an error.
// Exit 2: nothing to caption or no length. Exit 3: a --timestamps file that isn't fal's chunks (it is never ignored).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const MAX_LINE = 42;
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const need = (k) => {
  if (args[k] === undefined) {
    console.error(`--${k} is required`);
    process.exit(2);
  }
  return args[k];
};
const script = readFileSync(need("script"), "utf8");
const vttPath = need("vtt");
const V = args["audio-seconds"] === undefined ? NaN : Number(args["audio-seconds"]);

// A timestamps file that can't be read as fal's chunks is a copy gone wrong, never "no timestamps": timing from the
// length instead would put every cue off its letters. Exit 3, write nothing, and say what to fix.
const badTimestamps = (why) => {
  console.error(
    `${args.timestamps} is not fal's timestamps as fal answered them (${why}). No captions written: write the file ` +
      "again, copied exactly from fal's answer, and run the kit again.",
  );
  process.exit(3);
};
let chunks = [];
if (args.timestamps) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(args.timestamps, "utf8"));
  } catch (e) {
    badTimestamps(e.message);
  }
  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.timestamps) ? raw.timestamps : raw ? [raw] : [];
  list.forEach((c, i) => {
    const st = c?.character_start_times_seconds;
    const en = c?.character_end_times_seconds;
    if (!Array.isArray(c?.characters) || !Array.isArray(st) || !Array.isArray(en)) {
      badTimestamps(`chunk ${i + 1} lacks characters, character_start_times_seconds or character_end_times_seconds`);
    }
    if (st.length !== c.characters.length || en.length !== c.characters.length) {
      badTimestamps(`chunk ${i + 1} has ${c.characters.length} characters, ${st.length} starts and ${en.length} ends`);
    }
    if (![...st, ...en].every((t) => typeof t === "number" && Number.isFinite(t))) {
      badTimestamps(`chunk ${i + 1} has a time that is not a number`);
    }
  });
  chunks = list;
}

function norm(s) {
  return s.normalize("NFKD").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}

// The words as spoken: tags out, split on whitespace, punctuation kept for display. A token with no letter or digit
// (a lone dash) is not a word: it rides on the word before it.
const tokens = script.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
const words = [];
for (const t of tokens) {
  const key = norm(t);
  if (key.length || !words.length) words.push({ text: t, key });
  else words[words.length - 1].text += ` ${t}`;
}
if (!words.length || !words.some((w) => w.key.length)) {
  console.error("the script has no spoken words");
  process.exit(2);
}
const W = words.filter((w) => w.key.length).length;

// fal's characters joined in order, tags dropped, letters and digits only, each with its own times.
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
if (usable.length) {
  if (usable.length === letters.length && usable.map((l) => l.ch).join("") === words.map((w) => w.key).join("")) {
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
} else {
  if (!Number.isFinite(V) || V <= 0) {
    console.error("no usable timestamps and no --audio-seconds: the voiceover's length is unknown, so write no captions");
    process.exit(2);
  }
  span = [0, V];
}

// Cue text: sentences, then clauses, then phrase breaks, each cue as full as two lines allow.
const wrap = (ws) => {
  const lines = [];
  let line = "";
  for (const w of ws) {
    const next = line ? `${line} ${w.text}` : w.text;
    if (next.length <= MAX_LINE || !line) line = next;
    else {
      lines.push(line);
      line = w.text;
    }
  }
  if (line) lines.push(line);
  return lines;
};
const fits = (ws) => {
  const lines = wrap(ws);
  return lines.length <= 2 && lines.every((l) => l.length <= MAX_LINE);
};
const OPENS = new Set("as with and but or so to in on for from into at by when where which that who because if without now then than while after before until".split(" "));
const NEEDS_NEXT = new Set("a an the its their your our my his her this these those of to at in on for with and or as by from into is are was were be than".split(" "));
function cutPhrase(ws) {
  if (fits(ws) || ws.length < 2) return [ws];
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 1; i < ws.length; i++) {
    const left = ws.slice(0, i);
    let score = 0;
    if (fits(left)) score += 10 + i * 0.5; // a full first part
    if (OPENS.has(ws[i].key)) score += 3;
    if (NEEDS_NEXT.has(ws[i - 1].key)) score -= 6;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return [...cutPhrase(ws.slice(0, best)), ...cutPhrase(ws.slice(best))];
}
const sentences = [];
let s = [];
words.forEach((w, i) => {
  s.push(w);
  if (/[.!?]["')\]]*$/.test(w.text) || i === words.length - 1) {
    sentences.push(s);
    s = [];
  }
});
const groups = sentences.flatMap((sent) => {
  if (fits(sent)) return [sent];
  const clauses = [];
  let c = [];
  sent.forEach((w, i) => {
    c.push(w);
    if (/[,;:]["')\]]*$/.test(w.text) || i === sent.length - 1) {
      clauses.push(c);
      c = [];
    }
  });
  const out = [];
  let cur = [];
  for (const cl of clauses) {
    if (cur.length && fits([...cur, ...cl])) cur = [...cur, ...cl];
    else {
      if (cur.length) out.push(cur);
      cur = cl;
    }
  }
  if (cur.length) out.push(cur);
  return out.flatMap(cutPhrase);
});

// Times, in milliseconds so cue boundaries are exact and shared.
const ms = (t) => Math.round(t * 1000);
const cap = Number.isFinite(V) && V > 0 ? ms(V) : Infinity;
let cues;
if (method === "aligned") {
  cues = groups.map((g) => {
    const spoken = g.filter((w) => w.key.length);
    return { start: ms(spoken[0].start), end: ms(spoken[spoken.length - 1].end), g };
  });
} else {
  const [a, b] = span;
  const P = (b - a) / W;
  let k = 0;
  cues = groups.map((g, i) => {
    const n = g.filter((w) => w.key.length).length;
    const start = ms(a + k * P);
    k += n;
    const end = i === groups.length - 1 ? ms(b) : ms(a + k * P);
    return { start, end, g };
  });
}
for (const c of cues) {
  c.start = Math.min(c.start, cap);
  c.end = Math.min(c.end, cap);
}

const ts = (t) => {
  const h = String(Math.floor(t / 3600000)).padStart(2, "0");
  const m = String(Math.floor((t % 3600000) / 60000)).padStart(2, "0");
  const sec = String(Math.floor((t % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${sec}.${String(t % 1000).padStart(3, "0")}`;
};
const vtt = ["WEBVTT", ""];
for (const c of cues) vtt.push(`${ts(c.start)} --> ${ts(c.end)}`, ...wrap(c.g), "");
const text = vtt.join("\n");
mkdirSync(dirname(vttPath), { recursive: true });
writeFileSync(vttPath, text);
console.log(
  JSON.stringify({
    captions_timing: method,
    words: W,
    cues: cues.length,
    first_cue_start_s: cues[0].start / 1000,
    last_cue_end_s: cues[cues.length - 1].end / 1000,
    vtt: vttPath,
  }),
);
console.log(text);
