---
description: "First check of a competitor pricing page, so the baseline is last week's archive capture. Team went from $49 to $59 per user per month and Business lost its price for 'Contact sales'; the footer year, the rotating testimonial and the plan card order also differ. The report holds the two plan changes with exact before and after, and nothing for the noise."
runs: 3
max_cost_usd: 1.50
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Check the pages below for meaningful changes with your page-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These sites and prices are test data.

--- https://quillforge.example/pricing (fetched 2026-11-16) ---
<h1>Pricing that grows with your docs</h1>
<div class="plans">
<div class="plan"><h2>Business</h2><p class="price">Contact sales</p><ul><li>SSO and SCIM</li><li>Audit log</li><li>Unlimited spaces</li></ul></div>
<div class="plan"><h2>Starter</h2><p class="price">$0</p><ul><li>Up to 3 editors</li><li>1 space</li></ul></div>
<div class="plan"><h2>Team</h2><p class="price">$59 per user per month, billed annually</p><ul><li>Unlimited editors</li><li>20 spaces</li><li>AI search</li></ul></div>
</div>
<blockquote>"Quillforge cut our onboarding time in half." (Head of Platform, Linear)</blockquote>
<footer>© 2026 Quillforge, Inc.</footer>

--- https://web.archive.org/web/20261109/https://quillforge.example/pricing (lands on https://web.archive.org/web/20261108231502/https://quillforge.example/pricing) ---
<h1>Pricing that grows with your docs</h1>
<div class="plans">
<div class="plan"><h2>Starter</h2><p class="price">$0</p><ul><li>Up to 3 editors</li><li>1 space</li></ul></div>
<div class="plan"><h2>Team</h2><p class="price">$49 per user per month, billed annually</p><ul><li>Unlimited editors</li><li>20 spaces</li><li>AI search</li></ul></div>
<div class="plan"><h2>Business</h2><p class="price">$99 per user per month, billed annually</p><ul><li>SSO and SCIM</li><li>Audit log</li><li>Unlimited spaces</li></ul></div>
</div>
<blockquote>"Our docs finally have one home." (VP Engineering, Ramp)</blockquote>
<footer>© 2025 Quillforge, Inc.</footer>

Input:
```json
{
  "pages": [
    "https://quillforge.example/pricing"
  ],
  "company": "Inkwell",
  "lookback_days": 7
}
```
