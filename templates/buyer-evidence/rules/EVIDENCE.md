# Grading evidence

The buyer-evidence skill reads this before its first search.

## What answers which objection

| Objection is about | Evidence that answers it |
|---|---|
| Cost, ROI, budget | Payback, cost-per-unit or TCO figures with their sample and period; benchmark studies |
| Adoption, change | Rollout times, usage figures, migration stories, review comments on implementation |
| Risk, security, audit | Certifications and audit reports (SOC 1/2, ISO 27001) with dates; regulator or standards guidance; incident history |
| Fit for our kind of company | Named customers in the same industry, size and region |
| Switching from the incumbent | Migration stories, documented switching costs, contract terms, head-to-head reviews |

Finance roles weigh cost, payback and risk; operators weigh workflow and time; security and compliance weigh controls and
audits; executives weigh peers who adopted.

## Independence

- `vendor`: the vendor's case studies, trust or security page, press releases, and any study it commissioned or paid for
  (a "Total Economic Impact" study the vendor sponsored is vendor, whoever wrote it).
- `third_party`: independent surveys, benchmark groups, analysts writing on their own account, review sites, regulators,
  standards bodies, a customer's own announcement.

## Segment fit

- `strong`: same industry and a similar size or region as the buyer.
- `partial`: one of those matches.
- `weak`: neither; keep it only when nothing better exists, and say so.

## Rules for figures

- Quote the figure as the source states it, with its sample, period and method ("$9.40 to $3.10 cost per invoice,
  Tern Logistics, 600 staff, measured over 12 months").
- Never scale a figure to the buyer ("for your 400 people that is $X"), average across studies, or convert hours into
  dollars unless the source does. Illustrative arithmetic is the seller's job, not yours.
- A figure older than three years is marked "(dated)" in the report.
- A secondhand figure is traced to its origin or dropped (it may sit in `near_misses`).
- A review site's rating is reported with the review count and the date read, wherever it appears (a talking point and
  the report included); a head-to-head score keeps both products' counts. One review is never a trend, but a
  specific complaint that cuts against a claim goes in `against`.
