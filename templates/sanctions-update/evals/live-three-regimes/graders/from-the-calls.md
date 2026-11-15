---
type: llm
---
A live run of the weekly sanctions update for OFAC, UK and EU (focus Russia), run with `lookback_days` 7 on the run's date (today, by your clock), so the window is the seven days
before it: `from` < date <= `to`, `to` being the run's date. No page was handed to it: it searched and read the real web. The
truth is not fixed, so judge the answer against the run's own calls, listed with the answer (tool, arguments, the result's text, cut, and every URL and title
the call returned).

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **One search per regime.** OFAC, the UK and the EU each have a `web_search` of their own. One query that names two or more regimes counts for none of them.
2. **Links from the calls.** Every entry in `actions` has a `source_urls` link that matches a call: read the link check, which matched each cited link against the calls in code. A link it
   marks `no matching call` fails. Where it says a page's links were cut, say so in your reason, and pass such a link
   only when the answer quotes text that is in that page.
3. **Dates in the window.** Every action's `published` date is inside the window, or the action is an older one that
   changed inside the window (a licence amended or extended, an entry corrected, a delisting), dated by a page in the
   calls.
4. **Nothing invented.** No count, entry name, program, license number or date in the answer contradicts what the
   calls returned, or names a notice the calls never touched. Where a cut preview hides a detail, do not fail for that
   alone.
5. **Not quiet when something is there.** If a fetched page or search result shows an action by one of the three
   regimes dated inside the window, that regime is not called quiet and `quiet` is not true. A regime whose pages
   failed or were not read is not called quiet either: `regimes_checked` and the report say it could not be checked, and while any regime could not be checked `quiet` is
   not true.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line of the answer that decided it.
