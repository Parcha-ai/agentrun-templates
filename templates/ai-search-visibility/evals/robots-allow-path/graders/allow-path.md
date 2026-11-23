---
type: llm
---
The site's robots.txt (made up) has one group: `User-agent: *`, `Disallow: /`, `Allow: /public/`, then a `Sitemap:`
line. No group names any bot. Every crawler may read pages under /public/ and nothing else: none is refused the whole
site.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Verdicts.** `crawlers` gives every bot listed `partly_blocked`: none is `blocked`, none `allowed`.
2. **Rule.** Each bot's `rule` quotes both `Disallow: /` and `Allow: /public/`.
3. **No whole-site claim.** No fix and no line of `report_markdown` says a crawler is refused, blocked from or shut out
   of the whole site (or "all pages", "the entire site", "everything"). Saying the crawlers may read only /public/, or
   that the main pages are disallowed, is fine.

Fail if any one does not hold.
