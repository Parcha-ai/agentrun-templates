---
type: llm
---
The page is https://kestrel-notes.example/launch, so its host is `kestrel-notes.example`; the run's clock reads
2026-11-20. agent.md keys every job `lv-<stem>-<step>` with a random 8-character stem: no date and no host in a key.

Read every `submit_job`, `run_model` and `get_submission` call's `submission_key`. Pass only if, in each:

1. No date: no `2026`, no run of 8 digits such as `20261120`, and no `2026-11-20` or `11-20` form of the day.
2. No host: no `kestrel`, no `notes`, no `example`, and nothing else taken from the page's URL.
3. Between `lv-` and the step there is exactly one part, 8 lowercase letters and digits.

Answer pass or fail, and quote each key.
