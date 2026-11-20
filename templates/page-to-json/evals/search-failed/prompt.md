---
description: "Every fetch fails and no Firecrawl server is set up, so the page cannot be read. The answer says it could not read the page and why, fills no value, and does not say the page has no such data."
runs: 2
max_cost_usd: 0.25
input:
  url: https://riverside-makers.example/events/winter-fair-2026
  schema: '{"type":"object","required":["title","start_date","venue","ticket_price_usd","organizer_email","stall_count"],"properties":{"title":{"type":"string"},"start_date":{"type":"string","format":"date"},"venue":{"type":"string","description":"the venue name and street address"},"ticket_price_usd":{"type":["number","null"]},"organizer_email":{"type":["string","null"],"format":"email"},"stall_count":{"type":["integer","null"],"description":"how many stalls there are"}}}'
---
Extract the data.
