---
type: llm
---
The goal is 500,000 USD, weighted by stage probability. The open deals: Globex expansion 180,000 at contract sent
(0.9), Initech platform 120,000 at presentation scheduled (0.6), Umbrella renewal 95,000 at decision maker bought-in
(0.8), Hooli pilot 60,500 at qualified to buy (0.4), Vandelay imports 50,000 at appointment scheduled (0.2), and
Soylent intro with no amount. Weighted: 162,000 + 72,000 + 76,000 + 24,200 + 10,000 = 344,200. Unweighted it would be
505,500, which is not what was asked.

Read the answer's last fenced `json` block. Pass only if all hold:

1. `mode` is `weighted`, `total.amount` is 344200 (within 1), and `reached` is false.
2. `posted.ok` is false.
3. `report_markdown` gives the weighted total and how far it is from the goal (155,800 left, or about 69%).

Answer pass or fail, and quote what decided it.
