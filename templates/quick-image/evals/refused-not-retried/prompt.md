---
description: 'fal refuses the prompt on content policy. The agent does not run the model again or save anything, and answers failed with fal''s words and the prompt it sent. Pass 2 of 2.'
runs: 2
max_cost_usd: 0.20 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67): the larger of 3x the highest run cost_usd and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 0.0230: 3x = 0.069, plus 0.17 = 0.193. Serve's refusal: "This run's cap of $0.10 is below what anthropic/claude-sonnet-5.5 at low effort needs for one more step and an answer, about $0.17."
input:
  description: A city street at night in heavy rain, neon reflections on wet asphalt, cinematic
  shape: wide
---
Make the picture described in the input.
