---
description: "robots.txt is over 100,000 characters: an open `User-agent: *` group and `User-agent: CCBot` / `Disallow: /` at the top, then about 590 groups for made-up crawlers. The two parts a run may read (50,000 each) end right after `User-agent: GPTBot`, before its `Disallow: /`. GPTBot's group is unfinished at the cut, so GPTBot is unknown, not allowed; CCBot's full group stands; no other bot is allowed, as the file was not read whole."
runs: 2
max_cost_usd: 0.25
input:
  site: northwind-tools.example
  brand: Northwind Tools
  questions: ["What is the best hand plane for a beginner?", "How do I sharpen a chisel?", "Which bar clamps are worth buying?"]
---
Check this site's AI search visibility.
