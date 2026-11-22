---
description: "A ticket page drawn by JavaScript: the built-in fetch reads only \"enable JavaScript\". The run scrapes it once with Firecrawl's keyless scraper, fills the schema from what that returns (read_via firecrawl), and fetches nothing else."
runs: 2
max_cost_usd: 0.25
input:
  url: https://atlas-tickets.example/shows/4417
  schema: '{"type":"object","required":["show","date","venue","prices_usd"],"properties":{"show":{"type":"string"},"date":{"type":"string","format":"date"},"venue":{"type":"string"},"prices_usd":{"type":"array","items":{"type":"number"},"description":"every ticket price shown, lowest first"}}}'
---
Extract the data.
