---
description: "Every feed fetch fails. The list says no feed could be read and why, picks nothing, is not marked quiet, and names no post from memory."
runs: 2
max_cost_usd: 0.25
input:
  feeds: ["https://dbweekly.example/feed.xml", "https://ferrous-notes.example/atom.xml", "https://opsreview.example/rss"]
  interests: "Postgres and database internals, Rust performance work, incident postmortems and reliability engineering"
  top_n: 5
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T07:00:00Z (Monday). Write this week's reading list from the feeds below with your reading-list skill.
