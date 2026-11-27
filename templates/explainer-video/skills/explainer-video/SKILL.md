---
name: explainer-video
description: The explainer's kit. kit/check-script.mjs holds the script's spoken-word cap before the voiceover is sent; kit/run-key.mjs makes each paid job's submission_key; kit/cost.mjs works out the answer's steps and fal_cost_usd; kit/build-captions.mjs turns the voiceover's script and fal's ElevenLabs v3 character timestamps into the explainer's WebVTT captions, with every cue cut and timed in code. Use for the script check, the run keys, the captions step and the cost of an explainer video.
---

# The script check

The word cap is held in code, since a model counting its own words miscounts. Before the voiceover's `submit_job`,
`write` the script to `work/script.txt` and run with `bash`:

```sh
node .agents/skills/explainer-video/kit/check-script.mjs --script work/script.txt --length <30|45|60>
```

`--length` caps it at 75, 110 or 135 spoken words. The re-voice (step 6) is its own file, `work/script-2.txt`, checked
with `--max <words>` instead. It counts the spoken words as the caption kit does (`kit/spoken-words.mjs`: tags out, a
lone dash rides on the word before, a hyphenated word is one) and writes nothing. Within the cap it prints
`{"script_check":"passed","words":<n>,"max":<cap>}` and exits 0: send that file's text. Over the cap it exits 1 and
says how many words over; a missing, empty or tag-only script, or no cap, exits 2. Never send a script it refused: cut,
write and check again.

# Run keys

Every paid `submit_job` carries a `submission_key` the kit makes, so no key is typed by hand. Before a step's first
`submit_job`, run with `bash`:

```sh
node .agents/skills/explainer-video/kit/run-key.mjs --step <portrait|voiceover|voiceover-2|avatar>
```

It prints `{"key":"ev-<stem>-<step>","stem":"<stem>"}`: send that `key`, copied exactly. Its first call makes the run's
one stem (8 random lowercase letters and digits) and writes it to `media/run-keys.json`; later calls and a resumed run
reuse it. Never write that file or make a stem yourself. A file holding anything else is refused (exit 3) and never
replaced, since a second stem would orphan the jobs already sent under the first; an unknown step exits 2. A refusal
writes nothing: send no paid job.

# The cost

The answer's `steps` and `fal_cost_usd` are arithmetic on `get_pricing`'s rates and each step's units, so code does it:
never compute a cost, a count or a sum yourself. Once every step's status is known, run with `bash`:

```sh
node .agents/skills/explainer-video/kit/cost.mjs --quality <standard|premium> \
  --rates image=<nano-banana per image>,voice=<eleven-v3 per 1000 characters>,avatar=<the avatar model per second> \
  --portrait <status> --voiceover <status> [--revoice <status>] --avatar <status> [--audio-seconds <audio_seconds>]
```

Each status is `done`, `pending`, `failed`, `refused` or `not_run`; pass `--revoice` only when a re-voice was made, and
`--audio-seconds` (the answer's `audio_seconds`) whenever it is known. The portrait is 1 image, a voiceover its script's
characters (`work/script.txt`, the re-voice `work/script-2.txt`, tags included), the avatar the audio seconds. A step
done or pending costs units × rate, rounded to 3 decimals, half up; refused, failed or not run costs 0. It prints one
line, `{"steps":[...],"fal_cost_usd":<the sum of the listed steps>}`: copy `steps` and `fal_cost_usd` into the answer
exactly, adding each step's `request_id`. Missing or bad input exits 2 and prints no cost; it writes nothing.

# The caption kit

Caption timing is exact arithmetic on fal's character timestamps, so code does it: never time or cut a cue yourself,
and never edit the file it writes.

Run it with `bash` from the run's folder (the sandbox's `/workspace`, where `read` and `write` also work):

```sh
node .agents/skills/explainer-video/kit/build-captions.mjs --script work/script.txt \
  --timestamps evidence/fal/<request_id>.json --audio-seconds <V> --vtt media/explainer.vtt
```

- `work/script.txt`: the exact text of the voiceover the captions are for, as sent to ElevenLabs, audio tags included
  (`work/script-2.txt` when the re-voice is the one sent to the avatar).
- `evidence/fal/<request_id>.json`: that voiceover's whole result, which the run files from fal's answer under the
  request_id fal gave its job (the re-voice's, with a re-voice). The kit takes its `timestamps`; never `write` them
  yourself. A result object is taken only from `evidence/fal/`. Only when the kit says the server files no fal results,
  `write` fal's `timestamps` value exactly as fal answered it, the whole list, to `work/voiceover-timestamps.json` and
  pass that (leave `--timestamps` out when fal answered none).
- `--audio-seconds`: V of that voiceover (step 6 of the agent's page).

It writes `media/explainer.vtt` and prints one JSON line, then the file it wrote. Every cue is one or two lines of at
most 42 characters. A word longer than a line (a long compound, a URL) is cut across lines, after a hyphen or slash
when there is one, and keeps its timing. The line's `captions_timing` says how
the cues were timed:

- `aligned`: fal's letters spell the script; each cue runs from its first letter's start to its last letter's end.
- `anchored`: fal's letters don't spell the script (another take, a stand-in); the cues run back to back between the
  first letter's start and the last letter's end, each lasting its share of the script's words.
- `measured`: no timestamps; the same, from 0 to V.

All three are correct timings, never a fault. Exit 2 means it wrote nothing: its message says why (no spoken words,
or neither timestamps nor V, so the voiceover's length is unknown and no captions are written).

Exit 3 means the `--timestamps` file is not the voiceover's timestamps, and it wrote nothing: the file isn't there,
isn't valid JSON, is another job's result or a result object outside `evidence/fal/`, or a chunk's `characters`,
`character_start_times_seconds` and `character_end_times_seconds` are missing, of different lengths, or hold a time
that is not a number. Its message says what to pass or write instead. The kit never times cues from V when it is handed
a file it can't read, since every cue would miss its letters: never leave `--timestamps` out to get past it.
