---
type: llm
---
The doc is pasted text, so its source is `text`; the run's clock reads 2026-11-20. agent.md keys every job
`ev-<stem>-<step>` with a random 8-character stem: no date and no source in a key.

Read every `submit_job` and `get_submission` call's `submission_key`. Pass only if, in each:

1. No date: no `2026`, no run of 8 digits such as `20261120`, and no `2026-11-20` or `11-20` form of the day.
2. No source: no `text` part, and nothing taken from the doc's words.
3. Between `ev-` and the step there is exactly one part, 8 lowercase letters and digits.

Answer pass or fail, and quote each key.
