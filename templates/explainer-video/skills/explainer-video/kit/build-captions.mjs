#!/usr/bin/env node
// build-captions.mjs: the explainer's captions, timed in code from the voiceover's character timestamps.
// Code does the exact work here (joining fal's character chunks, finding each word, cutting cues, the arithmetic);
// the agent never times a cue itself. Ported from release-film's kit, with this template's cue and timing rules.
//
//   node .agents/skills/explainer-video/kit/build-captions.mjs --script work/script.txt \
//     --timestamps evidence/fal/<request_id>.json --audio-seconds 29.2 --vtt media/explainer.vtt
//
// --script         the exact text sent to ElevenLabs v3, audio tags included
// --timestamps     the voiceover's result as the run filed it from fal's answer, evidence/fal/<request_id>.json
//                  ({audio, timestamps}): the kit takes its `timestamps`, so the model never retypes them. A result
//                  object is taken only from evidence/fal/. Or, on a server that files no fal results, fal's
//                  `timestamps` value as it answered it: a list of chunks, each {characters,
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
// 3. measured: no timestamps (no --timestamps file, or an empty or null list); the same, between 0 and V.
// It prints one line of JSON (the method and the cue count), then the WebVTT file it wrote. None of them is an error.
// Exit 2: nothing to caption or no length. Exit 3: a --timestamps file that isn't fal's chunks or the voiceover's
// filed result (it is never ignored); its message says what to pass.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

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
const refuse = (message) => {
  console.error(`${message} No captions written.`);
  process.exit(3);
};
const FILED = "evidence/fal/<request_id>.json";
const path = args.timestamps;
// The run files fal's answer itself under evidence/fal/; a result object anywhere else was written by the model.
const filed = Boolean(path) && basename(dirname(resolve(path))) === "fal" && basename(dirname(dirname(resolve(path)))) === "evidence";
const badTimestamps = (why) =>
  refuse(
    filed
      ? `${path} does not hold fal's timestamps as chunks (${why}): it is the run's own copy of fal's answer, so ` +
          "don't write another. Check it is the voiceover's request_id."
      : `${path} is not fal's timestamps as fal answered them (${why}): write the file again, copied exactly from ` +
          "fal's answer, and run the kit again.",
  );
let chunks = [];
if (path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (e) {
    if (filed && e.code === "ENOENT") {
      const folder = dirname(path);
      const there = existsSync(folder) ? readdirSync(folder).filter((f) => f.endsWith(".json")) : [];
      refuse(
        there.length
          ? `${path} is not in the run's files; ${folder}/ holds ${there.slice(0, 12).join(", ")}${there.length > 12 ? ", ..." : ""}. ` +
              "Pass the one named by the request_id fal answered for the voiceover's job."
          : `${path} is not in the run's files, and the run has no fal results in ${folder}/: this server files none. ` +
              "Write fal's `timestamps` value exactly as fal answered it, the whole list, to work/voiceover-timestamps.json " +
              "and pass that instead.",
      );
    }
    badTimestamps(e.message);
  }
  let raw;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    badTimestamps(e.message);
  }
  let list;
  if (Array.isArray(raw)) list = raw;
  else if (raw && typeof raw === "object" && !("characters" in raw)) {
    // A result object: fal's answer for one job, {audio, timestamps} for a voiceover.
    if (!filed) {
      refuse(
        `${path} is a result object, which the kit takes only as the run filed it from fal's answer: pass ` +
          `--timestamps ${FILED}, the request_id fal answered for the voiceover's job, and write no copy of it.`,
      );
    }
    if (!("audio" in raw) && !("timestamps" in raw)) {
      const keys = Object.keys(raw).join(", ") || "nothing";
      refuse(`${path} is not a voiceover's result (it holds ${keys}): pass the voiceover's request_id.`);
    }
    list = raw.timestamps ?? [];
    if (!Array.isArray(list)) badTimestamps("its timestamps is not a list");
  } else list = raw ? [raw] : [];
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
      w.at = at;
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

// A word longer than a line (a long compound, a URL) is cut into pieces of at most MAX_LINE characters, after its
// last hyphen or slash that fits, else at MAX_LINE. The pieces keep the word's characters, so its pieces on
// consecutive lines read as the word. Each piece is timed by its own letters when aligned. Otherwise it gets its
// share of the word's time, by letters (`weight`), so a word still counts once in W.
function pieces(text) {
  const out = [];
  let rest = text;
  while (rest.length > MAX_LINE) {
    const head = rest.slice(0, MAX_LINE);
    const at = Math.max(head.lastIndexOf("-"), head.lastIndexOf("/"));
    const cut = at > 0 ? at + 1 : MAX_LINE;
    out.push(rest.slice(0, cut).trimEnd()); // a space at a cut becomes the line break
    rest = rest.slice(cut).trimStart();
  }
  if (rest) out.push(rest);
  // A piece with no letter or digit (a run of dashes) rides on the piece before it when they fit on one line.
  return out.reduce((acc, p) => {
    if (acc.length && !norm(p).length && acc[acc.length - 1].length + p.length <= MAX_LINE) acc[acc.length - 1] += p;
    else acc.push(p);
    return acc;
  }, []);
}
const units = words.flatMap((w) => {
  if (w.text.length <= MAX_LINE) return [{ ...w, weight: w.key.length ? 1 : 0 }];
  let off = 0;
  return pieces(w.text).map((text) => {
    const key = norm(text);
    const u = { text, key, weight: w.key.length ? key.length / w.key.length : 0 };
    if (method === "aligned" && w.key.length) {
      if (key.length) {
        u.start = usable[w.at + off].start;
        u.end = usable[w.at + off + key.length - 1].end;
      } else {
        u.start = u.end = usable[w.at + Math.max(off - 1, 0)].end;
      }
    }
    off += key.length;
    return u;
  });
});

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
units.forEach((w, i) => {
  s.push(w);
  if (/[.!?]["')\]]*$/.test(w.text) || i === units.length - 1) {
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
    const timed = spoken.length ? spoken : g.filter((w) => Number.isFinite(w.start));
    return { start: ms(timed[0].start), end: ms(timed[timed.length - 1].end), g };
  });
} else {
  const [a, b] = span;
  const P = (b - a) / W;
  let k = 0;
  cues = groups.map((g, i) => {
    const n = g.reduce((sum, w) => sum + w.weight, 0);
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
