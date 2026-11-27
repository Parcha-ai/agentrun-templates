#!/usr/bin/env node
// answer.mjs: every answer field that is a copy or arithmetic, worked out in code. A model filling them by hand gets
// them wrong (a run put the run's total on the avatar step; another retyped its script with a tag it never sent), so
// the run copies what this prints.
//
//   node .agents/skills/explainer-video/kit/answer.mjs --plan --quality standard --rates image=0.0398,voice=0.1,avatar=0.08 --length 30
//   node .agents/skills/explainer-video/kit/answer.mjs --quality standard --rates image=0.0398,voice=0.1,avatar=0.08 --length 30 \
//     --portrait done:<request_id> --voiceover done:<request_id> [--revoice done:<request_id>] --avatar done:<request_id>
//
// --quality   standard (veed/fabric-1.0 at 480p) or premium (fal-ai/bytedance/omnihuman/v1.5 at 720p)
// --rates     get_pricing's rates: image per image (nano-banana), voice per 1000 characters (eleven-v3), avatar per
//             second (the quality's avatar model)
// --length    30, 45 or 60, the length asked for
// --plan      step 4, before any paid call: prints {"plan_usd","quality_used","avatar_model","resolution"}. plan_usd is
//             the portrait, work/script.txt's voiceover twice (the re-voice reserve) and --length seconds of the avatar.
// --portrait, --voiceover, --revoice (only when one was made), --avatar
//             each step's status, done, pending, failed, refused or not_run, with ":<request_id>" when fal answered one
//             (needed for done; nothing after the colon is no id). A done step's result is read from
//             evidence/fal/<request_id>.json, where the run files fal's answer; on a server that files none, from
//             work/fal/<request_id>.json, written as fal answered it.
//
// The voiceover described is the re-voice when it was made, passed step 6's checks and the run went on to the avatar
// step with it (the avatar's status is anything but not_run, a key refusal included), otherwise the first. Step 6 leaves
// the avatar not_run when the re-voice fails its checks; a run whose portrait failed never reaches the avatar either.
// `script` is its file's text (work/script-2.txt or work/script.txt) without the outer whitespace, and `word_count` its
// spoken words, counted as the script check counts them. `audio_seconds`: the avatar result's
// `duration` when it states one (source "avatar"), else that voiceover's audio.file_size x 8 / 128000 to one decimal
// ("file_size"), else its last character's end in timestamps ("timestamps"), else null. Units: the portrait 1 image, a
// voiceover its script's characters, the avatar audio_seconds (0 when null). Done or pending costs units x rate;
// refused, failed or not_run costs 0. Each cost is rounded to 3 decimals, half up; fal_cost_usd and plan_usd are the
// sums of their rounded parts. `files`: each fal output made (its saved path under media/, or null when the save
// failed, and fal's URL), then media/explainer.vtt and media/run-keys.json when they exist. It prints one JSON line.
// Missing or bad input: exit 2. It writes nothing, ever.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { spokenWords } from "./spoken-words.mjs";

const STATUSES = ["done", "pending", "failed", "refused", "not_run"];
const PLAN = {
  standard: { avatar_model: "veed/fabric-1.0", resolution: "480p" },
  premium: { avatar_model: "fal-ai/bytedance/omnihuman/v1.5", resolution: "720p" },
};
const IMAGE = "fal-ai/nano-banana";
const VOICE = "fal-ai/elevenlabs/tts/eleven-v3";
const argv = process.argv.slice(2);
const args = Object.fromEntries(argv.reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]?.startsWith("--") ? undefined : all[i + 1]]] : acc), []));
const refuse = (message) => {
  console.error(`${message} Fill none of these fields yourself: fix this and run it again.`);
  process.exit(2);
};
// Half up at 3 decimals; the nudge keeps 0.5005, stored as 0.50049999..., rounding up.
const r3 = (x) => Math.round(x * 1000 + 1e-9) / 1000;
const sum = (xs) => r3(xs.reduce((a, b) => a + b, 0));

