---
description: '6 shots with ad sizes; fal refuses shot-2 (content filter, not charged). It is not sent again and nothing replaces it; the 5 other shots are saved, the best 3 of them picked and remade at the 4 ad sizes; status partial naming shot-2 in fal''s words; fal cost 2.55. Pass 2 of 2.'
runs: 2
max_cost_usd: 8.95 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 2.9452: 3x = 8.836. Full set at 2dcb6f6399 (after the agent.md fixes) ran higher, 2.9776: 3x = 8.933, so the cap rises from 8.85 to 8.95. The 3x term decides: no run met serve's reserve, which would have to exceed 2x the highest run to change this cap.
input:
  product_image_url: https://driftwood.example/img/cold-brew.png
  product_notes: Cold brew coffee concentrate in a 500 ml amber glass bottle with a black cap and a cream label that reads DRIFTWOOD COLD BREW. For people who make their coffee at home before work. Calm, bright mornings.
  shots: 6
---
Run a photo shoot for my product.
