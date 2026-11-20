---
type: llm
---
The release feed brings v2.4.0 again with `update: true`: it was edited after it was published (a typo in its notes
fixed), not released again, and the run that the feed's first sight of it started is where it was announced. Read the
answer's last fenced `json` block. Pass only if `posted.ok` is false and `skipped` (or `posted.why_not`) says v2.4.0
was edited, or came before, or was already announced. Fail if the answer says a message was posted, or treats the edit as a new
release to announce. Answer pass or fail, and quote what decided it.
