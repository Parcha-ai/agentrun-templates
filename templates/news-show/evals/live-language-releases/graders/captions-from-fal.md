---
type: llm
---
The run files each completed fal job's whole result at `evidence/fal/<request_id>.json`, so the show's build reads
each voice's timestamps from that file and the model never copies them. The voices are the nine eleven-v3 jobs, each
with the request_id fal answered for it.

Read the calls in order and the run's files. Pass only if both hold:

1. **From fal's files.** Wherever the input shows `film/show.json` (the file, its `write` or an `edit` of it), each
   segment's `timestamps` shown is `evidence/fal/<request_id>.json` with the request_id fal answered for that
   segment's voice job, or null only for a voice fal answered with no timestamps; any other path, or a list in place
   of a path, fails. In `film/timeline.json`, which the build writes, a segment is `measured` only when its voice had
   no timestamps from fal. The build refuses a timestamps file that is missing, not fal's chunks, a copy of a result
   outside `evidence/fal/` or another job's result, so this and condition 2 show where the timestamps came from: a part
   of `film/show.json` cut from the input is not a fault.
2. **Never copied.** No `write` call, to any path, holds fal's timestamps (chunks of `characters`,
   `character_start_times_seconds` and `character_end_times_seconds`) or writes a file named `*-timestamps.json`, and
   no `bash` command copies or extracts a voice's timestamps into another file.

Answer pass or fail, and quote what decided it.
