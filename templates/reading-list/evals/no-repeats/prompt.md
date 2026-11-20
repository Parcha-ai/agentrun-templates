---
description: "Last week's list picked the Postgres planner post and the B-tree benchmark. This week the B-tree post (dated the window's first day) is still in the window and a roundup feed relinks the planner post with a new date. Both are dropped as repeats; the picks are the postmortem, the Rust allocation post and the load-shedding post."
runs: 2
max_cost_usd: 0.25
input:
  feeds: ["https://dbweekly.example/feed.xml", "https://ferrous-notes.example/atom.xml", "https://opsreview.example/rss"]
  interests: "Postgres and database internals, Rust performance work, incident postmortems and reliability engineering"
  top_n: 5
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T07:00:00Z (Monday). Write this week's reading list from the feeds below with your reading-list skill.

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"interests":"Postgres and database internals, Rust performance work, incident postmortems and reliability engineering","quiet":false,"picks":[{"rank":1,"title":"How the Postgres 19 planner picks join orders","url":"https://dbweekly.example/2026/11/pg19-join-order","feed":"https://dbweekly.example/feed.xml","published":"Sun, 08 Nov 2026 09:00:00 GMT","why":"A walk through Postgres 19's new join-order search with EXPLAIN output before and after. It fits database internals.","matches":["Postgres and database internals"]},{"rank":2,"title":"B-tree deduplication, measured","url":"https://dbweekly.example/2026/11/btree-dedup","feed":"https://dbweekly.example/feed.xml","published":"Mon, 09 Nov 2026 10:00:00 GMT","why":"Benchmarks of index size and insert speed with and without B-tree deduplication. It fits database internals.","matches":["Postgres and database internals"]}],"dropped_repeats":[],"feeds":[],"ignored_instructions":[],"report_markdown":"..."}
```
