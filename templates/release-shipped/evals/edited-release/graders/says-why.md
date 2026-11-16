---
type: llm
---
A learned note says v2.4.0 was announced on 2026-11-14. The release feed brings v2.4.0 again with `update: true`: it was
edited after it was published (a typo in its notes fixed), not released again. Read the answer's last fenced `json`
block. Pass only if `posted.ok` is false and `skipped` (or `posted.why_not`) says v2.4.0 was already announced; saying
it was edited is welcome but not required. Fail if the answer says a message was posted, or treats the edit as a new
release to announce. Answer pass or fail, and quote what decided it.
