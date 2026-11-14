---
type: llm
---
The review page lists five reviews. For the accounting tool Driftboard there are four (a 2-star complaint about a
nine-day support wait; three positive or neutral ones: quick setup and solid exports, an API with few endpoints, a good
month-end close). The fifth, a 1-star about deleted boards, is about DriftBoard Pro, a task-management product from a
different company (Driftboard Labs GmbH), and must not count against the competitor.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **No false trend.** If the support complaint appears in `weaknesses`, its `frequency` is `single_report` (or
   `unclear`), its `evidence` says it is one review among four on the page, and the text never says support problems are
   common, recurring or a pattern. Omitting it is also acceptable.
2. **Right company.** The "deleted our boards" review appears nowhere as evidence against Driftboard. If mentioned, it is
   named as about a different product and discarded.
3. **Quotes exact.** Any quote from a review matches the page word for word and is short, with its date.
4. **Counts and dates.** The review count (four for this product) and the date range (2026-09-03 to 2026-10-30) are
   stated where reviews are used.
5. **Positives respected.** The setup and exports praise, or the API gap, appears (as strengths or as a limitation of
   the API), cited. `strengths` is not empty.
6. **Gaps.** `gaps` says that the sample is small.

Fail if any one does not hold.
