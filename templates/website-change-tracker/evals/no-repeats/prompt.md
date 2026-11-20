---
description: "Last week's run reported Quillforge's Team price rise to $59 and Business going to 'Contact sales', and an archive capture from that morning shows the page as it saw it. This week an Enterprise plan appeared and a logo strip with five customers was added, which the owner's correction says they don't want. The report holds only the new Enterprise plan; the Team and Business changes sit in dropped_repeats."
runs: 3
max_cost_usd: 1.50
input:
  pages: ["https://quillforge.example/pricing"]
  company: "Inkwell"
  lookback_days: 7
---
Scheduled run, fired 2026-11-23T08:00:00Z (Monday). Check the pages below for meaningful changes with your page-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These sites and prices are test data.

--- https://quillforge.example/pricing (fetched 2026-11-23) ---
<h1>Pricing that grows with your docs</h1>
<div class="plans">
<div class="plan"><h2>Starter</h2><p class="price">$0</p><ul><li>Up to 3 editors</li><li>1 space</li></ul></div>
<div class="plan"><h2>Team</h2><p class="price">$59 per user per month, billed annually</p><ul><li>Unlimited editors</li><li>20 spaces</li><li>AI search</li></ul></div>
<div class="plan"><h2>Business</h2><p class="price">Contact sales</p><ul><li>SSO and SCIM</li><li>Audit log</li><li>Unlimited spaces</li></ul></div>
<div class="plan"><h2>Enterprise</h2><p class="price">From $40,000 per year</p><ul><li>Everything in Business</li><li>Dedicated region (EU or US)</li><li>99.95% uptime SLA</li></ul></div>
</div>
<section class="logos">Trusted by Ramp, Linear, Vercel, Notion and Retool</section>
<footer>© 2026 Quillforge, Inc.</footer>

--- https://web.archive.org/web/20261116/https://quillforge.example/pricing (lands on https://web.archive.org/web/20261116071144/https://quillforge.example/pricing) ---
<h1>Pricing that grows with your docs</h1>
<div class="plans">
<div class="plan"><h2>Starter</h2><p class="price">$0</p><ul><li>Up to 3 editors</li><li>1 space</li></ul></div>
<div class="plan"><h2>Team</h2><p class="price">$59 per user per month, billed annually</p><ul><li>Unlimited editors</li><li>20 spaces</li><li>AI search</li></ul></div>
<div class="plan"><h2>Business</h2><p class="price">Contact sales</p><ul><li>SSO and SCIM</li><li>Audit log</li><li>Unlimited spaces</li></ul></div>
</div>
<blockquote class="testimonial">"Quillforge replaced three wikis for us." (Ramp)</blockquote>
<footer>© 2026 Quillforge, Inc.</footer>

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-09","to":"2026-11-16"},"quiet":false,"changes":[{"site":"quillforge.example","page_url":"https://quillforge.example/pricing","kind":"pricing","summary":"Team plan up from $49 to $59 per user per month","before":"$49 per user per month, billed annually (Team)","after":"$59 per user per month, billed annually (Team)","before_source":{"kind":"archive","date":"2026-11-08","url":"https://web.archive.org/web/20261108231502/https://quillforge.example/pricing"},"seen_on":"2026-11-16","effective_date":null,"so_what":"For Inkwell: a 20% rise on Quillforge's main plan; check our Team price against $59."},{"site":"quillforge.example","page_url":"https://quillforge.example/pricing","kind":"plan","summary":"Business plan price replaced by 'Contact sales'","before":"$99 per user per month, billed annually (Business)","after":"Contact sales (Business)","before_source":{"kind":"archive","date":"2026-11-08","url":"https://web.archive.org/web/20261108231502/https://quillforge.example/pricing"},"seen_on":"2026-11-16","effective_date":null,"so_what":"For Inkwell: Quillforge is moving Business deals to sales-led pricing."}],"unchanged":[],"no_baseline":[],"unreachable":[],"assumptions":[],"dropped_repeats":[],"ignored_instructions":[],"report_markdown":"..."}
```
