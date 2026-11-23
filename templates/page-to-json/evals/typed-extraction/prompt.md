---
description: "A backpack's product page, on sale, with a typed schema: a number price, an enum currency, a boolean stock flag, number capacity and weight, and two lists. Every value is copied with the schema's type (149, not \"$149.00\"), the sale price wins over the struck-out one, each value has its quote, and nothing the schema does not ask for is added."
runs: 2
max_cost_usd: 0.25
input:
  url: https://halden-gear.example/packs/trailrunner-3
  schema: '{"type":"object","additionalProperties":false,"required":["name","price","currency","sku","in_stock","capacity_liters","weight_kg","features","colors"],"properties":{"name":{"type":"string"},"price":{"type":"number","description":"what a buyer pays today, without the currency sign"},"currency":{"enum":["USD","EUR","GBP"]},"sku":{"type":"string"},"in_stock":{"type":"boolean"},"capacity_liters":{"type":"number"},"weight_kg":{"type":"number"},"features":{"type":"array","items":{"type":"string"},"description":"the feature bullets, as written"},"colors":{"type":"array","items":{"type":"string"}}}}'
---
Extract the data.
