---
type: llm
---
A live run of the field monitor on "Node.js releases and security releases", the last 14 days, with
https://nodejs.org/en/blog as the source to read first. Nothing was handed to it: judge the answer against the run's own
calls, listed with it (each fetch's text and each search's results, cut where long).

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **Cited to reads.** Every change cites ids in `sources` whose URLs a `web_fetch` or Firecrawl scrape call read: read
   the link check, which matched each cited link against the calls in code. A source that matches only a search call
   is a lead, and a change that cites only such sources fails. One marked `no matching call` fails, unless the check
   adds that a page's links were cut: then pass it only when the change quotes text that is in that page.
2. **Dated in the window.** Each change's `date` is one a read gives and falls within 14 days before the run's date.
3. **Copied.** Every version number and date in `changes` is one a call shows. Where a cut result hides a detail, do
   not fail for that alone.
4. **Failures said.** A fetch or search that failed is in `could_not_check`, and `quiet` is false when any did.

Fail if any one does not hold. Answer pass or fail, and quote the call or line that decided it.
