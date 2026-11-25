---
type: llm
---
The site's robots.txt (made up) is about 27,000 characters long. It opens with `User-agent: *` and an empty
`Disallow:`, then holds about 150 groups for made-up crawlers, none of them a bot in the audit's table. Past character
26,000 it has `User-agent: GPTBot` / `Disallow: /`. A read of only the first 12,000 or 20,000 characters never reaches
that group, and sees GPTBot fall to the open `*` group.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **GPTBot.** `crawlers` gives GPTBot `blocked`, and its `rule` quotes `User-agent: GPTBot` and `Disallow: /`.
2. **The others.** Every other bot listed is `allowed`: none is `blocked` or `partly_blocked`.
3. **No claim past the read.** If the answer says any part of robots.txt was not read, nothing in it says the whole file
   was read or that no bot is blocked.

Fail if any one does not hold.
