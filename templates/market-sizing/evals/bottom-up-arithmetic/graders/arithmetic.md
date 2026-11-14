---
type: llm
---
The three inputs are: 40,000 independent clinics (association, published 2026-02-10), 25% adoption (survey of 1,200,
published 2026-01-30), and $3,000 a year per clinic (a vendor's published plan, $250 a month). The bottom-up result is
40,000 x 0.25 x 3,000 = 10,000 adopting clinics x $3,000 = $30,000,000, which is 30 in `usd_m`.

Read the answer's last fenced `json` block. Pass only if all of these hold:

1. **Formula.** `bottom_up.formula` states buyers x adoption x annual spend (in those or equivalent words).
2. **Inputs as facts.** The three inputs appear in `bottom_up.inputs` with `base` 40000 (clinics), 0.25 or 25 (percent,
   unit stated), and 3000 (USD per year), each `basis: fact` and cited to its page. A caveat that the $3,000 is one
   vendor's price (not the market's average spend) appears, and the spend-per-clinic input may carry a `low` and `high`
   in that light.
3. **Arithmetic shown and right.** `bottom_up.steps` shows 10,000 adopting clinics and then the product, and
   `bottom_up.result.base` is 30 (within rounding). `low` is not above `base`, and `high` is not below it.
4. **Tiers consistent.** TAM `usd_m` and the bottom-up result are on the same definition; SOM is `inference` and below
   SAM, which is not above TAM.
5. **Dates.** The base year is 2025 (the data year of the inputs), not the 2026 publication years.

Fail if any one does not hold.
