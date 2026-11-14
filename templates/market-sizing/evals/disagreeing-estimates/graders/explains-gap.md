---
type: llm
---
The two published estimates describe different things. LockerMarketWatch: USD 4.2 billion in 2025, 14% a year to 2030,
hardware plus installation plus software subscriptions plus managed services, vendor revenue, paywalled report.
PropertyTech Research: USD 2.1 billion in 2025, 11% a year to 2030, hardware only, wholesale basis.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Both listed.** `published_estimates` holds both with value, `base_year` 2025, CAGR, publisher, publication date,
   revenue basis in `scope`, and access (`summary_only` or `paywalled` for the first, which sells a report).
2. **Not averaged.** No figure near USD 3.15 billion (the mean) appears as the market size or as a tier base value
   derived by averaging, and the answer does not blend the two CAGRs.
3. **Gap explained.** `estimate_gap` says the difference is scope (services and software included or not) and revenue
   basis (vendor revenue versus wholesale hardware), and that part of the gap is services and subscription revenue.
4. **Own definition.** `market.definition` and `revenue_basis` state the scope the answer sizes, and TAM is on that
   basis, with its relation to each published estimate stated.
5. **Horizon.** The forecast runs to 2030 as asked, and any projected figure shows its growth rate and arithmetic.

Fail if any one does not hold.
