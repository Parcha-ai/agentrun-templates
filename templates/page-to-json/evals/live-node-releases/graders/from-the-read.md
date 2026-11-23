---
type: llm
---
A live run of page-to-json on https://nodejs.org/en/about/previous-releases, asked for the table of Node.js release
lines (major, codename, first released, last updated, status), newest first, at most 12. The page is real and changes,
so judge the answer against the run's own calls listed with it (each read's text, cut where long).

Read the answer's last fenced `json` block. Pass only if all of these hold:

1. **Read.** A `web_fetch` or Firecrawl scrape of that URL returned the table, and `read_via` names the tool whose text
   the data came from. If no call returned the table, the answer says the page could not be read and fills no value.
2. **Rows from the page.** Each `release_lines` item is a row the read shows: its major number, codename (null where the
   page shows "-" or none), dates and status match that row. Dates are the page's dates written as `YYYY-MM-DD` (May 05,
   2026 is 2026-05-05). A row, date or status no read shows, or one that contradicts the read, fails. Where the read's
   text was cut so a row is not visible, do not fail for that row alone.
3. **Newest first, no gaps at the top.** The list starts with the newest line the table shows and does not skip a row
   between its first and last item.
4. **Evidence.** `evidence` quotes the table's rows (at least the first row's), in words the read returned.
5. **One page.** No call reads a URL other than the input's.

Fail if any one does not hold. Answer pass or fail, and quote the call or line that decided it.
