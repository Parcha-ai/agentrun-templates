---
type: llm
---
The run files each completed fal job's whole result at `evidence/fal/<request_id>.json`, so the show's build reads
each voice's timestamps from that file and the model never copies them. When the build succeeds it writes
`film/captions-source.json`, one line per segment: its caption `method` and the `request_id` of the filed result it
read (`"bare list"` for a list the model wrote, null for none). The file is under 1,000 bytes, so the input shows it
whole. The voices are the nine eleven-v3 jobs, each with the request_id fal answered for it.

Whether a `write` or `edit` copied fal's timestamps or touched `film/captions-source.json` is not judged here: the
repo's sent check (`news-show-sent.mjs`) holds it.

Read the calls and the run's files. Pass only if this holds:

**From fal's files.** `film/captions-source.json` is in the run's files and shown whole: it fails when the file is
missing or when the input marks any part of it cut. For each of the nine segments, its `request_id` is the
request_id fal answered for that segment's voice job (the eleven-v3 `submit_job` whose `submission_key` or text
is that segment's), the nine are distinct, and its `method` is `measured` only when fal answered that voice with no
timestamps. `"bare list"`, null, the still's or an anchor clip's request_id, or a missing segment fails.

Answer pass or fail, and quote what decided it.
