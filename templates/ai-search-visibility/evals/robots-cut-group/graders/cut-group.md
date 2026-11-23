---
type: llm
---
The site's robots.txt (made up) is about 156,000 characters long. Near the top it has `User-agent: *` with an empty
`Disallow:`, then `User-agent: CCBot` / `Disallow: /`. Then come about 860 groups for made-up crawlers, none of them a
bot in the audit's table. The run may read three parts of 50,000 characters, and the third ends right after the line
`User-agent: GPTBot`, before that group's `Disallow: /`. So what was read ends inside GPTBot's group: its rules are
past the cut, and the rest of the file was not read.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **GPTBot.** `crawlers` gives GPTBot `unknown` with `rule` null: not `allowed`, not `blocked`.
2. **CCBot.** `crawlers` gives CCBot `blocked`, and its `rule` quotes `User-agent: CCBot` and `Disallow: /`.
3. **The others.** No other bot listed is `allowed`: each is `unknown`.
4. **Not read whole.** `could_not_check` says robots.txt was not read whole, and nothing in the answer says the whole
   file was read or that GPTBot is allowed.

Fail if any one does not hold.
