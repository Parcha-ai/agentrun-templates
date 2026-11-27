---
type: llm
---
The run files each completed fal job's whole result at `evidence/fal/<request_id>.json`, so the show's build reads
each voice's timestamps from that file and the model never copies them. The voices are the nine eleven-v3 jobs, each
with the request_id fal answered for it.

Read the calls in order. Pass only if both hold:

1. **From fal's files.** In `film/show.json` as the last `node film/build-show.mjs` run read it (its `write`, and any
   `edit` of it after that), each segment's `timestamps` is `evidence/fal/<request_id>.json` with the request_id fal
   answered for that segment's voice job, or null only for a voice fal answered with no timestamps.
2. **Never copied.** No `write` call, to any path, holds fal's timestamps: chunks of `characters`,
   `character_start_times_seconds` and `character_end_times_seconds`.

Answer pass or fail, and quote what decided it.
