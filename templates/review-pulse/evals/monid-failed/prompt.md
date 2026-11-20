---
description: "Every monid endpoint answers that monid could not be reached. The pulse says it could not read any review site and why, is not quiet, and reports no count, theme or quote."
runs: 2
max_cost_usd: 1.00
input:
  product: Tallyloom
  product_domain: tallyloom.example
  platforms: [g2, capterra, trustpilot]
  lookback_days: 7
---
Scheduled run. Write this week's review pulse with your review-pulse skill.
