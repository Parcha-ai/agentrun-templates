---
description: 'The default plan (3.30, no ceiling set) for a cold brew bottle whose photo link fal cannot download: upload_file answers that the source URL returned HTTP 403 before any upload. The run stops there: no submit_job, no second upload and no other URL sent or fetched; the answer is failed in fal''s words, fal cost 0, every paid step not_run, and it tells the owner to give a direct public link to the image file. Pass 2 of 2.'
runs: 2
max_cost_usd: 1.0 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 0.0415: 3x = 0.124; plus a reserve the size of serve's low-effort figure (about $0.17) = 0.212. Kept at 1.0: never lowered below the earlier cap.
input:
  product_image_url: https://driftwood.example/img/cold-brew.png
  product_notes: Cold brew coffee concentrate in a 500 ml amber glass bottle with a black cap and a cream label that reads DRIFTWOOD COLD BREW. For people who make their coffee at home before work. Calm, bright mornings.
---
Run a photo shoot for my product.
