---
description: "Last week's digest reported the SEC's Larchmont Securities settlement (pending court approval) and a FINRA AML fine of Brightwater Brokerage. This week the court entered the Larchmont judgment (a development), FINRA's monthly report lists Brightwater again (a repeat), a $50,000 FINRA fine falls under the owner's learned threshold, and Seabright Capital was fined $425,000. The digest holds Seabright and the Larchmont update only."
runs: 3
max_cost_usd: 1.50
input:
  industry: "US broker-dealers"
  regulators: ["SEC", "FINRA"]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's enforcement digest with your enforcement-digest skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These firms and actions are test data.

--- https://www.sec.gov/enforcement-litigation/litigation-releases (fetched 2026-11-16) ---
2026-11-13 · Litigation Release No. 26418 · SEC Obtains Final Judgment Against Larchmont Securities LLC · https://www.sec.gov/enforcement-litigation/litigation-releases/2026/lr26418

--- https://www.sec.gov/enforcement-litigation/litigation-releases/2026/lr26418 (fetched 2026-11-16) ---
On November 12, 2026, the U.S. District Court for the District of New Jersey entered a final judgment, on consent, against Larchmont Securities LLC. The judgment permanently enjoins Larchmont from violating Section 17(a) of the Exchange Act and Rule 17a-8 and orders it to pay a civil penalty of $2,000,000. Larchmont consented to the judgment without admitting or denying the allegations of the SEC's complaint, which alleged that from 2019 to 2023 the firm failed to file SARs on suspicious deposits of microcap shares. The settlement was announced on November 5, 2026, subject to court approval.

--- https://www.finra.org/rules-guidance/oversight-enforcement/finra-disciplinary-actions (fetched 2026-11-16) ---
Monthly Disciplinary and Other FINRA Actions, November 2026 (published 2026-11-14):
- Brightwater Brokerage Inc. · AWC dated 2026-11-03 · censure and $600,000 fine; without admitting or denying, the firm failed to reasonably design its AML program to detect and report suspicious trading in low-priced securities from 2021 to 2024.
- Oakridge Securities LLC · AWC dated 2026-11-11 · censure and $50,000 fine; without admitting or denying, the firm failed to conduct independent AML testing in 2023 and 2024.
- Seabright Capital Markets LLC · AWC dated 2026-11-12 · censure and $425,000 fine; without admitting or denying, the firm's automated surveillance excluded accounts opened through its mobile app from AML alerting from April 2022 to June 2025, so potentially suspicious money movements went unreviewed. The firm must certify within 120 days that it has reviewed the excluded activity. Found through a FINRA examination.

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"quiet":false,"actions":[{"regulator":"Securities and Exchange Commission","respondent":"Larchmont Securities LLC","kind":"settlement","amounts":[{"value":2000000,"currency":"USD","component":"penalty","as_stated":"a civil penalty of $2,000,000"}],"findings_status":"neither_admit_nor_deny","practice_punished":"Failed to file SARs on suspicious deposits of microcap shares","duration":"2019 to 2023","how_found":"not_stated","remediation":"","status":"pending_court_approval","announced_on":"2026-11-05","order_date":null,"why_in_scope":"US broker-dealer","lesson":"Check how deposits of microcap shares are reviewed for SAR filing.","source_urls":["https://www.sec.gov/newsroom/press-releases/2026-183"]},{"regulator":"FINRA","respondent":"Brightwater Brokerage Inc.","kind":"fine","amounts":[{"value":600000,"currency":"USD","component":"penalty","as_stated":"a $600,000 fine"}],"findings_status":"neither_admit_nor_deny","practice_punished":"AML program not reasonably designed to detect suspicious trading in low-priced securities","duration":"2021 to 2024","how_found":"not_stated","remediation":"","status":"final","announced_on":"2026-11-03","order_date":"2026-11-03","why_in_scope":"US broker-dealer","lesson":"Check alert coverage for low-priced securities trading.","source_urls":["https://www.finra.org/rules-guidance/oversight-enforcement/finra-disciplinary-actions"]}],"regulators_checked":[],"not_actions":[],"assumptions":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
