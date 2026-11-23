---
description: "robots.txt blocks OAI-SearchBot and PerplexityBot (search) and GPTBot (training), and keeps every other bot out of /admin/ and /app/ only; llms.txt is a 404. Of three buyer searches, one lists the site first, one has only another site naming it, one shows neither. The two blocked search bots are the high fixes with the quoted rules, GPTBot is called the owner's choice, and each search result is reported as the list shows it."
runs: 2
max_cost_usd: 0.25
input:
  site: brightpath-hr.example
  brand: BrightPath HR
  questions: ["What is the best HR software for a small business?", "How can I automate employee onboarding?", "Which payroll software works for a 20-person company?"]
---
Check this site's AI search visibility.
