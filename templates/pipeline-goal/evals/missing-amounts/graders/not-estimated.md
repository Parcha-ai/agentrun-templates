---
type: llm
---
The default pipeline's open deals with amounts are Globex expansion 180,000, Umbrella renewal 95,000 and Hooli pilot
60,500: 335,500. Cyberdyne rollout, Tyrell renewal and Massive Dynamic are open with no amount. A closed-won 400,000
deal doesn't count.

Read the answer's last fenced `json` block. Pass only if all hold:

1. `total.amount` is 335500, `total.deals_counted` is 3, `total.without_amount` is 3, and `reached` is false.
2. Nothing estimates the missing amounts (no average, no guess, no "could be" figure above 335,500 presented as the
   total).
3. `report_markdown` says three open deals have no amount, so the total may be low.

Answer pass or fail, and quote what decided it.
