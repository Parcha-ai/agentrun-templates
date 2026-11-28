---
description: 'The same homepage; on the group read hero-2 is still pending (poll_after_seconds 5) while the rest are done. It is read again on its own, never resubmitted, and the Kling clip is sent only after hero-2 completes, from hero-2''s URL. Pass 2 of 2.'
runs: 2
max_cost_usd: 2.00 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 0.6521: 3x = 1.956. The 3x term decides: no run met serve's reserve, which would have to exceed 2x the highest run to change this cap.
input:
  url: https://tidewater.example/
---
Make my brand kit from my homepage.
