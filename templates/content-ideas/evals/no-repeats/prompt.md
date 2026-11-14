---
description: "Last week's edition used the Controller Pulse survey and the r/Accounting fake-invoice thread; both pages are still up and the thread is still growing. This week also brings the final e-invoice framework and a platform ending CSV bill import. A learned note says no webinars. The edition holds the two new hooks only, the old ones sit in dropped_repeats, and no idea is a webinar."
runs: 3
max_cost_usd: 2.00
input:
  company: "Ledgerly (ledgerly.example)"
  audience: "Finance teams at mid-size US companies"
---
Scheduled run, fired 2026-11-23T08:00:00Z (Monday). Write this week's content ideas with your content-ideas skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching and searching. These sites are test data.

--- https://fpa-association.example/research/controller-pulse-2026 (fetched 2026-11-23) ---
<h1>Controller Pulse 2026</h1><p>Published November 10, 2026. Survey of 840 controllers at US companies with $50M to $1B in revenue, fielded September 8 to 26, 2026.</p><p>61% say invoice exceptions are the main cause of a late close. 44% still key some vendor invoices by hand.</p>

--- https://reddit.example/r/Accounting/comments/8x2k1/ (fetched 2026-11-23) ---
<h1>Our AP clerk paid a fake "vendor bank change" invoice for $48k. How do you verify bank changes?</h1><p>Posted November 11, 2026 · 2.4k points · 610 comments</p>

--- https://bpc.example/news/e-invoicing-framework-v2-final (fetched 2026-11-23) ---
<h1>Business Payments Coalition publishes final US e-invoice exchange framework, version 2</h1><p>November 19, 2026. Version 2 adds credit notes and partial payments. It takes effect for participating networks on March 1, 2027. Twelve networks have signed on, the coalition says.</p>

--- https://bookwise.example/changelog (fetched 2026-11-23) ---
<h2>November 18, 2026</h2><p>CSV bill import will be retired on January 31, 2027. Use the new Bills API or email-in capture instead.</p>
<h2>November 5, 2026</h2><p>Two-way bank sync for all plans.</p>

The result of this trigger's last completed run:

```json
{"edition_date":"2026-11-16","window":{"from":"2026-11-09","to":"2026-11-16"},"quiet":false,"interpretation":"Ledgerly sells AP automation to finance teams at mid-size US companies.","ideas":[{"headline":"61% of controllers blame invoice exceptions for a late close","hook":{"kind":"report","what":"Controller Pulse 2026: 61% of 840 controllers (fielded Sep 2026) name invoice exceptions as the main cause of a late close.","date":"2026-11-10","label":"verified"},"angle":"Ledgerly can explain how matching rules cut exceptions.","post_to_write":"Post to write: a data chart post on why exceptions delay the close.","format":"data_chart","sources":[{"label":"Controller Pulse 2026","url":"https://fpa-association.example/research/controller-pulse-2026"}]},{"headline":"A $48k fake bank-change invoice shows the gap in vendor checks","hook":{"kind":"discussion","what":"r/Accounting thread, 1.2k points, 340 comments, 2026-11-11.","date":"2026-11-11","label":"verified"},"angle":"Finance teams want a bank-change checklist.","post_to_write":"Post to write: a LinkedIn carousel with a five-step bank-change check.","format":"carousel","sources":[{"label":"r/Accounting thread","url":"https://reddit.example/r/Accounting/comments/8x2k1/"}]}],"next_hook":null,"skipped":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
