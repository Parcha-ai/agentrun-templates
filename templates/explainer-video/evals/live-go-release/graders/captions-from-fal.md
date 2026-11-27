---
type: llm
---
A live run on the real fal. The run files each completed fal job's whole result at `evidence/fal/<request_id>.json`,
so the caption kit reads the voiceover's timestamps from that file and the model never copies them. The voiceover is
the eleven-v3 job whose `request_id` fal answered in its `submit_job` reply (the re-voice's, when the run made one).

Read the calls in order. Pass only if both hold:

1. **From fal's file.** The `bash` call that runs `build-captions.mjs` and writes `media/explainer.vtt` passes
   `--timestamps evidence/fal/<that request_id>.json`.
2. **Never copied.** No `write` call, to any path, holds fal's timestamps: chunks of `characters`,
   `character_start_times_seconds` and `character_end_times_seconds`.

Answer pass or fail, and quote what decided it.
