#!/usr/bin/env node
// run-key.mjs: a paid step's submission_key, made in code. A model making its own stem miscounts (a run wrote a
// 9-character one, fal refused it, and the run made a second), so the stem and every key come from here.
//
//   node .agents/skills/explainer-video/kit/run-key.mjs --step portrait|voiceover|voiceover-2|avatar
//
// It reads media/run-keys.json. No file: it makes one stem of 8 random lowercase letters and digits, writes
// {"stem": "<stem>"} there, and prints {"key":"ev-<stem>-<step>","stem":"<stem>"}. A file holding {"stem": <8 lowercase
// letters and digits>} (a resumed run): it prints that stem's key and leaves the file as it is. A file holding anything
// else: exit 3, and the file is never replaced, since a second stem would orphan the jobs already sent under the first.
// An unknown or missing step: exit 2. A refusal writes nothing.
import { randomInt } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const FILE = "media/run-keys.json";
const STEPS = ["portrait", "voiceover", "voiceover-2", "avatar"];
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const STEM = /^[a-z0-9]{8}$/;

const refuse = (code, message) => {
  console.error(`${message} Send no paid job.`);
  process.exit(code);
};

const at = process.argv.indexOf("--step");
const step = at === -1 ? undefined : process.argv[at + 1];
if (!STEPS.includes(step)) refuse(2, `--step ${step ?? "(none)"} is not one of portrait, voiceover, voiceover-2 or avatar.`);

let text;
try {
  text = readFileSync(FILE, "utf8");
} catch (e) {
  if (e.code !== "ENOENT") refuse(3, `${FILE} can't be read (${e.code ?? e.message}); it is left as it is.`);
}

let stem;
if (text === undefined) {
  stem = Array.from({ length: 8 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  mkdirSync("media", { recursive: true });
  try {
    // wx: never replace a file another call wrote meanwhile.
    writeFileSync(FILE, `${JSON.stringify({ stem })}\n`, { flag: "wx" });
  } catch (e) {
    refuse(3, `${FILE} appeared while the stem was made (${e.code ?? e.message}); run this again to read it.`);
  }
} else {
  let held;
  try {
    held = JSON.parse(text);
  } catch {}
  const ok =
    held && typeof held === "object" && !Array.isArray(held) && Object.keys(held).join() === "stem" && typeof held.stem === "string" && STEM.test(held.stem);
  if (!ok) {
    refuse(
      3,
      `${FILE} holds ${JSON.stringify(text.slice(0, 80))}, not {"stem": "<8 lowercase letters and digits>"}. It is not ` +
        "replaced: a second stem would orphan any job already sent under the first. Don't write that file; it is the kit's.",
    );
  }
  stem = held.stem;
}
console.log(JSON.stringify({ key: `ev-${stem}-${step}`, stem }));
