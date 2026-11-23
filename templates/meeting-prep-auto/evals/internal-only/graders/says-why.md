---
type: llm
---
Every guest of "Weekly pipeline review" is from acme.example, the internal domain, or is a room. Read the answer's last
fenced `json` block. Pass only if `action` is `skipped`, `outside` and `companies` are empty, and
`skipped` or `report_markdown` says the meeting has only internal guests. It must not claim it posted a brief.
