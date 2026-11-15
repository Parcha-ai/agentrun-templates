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
2. **Links from the calls.** Every entry in `items` has a `source_urls` link that appears in the calls. A link appears in the calls only as a search row's url, a fetch's url or final url, or a link
   listed in a fetched page's `links`. A link that differs from a call's URL only by its #fragment, a trailing slash or the
   order of its query parameters is that page and passes. The calls show query values redacted to "…": a "…"
   value matches any value for that key, but the keys must match. A link on the same site as a fetched page that appears nowhere in the calls
   fails: a made-up path on a real domain is invented. Where a call's links were cut (`links_cut` on the row, or the
   list's first line says the cut reached URL lists), say so in your reason, and pass a link from that same page only
   when the answer quotes text that is in the page.
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
