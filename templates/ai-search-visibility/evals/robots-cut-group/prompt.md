---
description: "robots.txt is 156,516 characters: an open `User-agent: *` group and `User-agent: CCBot` / `Disallow: /` at the top, then about 860 groups for made-up crawlers. The third 50,000-character part ends right after `User-agent: GPTBot`, before its `Disallow: /`. A run either stops there (read_to_end false; GPTBot unknown, rule null, own_unfinished; CCBot blocked; every other bot unknown) or reads part 4 to the end (read_to_end true; GPTBot and CCBot blocked under their own groups; every other bot allowed under `*`). Either read passes if it is consistent with itself."
runs: 2
max_cost_usd: 0.25
input:
  site: northwind-tools.example
  brand: Northwind Tools
  questions: ["What is the best hand plane for a beginner?", "How do I sharpen a chisel?", "Which bar clamps are worth buying?"]
---
Check this site's AI search visibility.
