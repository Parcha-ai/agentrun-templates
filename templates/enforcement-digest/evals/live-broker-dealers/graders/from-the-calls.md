---
type: llm
---
A live run of the weekly enforcement digest for US broker-dealers from the SEC and FINRA, run with `lookback_days` 7 on the run's date (today, by your clock), so the window is the seven days
before it: `from` < date <= `to`, `to` being the run's date. No page was handed to it: it searched and read
the real web. The truth is not fixed, so judge the answer against the run's own calls, listed with the answer (tool,
arguments, the result's text, cut, and every URL and title
the call returned).

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **One search per regulator.** The SEC and FINRA each have a `web_search` of their own. One query that names both counts for neither.
2. **Links from the calls.** Every entry in `actions` has a `source_urls` link that appears in the calls. A link appears in the calls only as a search row's url, a fetch's url or final url, or a link
   listed in a fetched page's `links`. A link on the same site as a fetched page that appears nowhere in the calls
   fails: a made-up path on a real domain is invented. Where a call's links were cut (`links_cut` on the row, or the
   list's first line says the cut reached URL lists), say so in your reason, and pass a link from that same page only
   when the answer quotes text that is in the page.
3. **Dates in the window.** Every action's `announced_on` is inside the window, or the action is an older one that
   developed inside the window (a settlement approved, an appeal, an amended order), dated by a page in the calls.
4. **Nothing invented.** No respondent, amount, finding, rule or date in the answer contradicts what the calls
   returned, or names a release the calls never touched. Where a cut preview hides a detail, do not fail for that
   alone.
5. **Not quiet when something is there.** If a fetched page or search result shows an SEC or FINRA action against a
   broker-dealer or its staff dated inside the window, `quiet` is not true and the report does not call the week
   quiet. A regulator whose pages failed or were not read is `unreachable` in `regulators_checked`, never `quiet`, and while any regulator is unreachable `quiet` is not true.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line of the answer that decided it.
