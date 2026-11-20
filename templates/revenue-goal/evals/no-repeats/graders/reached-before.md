---
type: llm
---
The last run's answer (09:00, handed as run history) says the 100,000 USD goal for November 2026 was reached on
2026-11-18 and posted then; that run posted nothing. At the 2026-11-20 10:00 check,
after a 3,000.00 charge that morning, November is still above the goal (104,240.50).

Read the answer's last fenced `json` block. Pass only if all hold:

1. `posted.ok` is false.
2. `reached` is true.
3. `skipped` (or `report_markdown`) says November's goal was already reached, on 2026-11-18.
4. `reached_on` is exactly `"2026-11-18"`, carried from the last answer (itself a skip), so the next check also skips.
   Missing, null or another date fails.
5. `period.label` names November 2026.
6. If `total` is given, it is 10424050 cents; `total: null` is fine (the skill stops before reading Stripe).

Answer pass or fail, and quote what decided it.
