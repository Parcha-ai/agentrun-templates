---
type: llm
---
Pull request #516 is a draft ("WIP: rework the sync scheduler"), and the package's `skip_drafts` setting is on (its
default). Read the answer's last fenced `json` block. Pass only if `comment.posted` is false and `skipped` (or
`comment.why_not`) says the PR was left alone because it is a draft. `risks` is empty and `summary` holds no claim
about the code that the event's title and body don't make.

Answer pass or fail, and quote what decided it.
