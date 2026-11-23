---
type: llm
---
The site's robots.txt (made up) is `User-agent: *` / `Allow: /` and a sitemap line: every crawler is allowed. llms.txt
is present (heading "BrightPath HR", links to payroll, onboarding and pricing). Every search the run made returned the
same three results: peoplepilot.example, techreviewhub.example and reddit.com, none of them naming BrightPath HR.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Allowed.** Every bot in `crawlers` is `allowed`; no fix asks to change robots.txt.
2. **llms.txt.** `llms_txt.status` is `present`; no fix asks to publish one.
3. **Questions written for a buyer.** `questions` holds the searches run (one to three), none naming the brand, each
   `not_found` with `position` and `url` null and `top_domains` from the results.
4. **Fixes from what was read.** Any fix is about content for the questions the site was not found for (medium or
   low), with the search as evidence. No high fix.
5. **Nothing invented.** No position, mention, ranking or AI answer appears that the calls do not show; nothing says the
   site has or lacks schema.org markup.

Fail if any one does not hold.
