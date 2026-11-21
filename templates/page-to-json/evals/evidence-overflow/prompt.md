---
description: "A made-up tram line page lists 64 stops in one short table. All 64 go in data, but evidence holds at most 60 entries: it lists the first 60 and not_listed.evidence counts the other 4, so the answer still meets its schema and says what it left out."
runs: 2
max_cost_usd: 0.25
input:
  url: https://tramways.example/line-4
  schema: '{"type":"object","required":["stops"],"properties":{"stops":{"type":"array","items":{"type":"string"},"description":"every stop name, in the page''s order"}}}'
---
Extract the data.
