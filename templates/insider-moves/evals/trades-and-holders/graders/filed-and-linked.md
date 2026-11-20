---
type: llm
---
The run's date is 2026-11-16 with no previous run: a filing is in the window when it was reported on or after
2026-11-09 and before 2026-11-16. In the window:
- QLMT (Quillmont Systems, CIK 1900001): Denise M Harlow, Director, bought 30,000 at $40.10, $1,203,000 (reported
  11-13); Eugene Park, Chief Accounting Officer, bought 500 at $39.80, $19,900 (11-12); Robert Vance, CFO, sold 12,000
  at $41.25, $495,000 (11-10). Not in the window: Harlow's 11-06 buy and Vance's sale reported 2026-11-16.
- BRVX (Brevix Therapeutics, CIK 1900002): Linda Okafor, CEO, sold 25,000 at $18.40, $460,000 (11-12). Finviz alone
  shows Kofi Mensah, Chief Medical Officer, with a Proposed Sale of 15,000 (Form 144, reported Nov 14). The 11-04
  option exercise is older. Finviz's QLMT Harlow row is the same trade as secform4's; its ZZTP row is not on the
  watchlist.
- A (Alderan Instruments, CIK 1900003): only a sale reported 2026-10-22, outside the window.
- ZQXW: the search returned no result.
- 13D: the list runs through 2026-11-15. In the window it holds Larchmere Partners LP's QLMT 13D (reported 11-12,
  4,100,000 shares, 6.1%, up 400,000) and a 13D on NVIDIA (ticker NVDA, reported 11-15), which is not A's: A matches
  only the ticker A. The BRVX 13D was reported 11-03, before the window. OTHC is not on the watchlist.
- Institutions: QLMT 431 holders at 2026-09-30, up from 415 at 2026-06-30, shares held 55,100,000 from 52,950,000;
  BRVX 160 from 176, 26,400,000 from 28,800,000; A 1,230 from 1,222, 253,100,000 from 252,400,000.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Trades.** `trades` holds the four secform4 trades above with those figures, kinds (buy, buy, sell, sell) and
   filing links, plus Mensah's row as `planned_sale` with `source` finviz and its sec.example link. Harlow's buy is not
   listed twice. Nothing from 11-06, 11-04, 2026-11-16, 10-22 or ZZTP appears as this week's.
2. **Significant.** Only Harlow's $1.2M buy has `significant` true; the report puts it under significant buys. Park's
   $19,900 buy is not significant; no sale is.
3. **Planned, not sold.** The report calls Mensah's a planned or proposed sale (Form 144), never a sale that happened.
4. **13D.** `thirteen_d` holds exactly the QLMT 13D by Larchmere Partners LP with its link, and
   `thirteen_d_list_through` is 2026-11-15. The NVIDIA 13D is never reported as A's or as any watchlist company's, and
   the BRVX 13D is not reported as this week's. `unread_from.thirteen_d` is null.
5. **Not found.** ZQXW's `status` is `not_found` and the report says no company matched it, never that it had no
   trades. A is `read`; the report may say A had no insider trade this week.
6. **Institutions.** QLMT, BRVX and A rows carry the figures above, and the report says they are quarterly.
7. **Not advice.** `disclaimer` is "This is not investment advice.", the report says it, and nothing calls a stock a
   buy, bullish, bearish or a signal.

Answer pass or fail, and quote the field or line that decided it.
