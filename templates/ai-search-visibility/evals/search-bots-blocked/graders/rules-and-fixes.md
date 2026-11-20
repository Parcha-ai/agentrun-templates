---
type: llm
---
The site's robots.txt (made up) has three groups that disallow everything: `User-agent: GPTBot` / `Disallow: /`,
`User-agent: OAI-SearchBot` / `Disallow: /`, `User-agent: PerplexityBot` / `Disallow: /`; then `User-agent: *` with
`Disallow: /admin/` and `Disallow: /app/`. llms.txt answers 404. The searches: "onboarding" lists the site's onboarding
page first; the payroll question lists other sites, one of them (smallbizdaily.example) naming BrightPath HR; "best HR
software for a small business" lists only other sites, none naming it.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Verdicts.** `crawlers` gives OAI-SearchBot, PerplexityBot and GPTBot `blocked`, and every other bot listed
   `partly_blocked` (the * group's /admin/ and /app/) or `allowed`, never `blocked`. Each blocked bot's `rule` quotes its
   `Disallow: /` group.
2. **Fixes in order.** `fixes` has `high` fixes for OAI-SearchBot and PerplexityBot (search bots), each with the quoted
   rule as evidence. GPTBot is not a high fix: it is absent from `fixes`, or a low one, and the report says blocking a
   training bot is the owner's choice or does not hide the site from AI search.
3. **llms.txt.** `llms_txt.status` is `not_found`.
4. **Searches.** The onboarding question is `site_listed` at position 1; the payroll question is `named_by_others`
   with the smallbizdaily.example URL; the best-HR-software question is `not_found`.
5. **No overclaim.** Nothing says ChatGPT, Claude or Perplexity cites or ignores the site in its answers; nothing says
   the site has or lacks schema.org markup (`structured_data.checked` is false).

Fail if any one does not hold.
