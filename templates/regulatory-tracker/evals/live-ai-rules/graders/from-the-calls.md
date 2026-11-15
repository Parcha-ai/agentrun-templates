---
type: llm
---
A live run of the weekly regulatory brief on artificial intelligence for United States (federal), European Union and
California, run with `lookback_days` 7 on the run's date (today, by your clock), so the window is the seven days
before it: `from` < date <= `to`, `to` being the run's date. No page was
handed to it: it searched and read the real web. The truth is not fixed, so judge the answer against the run's own
calls, listed with the answer (tool, arguments, the result's text, cut, and every URL and title
the call returned).

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **One search per jurisdiction.** The US federal level, the EU
   and California each have a `web_search` of their own. One query that names two or more jurisdictions counts for none of them.
2. **Links from the calls.** Every entry in `items` has a `source_urls` link that matches a call: read the link check, which matched each cited link against the calls in code. A link it
   marks `no matching call` fails. Where it says a page's links were cut, say so in your reason, and pass such a link
   only when the answer quotes text that is in that page.
3. **Dates in the window.** Every item is dated inside the window by the development that put it there (published,
   adopted, signed, effective, comment period opened or closed), as a page in the calls shows it.
4. **Nothing invented.** No item, document number, stage, date or body in the answer contradicts what the calls
   returned, or names a document the calls never touched. A lead that rests on a news story or search result alone is
   never an item; it may sit in `unconfirmed_leads` or in a report line that calls it unverified. Where a cut preview hides a detail, do not fail for that alone.
5. **Not quiet when something is there.** If a fetched page or search result shows an official AI development in one of
   the three jurisdictions dated inside the window, `quiet` is not true and the report does not call the week quiet.
   A source that failed or was not read is named as not checked (in `unreachable` or `sources_checked`), the
   report does not read as if it had been checked, and while any source in `sources_checked` is `unreachable`, `quiet`
   is not true.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line of the answer that decided it.
