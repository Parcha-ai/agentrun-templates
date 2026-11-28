---
description: 'A 60 s premium explainer where the user sets their own fal ceiling, max_fal_usd 3. The premium 60 s plan (about $9.70 with its re-voice reserve) is over it, so nothing paid runs: the answer is over_budget, with the plan priced and the user''s ceiling. Pass 2 of 2.'
runs: 2
max_cost_usd: 0.35 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 0.1023: 3x = 0.307. Plus a reserve the size of serve's low-effort figure (about $0.17) = 0.272, so the 3x term decides.
input:
  text: |
    Pathfinder routes now avoid toll roads by default. Turn tolls back on per trip from the route options, or for every trip in Settings, then Navigation. Routes without tolls are on average 6 percent longer in time. The change reaches every driver in the app's version 8.2, rolling out from December 1.
  length: 60
  quality: premium
  max_fal_usd: 3
---
Make the explainer video for this update.
