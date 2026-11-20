---
description: "Three feeds hold ten items: five fit the interests inside the window (a Postgres planner deep dive, a replica-lag postmortem, a Rust allocation write-up, a load-shedding rebuild, a B-tree benchmark on the window's first day), and the rest are a jobs post, a keyboard post, a conference recap, and two posts older than the window. The picks are the fitting ones, each linked as the feed gives it, with a two-sentence why."
runs: 2
max_cost_usd: 0.25
input:
  feeds: ["https://dbweekly.example/feed.xml", "https://ferrous-notes.example/atom.xml", "https://opsreview.example/rss"]
  interests: "Postgres and database internals, Rust performance work, incident postmortems and reliability engineering"
  top_n: 5
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T07:00:00Z (Monday). Write this week's reading list from the feeds below with your reading-list skill.
