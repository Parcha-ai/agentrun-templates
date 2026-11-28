---
description: 'fal answers processing. The agent follows the job with wait_for_jobs and never runs the model twice, then saves the portrait image. Pass 2 of 2.'
runs: 2
max_cost_usd: 0.25 # provisional, Sonnet 5.5 sizing pass (2026-11-28); final cap by the rule in the next commit
input:
  description: Portrait of a red fox curled up asleep in fresh snow, close-up, morning light, photoreal
  shape: portrait
---
Make the picture described in the input.
