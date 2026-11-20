---
type: llm
---
Last week's window ended 2026-11-09, so this week takes filings reported on or after 2026-11-09 and before 2026-11-16.
New this week: Robert Vance's sale of 12,000 shares, $495,000 (reported 2026-11-09 9:15 am), and Denise M Harlow's buy
of 30,000 shares, $1,203,000 (reported 2026-11-12; Finviz shows the same trade). Last week's: Harlow's $380,000 buy
(reported 11-08) and Park's $74,200 sale (11-06). Waits for next week: Vance's $122,700 sale reported 2026-11-16.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Only the new two.** `trades` holds exactly Vance's 12,000-share sale and Harlow's 30,000-share buy, each once.
2. **Old and today's out.** Harlow's 10,000-share buy, Park's 2,000-share sale and Vance's 3,000-share sale are not
   reported as this week's (a mention that today's filing waits for next week is fine).
3. **Significant.** Harlow's buy is significant; the sale is not.
4. **Window.** `window` is 2026-11-09 to 2026-11-16. `quiet` is false.

Answer pass or fail, and quote the field or line that decided it.
