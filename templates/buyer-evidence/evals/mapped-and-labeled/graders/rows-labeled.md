---
type: llm
---
Facts on the pages: Tern Logistics (600-person US freight company, vendor case study, April 2026) cut cost per invoice
from $9.40 to $3.10 over 12 months. A Total Economic Impact study commissioned by Ledgerly (September 2025, four
customers as one 1,000-employee composite) reports 212% ROI over three years and payback under 7 months. AP Benchmarks
(independent, March 2026, 410 US companies, 96 in manufacturing) reports median cost per invoice $9.87 manual and $2.36
top-quartile automated. Ledgerly's trust page claims SOC 1 Type II (period ending 2026-06-30) and SOC 2 Type II, and an
approval audit trail. An Auditing Standards Board staff Q&A (November 2025) says auditors may rely on automated
controls when general IT controls are tested and effective. Reviews: 4.6/5 from 212 reviews as of 2026-11-14; a
manufacturing controller (August 2026) praises the audit trail and says implementation took five months, not six
weeks.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Mapped.** Both objections have rows: cost rows from the case study, the benchmark and/or the TEI study; audit rows
   from the standards board Q&A, the trust page and/or the review. Each row has a URL from the pages and a date.
2. **Labeled.** The TEI study is `vendor` (it was commissioned), the case study and trust page are `vendor`, the
   benchmark and the standards Q&A are `third_party`.
3. **Not scaled.** No figure is applied to the buyer's 400 people or invoice volume, no savings in dollars are worked
   out for the buyer, and no figures from different studies are combined.
4. **Against.** The five-month implementation (against six weeks promised) is in `against`.
5. **Talking points and question.** Each objection has talking points that name the row they rest on and a question
   that uses a cited fact to ask for the buyer's own numbers.
6. **No advice.** The audit objection's points say the buyer's auditor confirms; nothing promises auditors will accept.
7. **Nothing invented.** No figure, customer or date appears that the pages do not show. Dates from the message
   itself (today, 2026-11-14, and the call on Tuesday, 2026-11-17) are allowed.

Fail if any one does not hold.
