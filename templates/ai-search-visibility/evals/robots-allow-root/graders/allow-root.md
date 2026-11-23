---
type: llm
---
The site's robots.txt (made up) has one group: `User-agent: *`, `Allow: /`, `Disallow: /docs/`, then a `Sitemap:`
line. No group names any bot. The home page links the site's docs at /docs/. `Allow: /` does not undo the narrower
`Disallow: /docs/`: every crawler is kept out of /docs/, so none is fully allowed.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Verdicts.** `crawlers` gives every bot listed `partly_blocked`: none is `allowed`, none `blocked`.
2. **Rule.** Each bot's `rule` quotes `Disallow: /docs/`.
3. **Not fully allowed.** No fix and no line of `report_markdown` says a crawler is allowed everywhere, has full or
   unrestricted access, or may read the whole site. Saying `Allow: /` is in the file is fine.

Fail if any one does not hold.