if (!Object.hasOwn(PLAN, args.quality ?? "")) refuse(`--quality ${args.quality ?? "(none)"} is not standard or premium.`);
const quality = args.quality;
if (!["30", "45", "60"].includes(args.length)) refuse(`--length ${args.length ?? "(none)"} is not 30, 45 or 60.`);
const length = Number(args.length);
const given = {};
for (const kv of String(args.rates ?? "").split(",")) {
  const [k, v] = kv.split("=").map((x) => x?.trim());
  if (k) given[k] = v;
}
const rate = {};
for (const k of ["image", "voice", "avatar"]) {
  const v = Number(given[k]);
  if (given[k] === undefined || given[k] === "" || !Number.isFinite(v) || v < 0)
    refuse(`--rates needs ${k}=<get_pricing's rate> (image per image, voice per 1000 characters, avatar per second); got ${JSON.stringify(args.rates ?? null)}.`);
  rate[k] = v;
}

/** A script file's text, outer whitespace aside ("" when there is none). */
const scriptOf = (file) => {
  try {
    return readFileSync(file, "utf8").trim();
  } catch {
    return "";
  }
};
const voiceCost = (text) => r3([...text].length * (rate.voice / 1000));
const first = scriptOf("work/script.txt");
const planOf = () => {
  if (!first) refuse("work/script.txt is missing or empty: the plan prices the checked script's voiceover.");
  const voice = voiceCost(first);
  return sum([r3(rate.image), voice, voice, r3(length * rate.avatar)]);
};

if (argv.includes("--plan")) {
  console.log(JSON.stringify({ plan_usd: planOf(), quality_used: quality, ...PLAN[quality] }));
  process.exit(0);
}

const billed = (s) => s === "done" || s === "pending";
/** A step's status and request id, from --<name> <status>[:<request_id>]. */
const stepArg = (name, optional = false) => {
  const raw = args[name];
  if (raw === undefined && optional) return undefined;
  const at = String(raw ?? "").indexOf(":");
  const status = at === -1 ? raw : raw.slice(0, at);
  // Nothing after the colon is no request id: `not_run:` is `not_run`, and `done:` is refused below.
  const id = at === -1 || at === raw.length - 1 ? null : raw.slice(at + 1);
  if (!STATUSES.includes(status)) refuse(`--${name} ${raw ?? "(none)"} is not one of done, pending, failed, refused or not_run (with :<request_id>).`);
  if (id !== null && !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id)) refuse(`--${name}'s request id ${JSON.stringify(id)} is not a request id fal answered.`);
  if (status === "done" && !id) refuse(`--${name} done needs :<request_id>, the request_id fal answered for its job.`);
  return { status, id };
};

const FILED = "evidence/fal";
const filed = existsSync(FILED) ? readdirSync(FILED).filter((f) => f.endsWith(".json")) : [];
/** A done step's result: the run's own copy of fal's answer, checked to be that step's kind. */
const resultOf = (name, id, has) => {
  let path = `${FILED}/${id}.json`;
  if (!filed.length) path = `work/fal/${id}.json`;
  else if (!filed.includes(`${id}.json`))
    refuse(`--${name}'s ${id} has no result in ${FILED}/, which holds ${filed.slice(0, 12).join(", ")}: pass the request_id fal answered for its job.`);
  let result;
  try {
    result = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    refuse(
      filed.length
        ? `${path} can't be read as fal's answer (${e.message}).`
        : `this server files no fal results in ${FILED}/, and ${path} can't be read (${e.code ?? e.message}): write the job's result to it exactly as fal answered it.`,
    );
  }
  if (!result || typeof result !== "object" || !has(result))
    refuse(`${path} is not the ${name}'s result (it holds ${Object.keys(result ?? {}).join(", ") || "nothing"}): pass the ${name}'s request_id.`);
  return result;
};

const portrait = stepArg("portrait");
const voiceover = stepArg("voiceover");
const revoice = stepArg("revoice", true);
const avatar = stepArg("avatar");
const isImage = (r) => Array.isArray(r.images);
const isVoice = (r) => r.audio && typeof r.audio === "object";
const isVideo = (r) => r.video && typeof r.video === "object";
const res = {
  portrait: portrait.status === "done" ? resultOf("portrait", portrait.id, isImage) : null,
  voiceover: voiceover.status === "done" ? resultOf("voiceover", voiceover.id, isVoice) : null,
  revoice: revoice?.status === "done" ? resultOf("revoice", revoice.id, isVoice) : null,
  avatar: avatar.status === "done" ? resultOf("avatar", avatar.id, isVideo) : null,
};

