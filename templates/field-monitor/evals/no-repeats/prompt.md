---
description: "Last week's report gave the KSA-2026-07 advisory (11-08) and the 4.1.4 fix release (11-08). This week the releases page adds 4.2.0 (11-12) and the blog adds a postmortem of the advisory (11-14). The report holds 4.2.0 and the postmortem (what it changed), and drops the advisory and 4.1.4 as already reported."
runs: 2
max_cost_usd: 0.25
input:
  topic: "The Kestrel stream processor and its ecosystem"
  sources: ["https://kestrel-stream.example/blog", "https://kestrel-stream.example/releases"]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Report what changed this week on the topic below with your field-monitor skill.

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"topic":"The Kestrel stream processor and its ecosystem","quiet":false,"changes":[{"headline":"Security advisory KSA-2026-07: admin API authentication bypass","what_changed":"An unauthenticated request with a crafted header could reach the admin API's job-cancel endpoint in 4.0.0 to 4.1.3; fixed in 4.1.4.","date":"2026-11-08","kind":"incident","sources":["S1"],"quote":"Fixed in 4.1.4 and 4.2.0."},{"headline":"Kestrel 4.1.4 released with the KSA-2026-07 fix","what_changed":"Patch release fixing KSA-2026-07.","date":"2026-11-08","kind":"release","sources":["S2"],"quote":"Fixes KSA-2026-07."}],"could_not_check":[],"dropped_repeats":[],"sources":[{"id":"S1","url":"https://kestrel-stream.example/blog/ksa-2026-07","title":"Security advisory KSA-2026-07 | Kestrel","published":"2026-11-08"},{"id":"S2","url":"https://kestrel-stream.example/releases","title":"Releases | Kestrel","published":null}],"searches":["Kestrel stream processor"],"ignored_instructions":[],"report_markdown":"..."}
```
