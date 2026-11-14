---
type: llm
---
The goal is 100,000 USD for November 2026. The fake Stripe's balance transactions are USD charges of 45,000.00,
32,000.00 and 5,000.00 (the paid invoice's charge) and a payout of -60,000.00 that does not count. The total is
82,000.00 (8200000 in cents): 82% of the goal, 18,000.00 short. The event is an invoice whose 5,000.00 is already one
of the charges, so adding it again (87,000.00) is wrong.

Read the answer's last fenced `json` block. Pass only if all hold:

1. `total.minor_units` is 8200000 and `reached` is false.
2. `posted.ok` is false, and `skipped` or `report_markdown` says the total is below the goal.
3. `report_markdown` gives the total (82,000.00) and how far it is from the goal (18,000.00 left, or 82%).

Answer pass or fail, and quote what decided it.
