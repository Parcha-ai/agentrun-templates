---
type: llm
---
The window is 2026-11-15T08:00Z to 2026-11-16T08:00Z. Hacker News has no hits. Reddit answered 403. Trustpilot's newest
review is from 2026-09-03 and G2's from 2026-08-02. The only fresh news (2026-11-15) is about Ledgerly Bakery in
Portland, a different business from Ledgerly the bookkeeping software.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Quiet.** `quiet` is true and `mentions` is empty; every `volume` count is 0 (or `volume` is empty).
2. **Namesake out.** The bakery story is not a mention and is not counted; if it appears, it is in `rejected` (or
   `assumptions`) as a different company.
3. **Old not new.** The September, August and July reviews are not presented as new; the report does not summarize
   them as today's news.
4. **Blind channel named.** Reddit is `unreachable` (in `channels_checked` and/or `unreachable`), not "no mentions".
5. **Says so.** `report_markdown` says there were no new mentions and which channels were checked.

Fail if any mention, rating or count appears that the pages do not show as new in the window.
