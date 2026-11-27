#!/usr/bin/env node
// cost.mjs: the answer's steps and fal_cost_usd, worked out in code. A model doing its own arithmetic gets it wrong (a
// run gave the avatar step the run's total, so its steps summed past it), so every cost comes from here.
//
//   node .agents/skills/explainer-video/kit/cost.mjs --quality standard --rates image=0.0398,voice=0.1,avatar=0.08 \
//     --portrait done --voiceover done --avatar done --audio-seconds 29.16
//
// --quality        standard (the avatar on veed/fabric-1.0) or premium (fal-ai/bytedance/omnihuman/v1.5)
// --rates          get_pricing's rates: image per image (nano-banana), voice per 1000 characters (eleven-v3), avatar
//                  per second (the quality's avatar model)
// --portrait, --voiceover, --avatar   each step's status: done, pending, failed, refused or not_run
// --revoice        the re-voice's status, only when one was made
// --audio-seconds  the answer's audio_seconds; needed when the avatar is done or pending
//
// Units: the portrait 1 image; the voiceover work/script.txt's characters and the revoice work/script-2.txt's (tags
// included, the file's leading and trailing whitespace aside); the avatar --audio-seconds (0 when not given). A step
// done or pending costs units x rate; refused, failed or not_run costs 0. Each cost is rounded to 3 decimals, half up,
// and fal_cost_usd is the sum of the listed steps, rounded to 3 decimals. It prints one JSON line,
// {"steps":[{step, endpoint, units, unit, fal_cost_usd, status}, ...],"fal_cost_usd":<sum>}, steps in order (portrait,
// voiceover, revoice, avatar). Missing or bad input: exit 2. It writes nothing, ever.
import { readFileSync } from "node:fs";

const STATUSES = ["done", "pending", "failed", "refused", "not_run"];
const AVATAR = { standard: "veed/fabric-1.0", premium: "fal-ai/bytedance/omnihuman/v1.5" };
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const refuse = (message) => {
  console.error(`${message} Work out no cost yourself: fix this and run it again.`);
  process.exit(2);
};
// Half up at 3 decimals; the nudge keeps 0.1005, stored as 0.10049999..., rounding up.
const r3 = (x) => Math.round(x * 1000 + 1e-9) / 1000;

if (!Object.hasOwn(AVATAR, args.quality ?? "")) refuse(`--quality ${args.quality ?? "(none)"} is not standard or premium.`);
const rates = {};
for (const kv of String(args.rates ?? "").split(",")) {
  const [k, v] = kv.split("=").map((x) => x?.trim());
  if (k) rates[k] = v;
}
const rate = {};
for (const k of ["image", "voice", "avatar"]) {
  const v = Number(rates[k]);
  if (rates[k] === undefined || rates[k] === "" || !Number.isFinite(v) || v < 0)
    refuse(`--rates needs ${k}=<get_pricing's rate> (image per image, voice per 1000 characters, avatar per second); got ${JSON.stringify(args.rates ?? null)}.`);
  rate[k] = v;
}

const status = (name, optional = false) => {
  const s = args[name];
  if (s === undefined && optional) return undefined;
  if (!STATUSES.includes(s)) refuse(`--${name} ${s ?? "(none)"} is not one of done, pending, failed, refused or not_run.`);
  return s;
};
const billed = (s) => s === "done" || s === "pending";
const characters = (file, name, s) => {
  let text = "";
  try {
    text = readFileSync(file, "utf8").trim();
  } catch {}
  if (!text && billed(s)) refuse(`--${name} ${s} needs its script in ${file}, the text that was sent, and it is missing or empty.`);
  return [...text].length;
};

const steps = [];
const add = (step, endpoint, units, unit, perUnit, s) =>
  steps.push({ step, endpoint, units, unit, fal_cost_usd: billed(s) ? r3(units * perUnit) : 0, status: s });

const portrait = status("portrait");
const voiceover = status("voiceover");
const revoice = status("revoice", true);
const avatar = status("avatar");
let seconds = 0;
if (args["audio-seconds"] !== undefined) {
  seconds = Number(args["audio-seconds"]);
  if (!Number.isFinite(seconds) || seconds <= 0) refuse(`--audio-seconds ${args["audio-seconds"]} is not a number of seconds above 0.`);
} else if (billed(avatar)) refuse(`--avatar ${avatar} needs --audio-seconds <the answer's audio_seconds>.`);

add("portrait", "fal-ai/nano-banana", 1, "images", rate.image, portrait);
add("voiceover", "fal-ai/elevenlabs/tts/eleven-v3", characters("work/script.txt", "voiceover", voiceover), "characters", rate.voice / 1000, voiceover);
if (revoice !== undefined)
  add("revoice", "fal-ai/elevenlabs/tts/eleven-v3", characters("work/script-2.txt", "revoice", revoice), "characters", rate.voice / 1000, revoice);
add("avatar", AVATAR[args.quality], seconds, "seconds", rate.avatar, avatar);

console.log(JSON.stringify({ steps, fal_cost_usd: r3(steps.reduce((sum, s) => sum + s.fal_cost_usd, 0)) }));
