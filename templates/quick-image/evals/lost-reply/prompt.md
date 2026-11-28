---
description: 'fal''s reply to run_model is lost after the request was sent. The agent reads the job back with get_submission under the same submission_key, follows it with wait_for_jobs and saves the image, without paying for a second generation. Pass 2 of 2.'
runs: 2
max_cost_usd: 0.25 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67): the larger of 3x the highest run cost_usd and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 0.0363: 3x = 0.109, plus 0.17 = 0.206. Serve's refusal: "This run's cap of $0.10 is below what anthropic/claude-sonnet-5.5 at low effort needs for one more step and an answer, about $0.17."
input:
  description: A sea otter floating on its back holding a smooth stone, kelp around it, bright overcast light
  shape: square
---
Make the picture described in the input.
