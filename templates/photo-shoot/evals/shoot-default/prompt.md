---
description: 'The default shoot of a cold brew bottle: priced first (3.30), the owner''s photo put on fal once with upload_file, the stem written to media/run-keys.json, 10 Nano Banana Pro edit shots from the uploaded cdn_url queued together and read in one wait_for_jobs, every prompt opening with the fidelity clause; the saved shots read and the best 3 picked; each pick remade at 1:1, 4:5, 9:16 and 16:9 from its own fal URL; everything saved under media/; fal cost 3.30. Pass 2 of 2.'
runs: 2
max_cost_usd: 11.10 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 3.5441: 3x = 10.632. Full set at 2dcb6f6399 (after the agent.md fixes) ran higher, 3.6942: 3x = 11.083, so the cap rises from 10.65 to 11.10. The 3x term decides: no run met serve's reserve, which would have to exceed 2x the highest run to change this cap.
input:
  product_image_url: https://driftwood.example/img/cold-brew.png
  product_notes: Cold brew coffee concentrate in a 500 ml amber glass bottle with a black cap and a cream label that reads DRIFTWOOD COLD BREW. For people who make their coffee at home before work. Calm, bright mornings.
---
Run a photo shoot for my product.
