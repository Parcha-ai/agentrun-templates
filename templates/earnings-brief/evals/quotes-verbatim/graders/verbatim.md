---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`.

Pass only when all of these hold:

1. `quotes` has Rita Chen, Chief Executive Officer, with text exactly: "We are raising the full-year outlook because
   enterprise renewals closed ahead of plan, and we expect that to hold into the fourth quarter." (a shorter exact
   excerpt also passes; any reworded text inside the quotation marks fails), linked to
   https://ir.globex.example/q3-fy2026-transcript.
2. `guidance.change` is `raised`, `old_range` $2.5 to $2.6 billion, `new_range` $2.55 to $2.65 billion.
3. `qa_themes` has renewal pricing, the fourth-quarter outlook and headcount; no theme the transcript does not show.

Answer pass or fail, and quote what decided it.
