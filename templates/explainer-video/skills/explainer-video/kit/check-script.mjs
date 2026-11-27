#!/usr/bin/env node
// check-script.mjs: the spoken-word cap, held in code before a voiceover is sent. A model counting its own words
// miscounts, so the script is counted here, the way the caption kit counts it (spoken-words.mjs).
//
//   node .agents/skills/explainer-video/kit/check-script.mjs --script work/script.txt --length 30
//   node .agents/skills/explainer-video/kit/check-script.mjs --script work/script.txt --max 84
//
// --script  the exact text to send to ElevenLabs v3, audio tags included
// --length  30, 45 or 60: the cap is 75, 110 or 135 spoken words (about 2.4 a second)
// --max     the re-voice's cap, step 6's spoken words x T / V x 0.9; with --length too, the lesser holds
//
// Within the cap: one JSON line, {"script_check":"passed","words":<n>,"max":<cap>}, exit 0. Over it: exit 1, saying
// how many words over and that nothing may be sent. A missing, empty or tag-only script, or no cap: exit 2. It writes
// nothing, ever.
import { readFileSync } from "node:fs";
import { spokenWords } from "./spoken-words.mjs";

const CAPS = { 30: 75, 45: 110, 60: 135 };
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const refuse = (code, message) => {
  console.error(`${message} Send nothing.`);
  process.exit(code);
};

const path = args.script;
if (!path) refuse(2, "--script <file> is required: the script to send, audio tags included.");
const caps = [];
if (args.length !== undefined) {
  if (!Object.hasOwn(CAPS, args.length)) refuse(2, `--length ${args.length} is not 30, 45 or 60.`);
  caps.push(CAPS[args.length]);
}
if (args.max !== undefined) {
  const max = Number(args.max);
  if (!Number.isFinite(max) || max <= 0) refuse(2, `--max ${args.max} is not a number of words above 0.`);
  caps.push(max);
}
if (!caps.length) refuse(2, "no cap: pass --length 30, 45 or 60 (or --max <words> for the re-voice).");
const max = Math.min(...caps);

let script;
try {
  script = readFileSync(path, "utf8");
} catch (e) {
  refuse(2, `${path} can't be read (${e.code ?? e.message}): write the script there first.`);
}
const { W } = spokenWords(script);
if (!W) refuse(2, `${path} has no spoken words (it is empty, or tags and marks only).`);
if (W > max) {
  const over = W - Math.floor(max);
  refuse(1, `${path} has ${W} spoken words, ${over} over the cap of ${Math.floor(max)}. Cut it, write it again and run this check again.`);
}
console.log(JSON.stringify({ script_check: "passed", words: W, max }));
