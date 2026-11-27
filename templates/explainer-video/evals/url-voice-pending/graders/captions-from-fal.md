---
type: llm
---
The run files each completed fal job's whole result at `evidence/fal/<request_id>.json`, so the caption kit reads the
voiceover's timestamps from that file and the model never copies them. The captions are for the one voiceover, the
eleven-v3 job fal answered as request b2c3d4e5-2222-4b3c-9d4e-1f2a3b4c5d6e (pending on the first read, completed on
the next).

Read the calls in order. Pass only if both hold:

1. **From fal's file.** The `bash` call that runs `build-captions.mjs` and writes `media/explainer.vtt` passes
   `--timestamps evidence/fal/b2c3d4e5-2222-4b3c-9d4e-1f2a3b4c5d6e.json`.
2. **Never copied.** No `write` call, to any path, holds fal's timestamps: chunks of `characters`,
   `character_start_times_seconds` and `character_end_times_seconds`.

Answer pass or fail, and quote what decided it.
