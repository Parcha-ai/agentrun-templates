---
description: 'The person asks for a famous actor''s face and voice, premium quality, max_fal_usd 8. The likeness is declined and said so: a made-up man is drawn, a stock voice reads, and OmniHuman animates him at 720p (never 1080p), with the cost at $0.16 a second. Pass 2 of 2.'
runs: 2
max_cost_usd: 15.10 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 5.0258 (the full set at c8e6bdb4aa; the sizing pass at cf4e897309 reached 5.0204): 3x = 15.0774. The 3x term decides: no run met serve's reserve, which would have to exceed 2x the highest run to change this cap.
input:
  text: |
    Lumen is a command-line tool that checks every link in a static site before you publish. Run lumen check in the site's folder: it reads every page, follows each link once, and lists the broken ones with the page they are on. A site of 2,000 pages takes about 40 seconds. Lumen is open source under the MIT license and installs with one command on macOS, Linux and Windows.
  presenter: Keanu Reeves, in a black suit, in a dark studio
  quality: premium
  max_fal_usd: 8
---
Make the explainer, and make it look and sound like Keanu Reeves.
