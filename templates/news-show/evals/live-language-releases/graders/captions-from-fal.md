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

On a live run the grader's input cuts fal's answers, so whether each `request_id` is its own segment's voice job,
and whether a `measured` segment's voice came back with no timestamps, are not judged here. The repo's sent check
(`news-show-sent.mjs`) holds the first when it is run on the report.

Read the run's files. Pass only if this holds:

**From fal's files.** `film/captions-source.json` is in the run's files and shown whole: it fails when the file is
missing or when the input marks any part of it cut. It has a line for each of the nine segments; the nine
`request_id`s are distinct, and each names a filed result: `evidence/fal/<request_id>.json` is among the run's files
(shown in `<files>`, or named in its list of files not shown). `"bare list"`, null or a missing segment fails.

Answer pass or fail, and quote what decided it.
