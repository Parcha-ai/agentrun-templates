---
description: "A makers' fair page that gives the title, date and venue but no ticket price (\"details soon\"), no organizer email (a contact form only) and \"more than 60 stalls\". The three are null, each with what the page says in its place; nothing is guessed (no 0, no \"free\", no 60, no address made from the domain)."
runs: 2
max_cost_usd: 0.25
input:
  url: https://riverside-makers.example/events/winter-fair-2026
  schema: '{"type":"object","required":["title","start_date","venue","ticket_price_usd","organizer_email","stall_count"],"properties":{"title":{"type":"string"},"start_date":{"type":"string","format":"date"},"venue":{"type":"string","description":"the venue name and street address"},"ticket_price_usd":{"type":["number","null"]},"organizer_email":{"type":["string","null"],"format":"email"},"stall_count":{"type":["integer","null"],"description":"how many stalls there are"}}}'
---
Extract the data.
