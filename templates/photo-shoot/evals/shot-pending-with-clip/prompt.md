---
description: '6 shots, ad sizes and the hero clip. shot-3 answers pending on the first read: it is read again alone by its own handles, never resubmitted, and the picks wait for it. The 12 ad sizes and the Kling clip (from pick 1''s fal URL) are sent together and read in one wait_for_jobs; media/hero.mp4 saved; fal cost 3.05. Pass 2 of 2.'
runs: 2
max_cost_usd: 10.25 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 3.2984: 3x = 9.895. Full set at 2dcb6f6399 (after the agent.md fixes) ran higher, 3.4143: 3x = 10.243, so the cap rises from 9.90 to 10.25. The 3x term decides: no run met serve's reserve, which would have to exceed 2x the highest run to change this cap.
input:
  product_image_url: https://driftwood.example/img/cold-brew.png
  product_notes: Cold brew coffee concentrate in a 500 ml amber glass bottle with a black cap and a cream label that reads DRIFTWOOD COLD BREW. For people who make their coffee at home before work. Calm, bright mornings.
  shots: 6
  hero_clip: true
---
Run a photo shoot for my product, with the hero clip.
