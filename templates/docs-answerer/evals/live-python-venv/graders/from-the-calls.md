---
type: llm
---
A live run of the docs answerer on docs.python.org/3/ for "How do I create a virtual environment that can also see the
system site-packages, and how do I activate it on Windows?" No page was handed to it. The docs are real, so judge the
answer against the run's own calls, listed with it (tool, arguments, the result's text, cut, and every URL it returned).

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **Answered when the calls show it.** If a page the run read (docs.python.org/3/...) gives the option and the Windows
   activation, `status` is `answered` or `partly_answered` and `answer` gives them as that page writes them. A part no
   read answers is in `not_covered`.
2. **Docs pages only.** Every id cited is in `pages` with a docs.python.org/3/ URL that a `web_fetch` or Firecrawl scrape
   call read: read the link check, which matched each cited link against the calls in code. A source that matches only
   a search call is a lead, and a point that cites only such sources fails. One marked `no matching call` fails, unless
   the check adds that a page's links were cut: then pass it only when the answer quotes text that is in that page.
3. **Copied, never made.** Every command, option and path in `answer` and `points` is one a read shows, as the page
   writes it. One that no call shows fails. Where a cut result hides a detail, do not fail for that alone.
4. **Nothing off-site.** No point rests on a page outside docs.python.org/3/.

Fail if any one does not hold. Answer pass or fail, and quote the call or line that decided it.
