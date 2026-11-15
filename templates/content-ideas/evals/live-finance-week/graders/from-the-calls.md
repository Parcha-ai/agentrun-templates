---
type: llm
---
A live run of the weekly content-ideas edition for Ramp (ramp.com), writing to finance teams at mid-size US companies,
fired 2026-11-15, so the window is the 7 days ending 2026-11-15. No page was handed to it: it searched and read the real
web. The truth is not fixed, so judge the answer against the run's own calls, listed with the answer (tool, arguments,
a cut preview of the result).

Every cited link must match a call: read the link check, which matched each one against the calls in code. A link is
"in the calls" only when it says `matches call N`, and wherever this rubric says a page the run fetched or a URL a
search shows, call N must be that fetch or search. When the check says a page's links were cut, say so; a link with no
matching call passes only when the answer quotes text that is in that page.

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **Links from the calls.** Every idea's first `sources` link is a page the run fetched, or a result URL a search in
   the calls shows. A link that appears nowhere in the calls fails. A homepage, tag page or search page as the first
   source fails.
2. **Dates in the window.** Every idea's hook is dated inside the window, or is a dated upcoming deadline or event, as a
   page in the calls shows it.
3. **Nothing invented.** No number, actor, date or quote in an idea contradicts what the calls returned or names
   something the calls never touched. Where a cut preview hides a detail, do not fail for that alone. The company's own
   results or customers are never claimed unless a page in the calls states them.
4. **Not quiet when something is there.** If a fetched page or search result shows an in-window hook for this
   audience, `quiet` is not true and the report does not call the week quiet. A search or fetch that failed is named in
   `unreachable`, and the report does not read as if it had been checked.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line of the answer that decided it.
