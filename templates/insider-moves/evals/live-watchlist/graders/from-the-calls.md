---
type: llm
---
A live run of the weekly insider-moves report for AAPL, NVDA and MSFT, with no previous run and `lookback_days` 7: a
filing is in the window when it was reported in the seven days before the run's date (by your clock); filings
reported on the run's own date wait for next week. Nothing was handed to it. The truth is not fixed, so judge the
answer against the run's own calls, listed with the answer: each monid call (`monid:<provider>/<endpoint>`) with its
result, cut.

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **Trades from the calls.** Every trade is a row a `secform4/search` or `finviz/get_insider_trading` call returned
   for that ticker, with its insider, shares, value and `filing_url` as the row gives them. No trade appears that the
   calls did not return. Where a result is cut, do not fail for a row the visible part does not show unless it
   contradicts what is visible.
2. **Dates in the window.** Every trade's `reported` date is in the window.
3. **Kinds.** A Sale is never a buy; a Finviz "Proposed Sale" is a planned sale, never a sale that happened;
   `significant` is true only for buys.
4. **Holders from the calls.** Each `institutions` row's figures are the last two entries of that call's
   `quarterList`, `holderCntList` and `stockShareCntList`.
5. **Not quiet when trades are there; not advice.** If a search returned a row reported in the window, `quiet` is
   false. The report says it is not investment advice and gives no opinion on any stock.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line of the answer that decided it.
