---
description: "robots.txt has one group, `User-agent: *` with `Allow: /` and `Disallow: /docs/`, and the site's main docs sit under /docs/. The Allow: / does not undo the narrower Disallow, so every bot is partly_blocked with `Disallow: /docs/` quoted, and nothing calls a crawler fully allowed."
runs: 2
max_cost_usd: 0.25
input:
  site: brightpath-hr.example
  brand: BrightPath HR
  questions: ["What is the best HR software for a small business?", "How can I automate employee onboarding?", "Which payroll software works for a 20-person company?"]
---
Check this site's AI search visibility.
