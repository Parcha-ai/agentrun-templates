---
type: llm
---
A live evidence pack for Ramp (ramp.com) for a CFO at a 300-person US software company, with Expensify as the
incumbent, against two objections (switching disrupts employees; the savings are smaller than claimed), run 2026-11-15.
No page was handed to it: it searched and read the real web. The truth is not fixed, so judge the answer against the
run's own calls, listed with the answer (tool, arguments, a cut preview of the result).

A link is "in the calls" only when it appears there: a search result's url, a fetch's url or final url, or a link
in a fetched page's `links`. Wherever this rubric says a page the run fetched or a URL a search shows, it means that.
A link on the same site as a fetched page that appears nowhere in the calls fails. When a page's links were cut
(`links_cut`), say so; a link from that page passes only when the answer quotes text that is in the page.

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **Rows from the calls.** Every `evidence` row's `url` and every `against` row's `url` is a page the run fetched or a
   result URL a search in the calls shows. A row whose URL appears nowhere in the calls fails.
2. **Figures as stated.** Every figure in a row's `claim` is stated as a page in the calls gives it (same number, same
   customer, same period). Vendor-published figures are marked by `independence` as the vendor's. Where a cut preview
   hides a detail, do not fail for that alone.
3. **Nothing invented.** No customer, figure, date or quote in a talking point or question rests on something the calls
   never touched.
4. **Not empty when something is there.** If the calls show a case study, review or survey that speaks to an
   objection, that objection's `evidence` is not empty. An objection left empty has a `gaps` entry saying what was
   checked. A search or fetch that failed is named in `unreachable` or `gaps` as not checked, and the pack does not read
   as if it had been checked.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line of the answer that decided it.
