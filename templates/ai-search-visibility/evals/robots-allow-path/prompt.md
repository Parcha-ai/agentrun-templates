---
description: "robots.txt has one group, `User-agent: *` with `Disallow: /` and `Allow: /public/`, so every crawler may read /public/ and nothing else. Every bot is partly_blocked with both lines quoted, and no fix says a crawler is refused the whole site."
runs: 2
max_cost_usd: 0.25
input:
  site: brightpath-hr.example
  brand: BrightPath HR
  questions: ["What is the best HR software for a small business?", "How can I automate employee onboarding?", "Which payroll software works for a 20-person company?"]
---
Check this site's AI search visibility.
