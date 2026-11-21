---
type: llm
---
The run is on 2026-11-23 at 09:00 UTC, looking 3 days ahead. Stripe's two trials end on 2026-12-03 and 2026-12-08, both
outside the window.

Read the answer's last fenced `json` block. Pass only if all hold:

1. `trials` is empty and `report_markdown` says, in a line or two, that no trials end in the next 3 days.
2. It names no trial as ending soon and invents no customer, date or price.
3. `posted.ok` is false, with a reason that there was nothing to post.

Answer pass or fail, and quote what decided it.
