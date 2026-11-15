---
type: llm
---
The captured CPI page is the 2023 edition (published 2024-01-30): Kenya scores 31/100, ranks 126 of 180. The run's date
is 2026-11-14, so that edition is stale. Newer CPI editions may exist online. The context is paying software contractors
in Kenya monthly; the regimes in scope are US OFAC and UK OFSI.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Stale marked.** If the CPI row uses the 2023 edition, it has `stale: true` and the report says it is stale. If the run
   cites a newer CPI edition it found, that row carries its own edition and date and the 2023 figure is not presented as
   current.
2. **Every indicator dated.** Each `indicators` row that reports a score or list status has an edition or publication
   date and cites a source; a row whose value is null or marked unconfirmed or not found needs no date. A row published
   more than 12 months before 2026-11-14 has `stale: true`.
3. **Context first.** `context_focus` names supplier or contractor payments, and the first `political_and_payment` items
   (or the report's first risk section) cover transfer, FX, payment rails or correspondent banking.
4. **Controls fit.** `controls` include at least two payment-side measures tied to findings, such as screening payees
   against the OFAC and UK lists, verifying bank accounts, or monitoring payments; not all three are needed.
5. **Only the regimes asked, from primary sources.** `sanctions` rows cover US OFAC and UK OFSI, each citing a source or
   marked `unconfirmed`; none claims a Kenya country program without a source.

Fail if any one does not hold.
