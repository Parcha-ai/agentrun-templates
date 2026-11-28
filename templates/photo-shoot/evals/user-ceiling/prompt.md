---
description: 'The default plan (10 shots and 12 ad sizes, 3.30) with the user''s own ceiling, max_fal_usd 1.00. No paid call, no upload and nothing saved: the answer is over_budget with the plan''s price, saying it is over the ceiling the user set. Pass 2 of 2.'
runs: 2
max_cost_usd: 1.0 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 0.0304: 3x = 0.091; plus a reserve the size of serve's low-effort figure (about $0.17) = 0.200. Kept at 1.0: never lowered below the earlier cap.
input:
  product_image_url: https://driftwood.example/img/cold-brew.png
  product_notes: Cold brew coffee concentrate in a 500 ml amber glass bottle with a black cap and a cream label that reads DRIFTWOOD COLD BREW. For people who make their coffee at home before work. Calm, bright mornings.
  max_fal_usd: 1.0
---
Run a photo shoot for my product.