const second = revoice ? scriptOf("work/script-2.txt") : "";
if (billed(voiceover.status) && !first) refuse(`--voiceover ${voiceover.status} needs its script in work/script.txt, the text that was sent, and it is missing or empty.`);
if (revoice && billed(revoice.status) && !second) refuse(`--revoice ${revoice.status} needs its script in work/script-2.txt, the text that was sent, and it is missing or empty.`);

// The voiceover described: the re-voice when it was made and the run went on to the avatar step with it.
const revoiceSent = revoice?.status === "done" && avatar.status !== "not_run";
const script = revoiceSent ? second : first;
const described = revoiceSent ? res.revoice : res.voiceover;
let audioSeconds = null;
let audioSource = null;
const duration = res.avatar?.duration;
if (typeof duration === "number" && Number.isFinite(duration) && duration > 0) {
  audioSeconds = duration;
  audioSource = "avatar";
} else if (described) {
  const size = described.audio?.file_size;
  const chunks = Array.isArray(described.timestamps) ? described.timestamps : [];
  const ends = chunks.at(-1)?.character_end_times_seconds;
  const last = Array.isArray(ends) ? ends.at(-1) : undefined;
  if (typeof size === "number" && Number.isFinite(size) && size > 0) {
    audioSeconds = Math.round((size * 8) / 128000 * 10 + 1e-9) / 10;
    audioSource = "file_size";
  } else if (typeof last === "number" && Number.isFinite(last) && last > 0) {
    audioSeconds = last;
    audioSource = "timestamps";
  }
}
if (billed(avatar.status) && audioSeconds === null)
  refuse(`--avatar ${avatar.status}, but the voiceover's length is unknown (fal stated neither its file_size nor its timestamps): no avatar is billed on an unknown length.`);

const steps = [];
const add = (step, endpoint, units, unit, perUnit, s) =>
  steps.push({ step, endpoint, units, unit, fal_cost_usd: billed(s.status) ? r3(units * perUnit) : 0, status: s.status, request_id: s.id });
add("portrait", IMAGE, 1, "images", rate.image, portrait);
add("voiceover", VOICE, [...first].length, "characters", rate.voice / 1000, voiceover);
if (revoice) add("revoice", VOICE, [...second].length, "characters", rate.voice / 1000, revoice);
add("avatar", PLAN[quality].avatar_model, audioSeconds ?? 0, "seconds", rate.avatar, avatar);

const saved = (path) => (existsSync(path) ? path : null);
const files = [];
if (res.portrait) files.push({ path: saved("media/portrait.png"), kind: "portrait", fal_url: res.portrait.images[0]?.url ?? null });
if (res.voiceover) files.push({ path: saved("media/voiceover.mp3"), kind: "voiceover", fal_url: res.voiceover.audio.url ?? null });
if (res.revoice) files.push({ path: saved("media/voiceover-2.mp3"), kind: "voiceover", fal_url: res.revoice.audio.url ?? null });
if (res.avatar) files.push({ path: saved("media/explainer.mp4"), kind: "video", fal_url: res.avatar.video.url ?? null });
if (existsSync("media/explainer.vtt")) files.push({ path: "media/explainer.vtt", kind: "captions", fal_url: null });
if (existsSync("media/run-keys.json")) files.push({ path: "media/run-keys.json", kind: "run_keys", fal_url: null });

console.log(
  JSON.stringify({
    script,
    word_count: spokenWords(script).W,
    audio_seconds: audioSeconds,
    audio_seconds_source: audioSource,
    quality_used: quality,
    ...PLAN[quality],
    plan_usd: planOf(),
    steps,
    fal_cost_usd: sum(steps.map((s) => s.fal_cost_usd)),
    files,
  }),
);
