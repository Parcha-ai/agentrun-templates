---
description: "Last week's edition reported Payflow's article, report and webinar and Billcraft's fake-invoice video; all are still at the top of their pages, and Billcraft's Nov 16 short, reported last week, falls inside this week's window too. This week Payflow added a case study and Billcraft a new video. The edition holds only the two new pieces; the short sits in dropped_repeats, and the window keeps last week's other pieces out."
runs: 3
max_cost_usd: 2.00
input:
  competitors: ["Payflow (payflow.example/blog)", "Billcraft (youtube.example/@billcraft)"]
  channel: "Company blogs and YouTube on AP automation"
  your_outlet: "Ledgerly blog, read by controllers at mid-size US companies"
---
Scheduled run, fired 2026-11-23T08:00:00Z (Monday). Write this week's competitor content edition with your competitor-content skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching and searching. These sites are test data.

--- https://payflow.example/blog (fetched 2026-11-23) ---
<h1>Payflow blog</h1>
<article><h2><a href="/customers/tern-logistics">How Tern Logistics cut invoice exceptions by 40%</a></h2><time>2026-11-18</time><p>Case study.</p></article>
<article><h2><a href="/events/closing-faster-ai-matching">Webinar: Closing faster with AI matching (Nov 20)</a></h2><time>2026-11-13</time><p>Co-hosted with Northbank Business Banking.</p></article>
<article><h2><a href="/blog/einvoicing-v2-ap-stack">How e-invoicing v2 changes your AP stack</a></h2><time>2026-11-12</time><p>Article.</p></article>
<article><h2><a href="/blog/state-of-ap-2026">State of AP 2026: 300 finance leaders on automation</a></h2><time>2026-11-10</time><p>Report.</p></article>

--- https://youtube.example/@billcraft/videos (fetched 2026-11-23) ---
<h1>Billcraft</h1>
<div>Can AI approve invoices? We tested 3 tools · 4,700 views · Nov 19, 2026 · /watch?v=bc119</div>
<div>Three red flags on a vendor invoice (short) · 9,800 views · Nov 16, 2026 · /shorts/bc116</div>
<div>We tried to fake a vendor invoice (and our AP tool caught it) · 26,900 views · Nov 11, 2026 · /watch?v=bc111</div>
<div>Approval chains explained · 4,300 views · Nov 4, 2026 · /watch?v=bc104</div>
<div>Month-end close in 5 days · 3,900 views · Oct 28, 2026 · /watch?v=bc028</div>

The result of this trigger's last completed run:

```json
{"edition_date":"2026-11-16","window":{"from":"2026-11-09","to":"2026-11-16"},"quiet":false,"interpretation":"Two AP automation rivals, framed for the Ledgerly blog.","competitors":[{"competitor":"Payflow","status":"published","pieces":[{"title":"How e-invoicing v2 changes your AP stack","url":"https://payflow.example/blog/einvoicing-v2-ap-stack","published":"2026-11-12","format":"article","topic":"e-invoicing","metric":null,"sponsor":null},{"title":"State of AP 2026","url":"https://payflow.example/blog/state-of-ap-2026","published":"2026-11-10","format":"report","topic":"automation survey","metric":null,"sponsor":null},{"title":"Webinar: Closing faster with AI matching","url":"https://payflow.example/events/closing-faster-ai-matching","published":"2026-11-13","format":"webinar","topic":"AI matching","metric":null,"sponsor":"Northbank Business Banking (co-host)"}],"themes":"e-invoicing, automation survey, AI matching","outperformer":null,"change":null},{"competitor":"Billcraft","status":"published","pieces":[{"title":"We tried to fake a vendor invoice (and our AP tool caught it)","url":"https://youtube.example/watch?v=bc111","published":"2026-11-11","format":"video","topic":"invoice fraud","metric":"21,300 views as of 2026-11-16","sponsor":null},{"title":"Three red flags on a vendor invoice","url":"https://youtube.example/shorts/bc116","published":"2026-11-16","format":"short","topic":"invoice fraud","metric":"1,200 views as of 2026-11-16","sponsor":null}],"themes":"invoice fraud","outperformer":{"title":"We tried to fake a vendor invoice","metric":"21,300 views as of 2026-11-16","baseline":"median 4,050 views over the six prior videos"},"change":null}],"gaps":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
