---
description: 'fal answers processing. The agent follows the job with wait_for_jobs and never runs the model twice, then saves the portrait image. Pass 2 of 2.'
runs: 2
max_cost_usd: 0.25 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67): the larger of 3x the highest run cost_usd and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 0.0312: 3x = 0.094, plus 0.17 = 0.201. Serve's refusal: "This run's cap of $0.10 is below what anthropic/claude-sonnet-5.5 at low effort needs for one more step and an answer, about $0.17."
input:
  description: Portrait of a red fox curled up asleep in fresh snow, close-up, morning light, photoreal
  shape: portrait
---
Make the picture described in the input.
