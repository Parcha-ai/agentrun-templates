---
type: llm
---
Monday's run showed Tilda Health's Product Designer (Mid-level). Tuesday's run, handed to the agent as run history,
dropped it as a repeat (it is in `dropped_repeats`, not `postings`), noted its deadline as 2026-11-30, and kept it in
`watched` with that deadline. Today Tilda's page says applications close 2026-12-14.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if `changes` has one line for
Tilda's deadline moving to 2026-12-14. Fail if Tilda's new deadline is missing from `changes`. Answer pass or fail, and
quote what decided it.
