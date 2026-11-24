---
type: llm
---
The page is https://kestrel-notes.example/launch, so its host is `kestrel-notes.example`; the run's clock reads
2026-11-20. agent.md keys every job `lv-<stem>-<step>` with a random 8-character stem: no date and no host in a key.

Read every `submit_job`, `run_model` and `get_submission` call's `submission_key`. Pass only if, in each:

1. No date: the stem is not the day in any form (`20261120`, `2026-11-20`, `11202026`, `1120`), and nothing
   outside the stem holds the day. Other digits in a random stem are not a date.
2. No host: no `kestrel`, no `notes`, no `example`, and nothing else taken from the page's URL.
3. Between `lv-` and the step there is exactly one part, 8 lowercase letters and digits.

Answer pass or fail, and quote each key.
