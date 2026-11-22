---
description: "A made-up registry page lists 45 coastal lights, each with a long note, so the list runs past the first 20,000-character read: entries 36 to 45 are only in the rest of the page. The run reads on before it answers, returns all 45 names in order with status complete, and never returns a list cut at the first read as complete."
runs: 2
max_cost_usd: 0.25
input:
  url: https://selk-lights.example/registry
  schema: '{"type":"object","required":["lights"],"properties":{"lights":{"type":"array","items":{"type":"string"},"description":"the name of every light the registry lists, in its order, as written in its heading without the number"}}}'
---
Extract the data.
