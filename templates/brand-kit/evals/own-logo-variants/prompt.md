---
description: 'A newsletter tool''s homepage plus the owner''s logo URL. Three Nano Banana edits of that logo (mono, inverted on dark, app icon) take the place of new concepts, so no new logo is drawn on Ideogram and the logo URL goes to fal as image_urls, never fetched by the agent; heroes and clip as usual; fal cost 0.56 (3 × 0.0398 + 0.09 + 0.35). Pass 2 of 2.'
runs: 2
max_cost_usd: 2.15 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 0.7015: 3x = 2.105. The 3x term decides: no run met serve's reserve, which would have to exceed 2x the highest run to change this cap.
input:
  url: https://quillpost.example/
  own_logo_url: https://quillpost.example/static/quillpost-logo.png
---
Make my brand kit from my homepage.
