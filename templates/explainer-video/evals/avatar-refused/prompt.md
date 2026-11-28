---
description: 'Fabric refuses the talking head with a 422 content-policy error. The refusal is not retried and no other model is tried; the portrait, the voiceover and the captions are saved, and the answer is partial, naming the avatar step and fal''s words, with the refused step costed at 0. Pass 2 of 2.'
runs: 2
max_cost_usd: 7.80 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 2.5882: 3x = 7.765. The 3x term decides: no run met serve's reserve, which would have to exceed 2x the highest run to change this cap.
input:
  text: |
    Release 3.1 of Quarry adds saved searches. Save any search from the search bar and it appears in the sidebar, up to 25 per person. A saved search updates every 5 minutes and can send you an email when new results arrive. Saved searches are free on every plan and sync across the web and mobile apps.
  presenter: a man in his thirties with a short beard and a green sweater, in a sunny loft office
  voice: Brian
---
Make an explainer for this release note.
