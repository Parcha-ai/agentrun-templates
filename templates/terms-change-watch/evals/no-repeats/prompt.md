---
description: "Last week's run reported Brightpost's liability cap cut to three months of fees, effective December 15. This week the terms still show that cap, but the effective date moved to January 15, 2027, and the subprocessor list added an Irish analytics firm, which the owner's correction says they don't want. The report holds only the moved effective date as an update; the cap is a dropped repeat."
runs: 3
max_cost_usd: 1.50
input:
  documents: ["https://brightpost.example/terms", "https://brightpost.example/legal/subprocessors"]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Check the legal pages below for changed clauses with your terms-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These pages are test data.

--- https://brightpost.example/terms (fetched 2026-11-16) ---
<h1>Brightpost Terms of Service</h1>
<p>Last updated: November 12, 2026. These updated Terms take effect on January 15, 2027. (We previously announced an effective date of December 15, 2026.)</p>
<h2>9. Liability</h2><p>9.2 Each party's total liability will not exceed the fees paid by Customer in the three (3) months preceding the claim.</p>
<h2>11. Governing Law</h2><p>11.1 These Terms are governed by the laws of England and Wales.</p>

--- https://brightpost.example/legal/subprocessors (fetched 2026-11-16) ---
<h1>Subprocessors</h1><p>Last updated: November 10, 2026</p>
<table><tr><td>Amazon Web Services</td><td>Hosting</td><td>United States</td></tr><tr><td>Stripe</td><td>Payments</td><td>United States</td></tr><tr><td>Postmark</td><td>Email delivery</td><td>United States</td></tr><tr><td>Acme Analytics Ltd</td><td>Product analytics</td><td>Ireland</td></tr></table>

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"quiet":false,"changes":[{"vendor":"Brightpost","document":"terms","page_url":"https://brightpost.example/terms","clause":"9.2 Liability","kind":"liability","summary":"Liability cap cut from twelve months of fees to three","before":"the fees paid by Customer in the twelve (12) months preceding the claim","after":"the fees paid by Customer in the three (3) months preceding the claim","before_source":{"kind":"archive","date":"2026-10-30","url":"https://web.archive.org/web/20261030101500/https://brightpost.example/terms"},"confirmed":true,"version_date":"Last updated: November 5, 2026","effective":"December 15, 2026","vendor_claim":null,"so_what":"Review with counsel before December 15, 2026: the cap now covers three months of fees.","source_urls":["https://brightpost.example/terms"]}],"documents_checked":[],"assumptions":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
