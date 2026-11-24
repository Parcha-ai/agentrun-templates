---
name: explainer-video
description: The explainer's caption kit. kit/build-captions.mjs turns the voiceover's script and fal's ElevenLabs v3 character timestamps into the explainer's WebVTT captions, with every cue cut and timed in code. Use for the captions step of an explainer video.
---

# The caption kit

Caption timing is exact arithmetic on fal's character timestamps, so code does it: never time or cut a cue yourself,
and never edit the file it writes.

Run it with `bash` from the run's folder (the sandbox's `/workspace`, where `read` and `write` also work):

```sh
node .agents/skills/explainer-video/kit/build-captions.mjs --script work/script.txt \
  --timestamps work/voiceover-timestamps.json --audio-seconds <V> --vtt media/explainer.vtt
```

- `work/script.txt`: the exact text of the voiceover the captions are for, as sent to ElevenLabs, audio tags included.
- `work/voiceover-timestamps.json`: that voiceover's `timestamps` value exactly as fal answered it, the whole list of
  chunks. With a re-voice, the second voiceover's script and timestamps (`work/voiceover-2-timestamps.json`).
- `--audio-seconds`: V of that voiceover (step 6 of the agent's page). Leave the `--timestamps` file out when fal
  answered none.

It writes `media/explainer.vtt` and prints one JSON line, then the file it wrote. The line's `captions_timing` says how
the cues were timed:

- `aligned`: fal's letters spell the script; each cue runs from its first letter's start to its last letter's end.
- `anchored`: fal's letters don't spell the script (another take, a stand-in); the cues run back to back between the
  first letter's start and the last letter's end, each lasting its share of the script's words.
- `measured`: no timestamps; the same, from 0 to V.

All three are correct timings, never a fault. Exit 2 means it wrote nothing: its message says why (no spoken words,
or neither timestamps nor V, so the voiceover's length is unknown and no captions are written).

Exit 3 means the `--timestamps` file is not fal's chunks as fal answered them: it isn't valid JSON, or a chunk's
`characters`, `character_start_times_seconds` and `character_end_times_seconds` are missing, of different lengths, or
hold a time that is not a number. It wrote nothing. The kit never times cues from V when it is handed a file it can't
read, since every cue would miss its letters. Write the file again, copied exactly from fal's answer, and run the kit
again; never leave `--timestamps` out to get past it.
