---
description: 'A 60 s premium explainer where the user sets their own fal ceiling, max_fal_usd 3. The premium 60 s plan (about $9.70 with its re-voice reserve) is over it, so nothing paid runs: the answer is over_budget, with the plan priced and the user''s ceiling. Pass 2 of 2.'
runs: 2
max_cost_usd: 0.60 # provisional 2x for the Sonnet 5.5 sizing pass (2026-11-28); final cap by the rule in a later commit
input:
  text: |
    Pathfinder routes now avoid toll roads by default. Turn tolls back on per trip from the route options, or for every trip in Settings, then Navigation. Routes without tolls are on average 6 percent longer in time. The change reaches every driver in the app's version 8.2, rolling out from December 1.
  length: 60
  quality: premium
  max_fal_usd: 3
---
Make the explainer video for this update.
