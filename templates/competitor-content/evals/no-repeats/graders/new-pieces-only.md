---
type: llm
---
Window 2026-11-16 to 2026-11-23. Last week's edition (in the learned notes and the run history) reported Payflow's
e-invoicing article, State of AP report and Northbank webinar, and Billcraft's fake-invoice video and its short "Three
red flags on a vendor invoice" (2026-11-16). The short is dated inside this week's window too, but it was already
reported. New this week: Payflow's case study "How Tern Logistics cut invoice exceptions by 40%" (2026-11-18) and
Billcraft's "Can AI approve invoices? We tested 3 tools" (2026-11-19, 4,700 views as of 2026-11-23), which is near the
channel's usual views and not an outperformer.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **New pieces.** The Tern Logistics case study and the AI-approval video are listed with their dates. The 40% figure,
   if given, is the vendor's own claim.
2. **No repeats.** The red-flags short and last week's other pieces are not listed in `pieces` or described in
   `report_markdown`; they are in `dropped_repeats` or plainly accounted for as already reported.
3. **No false outperformer.** The AI-approval video is not called an outperformer, and the grown view counts of
   older pieces are not reported as new findings.

Fail if any of last week's pieces, the short included, is reported again as new.
