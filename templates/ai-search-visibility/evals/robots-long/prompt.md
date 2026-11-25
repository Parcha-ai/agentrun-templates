---
description: "robots.txt is long (about 27,000 characters): an open `User-agent: *` group at the top, then about 150 groups for made-up crawlers, and `User-agent: GPTBot` / `Disallow: /` past character 26,000. A read cut at 12,000 or 20,000 characters never sees it. GPTBot is blocked with that rule quoted, and every other bot in the table is allowed."
runs: 2
max_cost_usd: 0.25
input:
  site: northwind-tools.example
  brand: Northwind Tools
  questions: ["What is the best hand plane for a beginner?", "How do I sharpen a chisel?", "Which bar clamps are worth buying?"]
---
Check this site's AI search visibility.
