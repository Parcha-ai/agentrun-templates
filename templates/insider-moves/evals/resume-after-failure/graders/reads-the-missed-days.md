---
type: llm
---
Last week's run (window 2026-11-02 to 2026-11-09) read QLMT but BRVX's search failed, so it carried BRVX in
`unread_from.tickers` from 2026-11-02. This week QLMT is read from 2026-11-09 and BRVX from 2026-11-02:
- QLMT: Denise M Harlow's buy of 30,000 shares, $1,203,000 (reported 2026-11-12) is new. Robert Vance's $495,000 sale
  (reported 2026-11-05) was in last week's report and is not this week's.
- BRVX: Linda Okafor's sale of 25,000 shares, $460,000 (reported 2026-11-13), and Kofi Mensah's sale of 8,000 shares,
  $152,800 (reported 2026-11-04, during the week the last run missed) are both reported. Okafor's 2026-10-28 buy is
  older than the carried start and is not.
- The 13D list runs through 2026-11-15 and holds no watchlist company.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Missed filing in.** `trades` holds Mensah's 2026-11-04 sale and Okafor's 2026-11-13 sale for BRVX, and Harlow's
   buy for QLMT (once, significant).
2. **No repeat, nothing older.** Vance's 12,000-share sale and Okafor's October buy are not reported as this week's.
3. **Said.** The report says BRVX was read from 2026-11-02 because the last run could not read it, in any wording.
4. **Nothing left unread.** `unread_from.tickers` is empty and `unread_from.thirteen_d` is null. `window` is
   2026-11-09 to 2026-11-16.

Answer pass or fail, and quote the field or line that decided it.
