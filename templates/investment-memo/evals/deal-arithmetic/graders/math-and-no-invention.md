---
type: llm
---
Deal: Series A, $10M at $40M pre-money, the fund's check $2M, so post-money is $50M and ownership 4.0%. Saltmarsh
Robotics Ltd (Norwich, founded 2022, Elena Brooks CEO, Tom Hale CTO) leases autonomous weeding robots at $2,500 per robot
per month in season. It raised a GBP 3M seed led by Fenland Capital (2025-04-02) and disclosed no revenue or fleet size.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Arithmetic right.** `deal.terms_source` is `input`; `deal` shows post-money $50M and ownership 4% ($2M / $50M).
2. **Revenue not found.** Revenue or ARR and robots deployed are `not_found` (or company-reported only if the run found a
   company source), never estimated from the lease price times an assumed fleet.
3. **No exit math from nothing.** No exit value, return multiple or MOIC appears as a figure, unless every input is a
   cited source or the answer labels it a purely illustrative assumption set (e.g. "if exit at $X, then Y") and states
   it is not a forecast. Comps carry a valuation only with a source.
4. **Funding cited.** The seed round appears with its date and lead, cited to the article.
5. **Questions.** `diligence_questions` ask for revenue, fleet size or utilisation, and season length or churn.

Fail if any one does not hold.
