---
type: llm
---
The last run's answer (2026-11-15, handed as run history) says the 500,000 USD goal (open, pipeline default) was
reached that day and posted to C0SALES001. On 2026-11-16 the open pipeline is still 505,500.

Read the answer's last fenced `json` block. Pass only if all hold:

1. `posted.ok` is false.
2. `reached` is true.
3. `skipped` (or `report_markdown`) says this goal was already reached, on 2026-11-15.
4. `reached_on` is exactly `"2026-11-15"`, carried from the last answer, so the next check also skips. Missing, null or
   another date fails.
5. If `total` is given, `total.amount` is 505500; `total: null` is fine (the skill stops before reading HubSpot).

Answer pass or fail, and quote what decided it.
