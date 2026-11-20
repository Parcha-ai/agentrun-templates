---
type: llm
---
The window is 2026-11-09 to 2026-11-16. Last week's digest, handed to the run, reported the SEC's Larchmont Securities
settlement ($2,000,000 penalty, pending court approval, announced 2026-11-05) and FINRA's $600,000 fine of Brightwater
Brokerage (AWC dated 2026-11-03). This week the court entered the final judgment against Larchmont on 2026-11-12 (SEC
release 2026-11-13), FINRA's monthly report lists Brightwater again, FINRA fined Oakridge Securities $50,000 (the
owner's correction says they want nothing under $100,000), and FINRA fined Seabright Capital Markets $425,000 (AWC dated
2026-11-12) for surveillance that excluded mobile-app accounts from AML alerting, April 2022 to June 2025.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **New action in.** `actions` holds Seabright Capital Markets with the $425,000 fine, `neither_admit_nor_deny`, the
   mobile-app exclusion as the practice, its period, and the 120-day certification as remediation.
2. **Development in.** `actions` holds Larchmont once, with an `update` (or report line) saying the court entered the
   final judgment on 2026-11-12 and `status` no longer `pending_court_approval`.
3. **Repeat out.** No action for Brightwater; `dropped_repeats` names it.
4. **Owner's wish kept.** No action for Oakridge, and no Oakridge line or $50,000 figure in `report_markdown`.
5. Exactly two actions.

Fail if Brightwater is reported again as new, or the Larchmont penalty is presented as a second, separate fine.
