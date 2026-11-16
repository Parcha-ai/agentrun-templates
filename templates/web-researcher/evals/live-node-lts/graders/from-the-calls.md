---
type: llm
---
A live run of the web researcher on "Which Node.js release line is the current Active LTS, what is the newest version
on that line, and when does that line's support end?" No page was handed to it: it searched and read the real web. The
truth is not fixed, so judge the answer against the run's own calls, listed with the answer (tool, arguments, the
result's text, cut, and every URL and title the call returned).

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **Answered when the calls show it.** If a fetched page names the Active LTS line, `status` is not `not_answered`
   and `short_answer` names that line. A part no fetched page answers is in `unconfirmed` with where the run looked.
2. **Findings rest on fetched pages.** Every finding cites at least one source whose link matches a `web_fetch` call:
   read the link check, which matched each cited link against the calls in code. A source that matches only a
   search call (`web_search`, or Parallel's `mcp:parallel/web_search`, whose results carry page excerpts) is a lead:
   a finding that cites only such sources fails. One marked `no matching call` fails,
   unless the check adds that a page's links were cut: then say so in your reason, and pass it only when the answer
   quotes text that is in that page.
3. **Copied, never made.** Every version number, date and count in `short_answer` and `findings` is one a page the
   finding cites shows, as that page writes it (a date rewritten as `YYYY-MM-DD` is copied; a day or month the page
   does not give is made up). A version, date or count that no call shows, or that contradicts one a call shows,
   fails. Where a cut result hides a detail, do not fail for that alone.
4. **Sources listed.** Every id cited anywhere is in `sources` with its URL, and no source is a search engine's
   results page.
5. **Disagreement shown.** If two fetched pages give different versions or dates for the same thing, a
   `disagreements` entry shows each with its source.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line of the answer that decided it.
