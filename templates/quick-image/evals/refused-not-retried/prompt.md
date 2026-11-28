---
description: 'fal refuses the prompt on content policy. The agent does not run the model again or save anything, and answers failed with fal''s words and the prompt it sent. Pass 2 of 2.'
runs: 2
max_cost_usd: 0.25 # provisional, Sonnet 5.5 sizing pass (2026-11-28); final cap by the rule in the next commit
input:
  description: A city street at night in heavy rain, neon reflections on wet asphalt, cinematic
  shape: wide
---
Make the picture described in the input.
