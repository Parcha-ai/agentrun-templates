---
description: 'A landscape watercolor of a lighthouse. One FLUX.1 schnell call at landscape_4_3, the image saved under media/ from the URL fal gave, and the answer names the saved path, the model and the exact prompt. Pass 2 of 2.'
runs: 2
max_cost_usd: 0.20 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67): the larger of 3x the highest run cost_usd and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 0.0253: 3x = 0.076, plus 0.17 = 0.195. Serve's refusal: "This run's cap of $0.10 is below what anthropic/claude-sonnet-5.5 at low effort needs for one more step and an answer, about $0.17."
input:
  description: A lighthouse on a rocky coast at dawn, gulls overhead, soft pastel watercolor
  shape: landscape
---
Make the picture described in the input.
