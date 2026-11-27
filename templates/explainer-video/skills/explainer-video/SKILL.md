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
  --timestamps evidence/fal/<request_id>.json --audio-seconds <V> --vtt media/explainer.vtt
```

- `work/script.txt`: the exact text of the voiceover the captions are for, as sent to ElevenLabs, audio tags included.
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
