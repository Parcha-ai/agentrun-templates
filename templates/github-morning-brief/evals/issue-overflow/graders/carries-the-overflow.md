---
type: llm
---
This brief fired Thursday 2026-11-19 08:00 UTC, after Wednesday's brief (window to 2026-11-18T08:00:00Z, no unread
start). Since then 120 issues were opened, #300 to #419, 7 minutes apart from 2026-11-18T08:10:00Z, over two pages of
the issue list. `new_issues` holds at most 100. The 100 opened first are #300 to #399; #400, the first left out, was
opened at 2026-11-18T19:50:00Z. Nothing merged and no pull request is open.

Read the answer's last fenced `json` block, its `report_markdown` included, and the tool calls. Pass only if all of these
hold:

1. **Both pages read.** The issue list was read past page 1.
2. **Oldest 100 listed.** `new_issues` holds 100 issues, #300 to #399, and none of #400 to #419.
3. **Carried.** `unread_from.issues` is 2026-11-18T19:50:00Z, and `unread_from.merged` is null.
4. **Said.** `report_markdown` says 20 more new issues come in the next brief.
5. **Not marked reported.** `reported.issues` holds #300 to #399 and none of #400 to #419.

Fail if any one does not hold. Answer pass or fail, and quote what decided it.
