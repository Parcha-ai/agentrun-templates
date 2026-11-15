---
type: llm
---
A live audit of https://sqlite.org with keywords "sqlite" and "embedded database", location United Kingdom. The data is
live, so exact values are not checked: check that the answer is built from the run's own calls. The run's calls (tool,
arguments preview, result preview) are listed with the answer. The paid tools appear there by their grant names
(`monid:dataforseo/onpage/lighthouse`) or their wire names (`monid__dataforseo__onpage__lighthouse`): Lighthouse
(`onpage/lighthouse`), Google rankings (`serp/google-organic`), page check (`onpage/instant-pages`) and backlink
summary (`backlinks/summary`). A ranking call that failed with a provider error and was retried counts once. These paid
calls may show their result without arguments: judge them by what they returned (a ranking result names its keyword),
never fail for an argument you cannot see.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

0. **Tools used.** The calls show exactly one successful Lighthouse call, at least one page check, and a ranking call
   for each keyword (or a failed one retried, with the gap stated).

1. **Crawl checks done.** `checks` hold a robots.txt row and a sitemap row, each with evidence, backed by a fetch in the
   run's calls. A sitemap URL that answers 404 is a finding (warn or fail, with the 404 as evidence); `unknown` is for a
   fetch that could not complete (timeout, refused, DNS).
2. **Pages from the run.** `pages` hold the home page and at least one other page of sqlite.org. Each page's title,
   meta description, h1 count and canonical are values a page check or fetch in the calls returned, or null.
3. **Lighthouse read, not guessed.** `lighthouse.ran` is true, the URL is sqlite.org's home page, and `performance` and
   `seo` are numbers from 0 to 100 that the run read from the Lighthouse answer or its report link (a fetch of the
   report link appears in the calls), or null with a note saying why they could not be read. `lighthouse.note` says it
   is lab data.
3b. **Links read, not guessed.** `backlinks.ran` is true for target sqlite.org, and its figures (rank, backlinks,
   referring domains, spam score, broken backlinks) are the ones the backlink summary call
   (`backlinks/summary`) returned where its result preview shows them, or null. `note` does not call
   the profile strong or weak against competitors it never saw. No fix says to buy or disavow links.
4. **Rankings.** `rankings` has one row per keyword, each with location United Kingdom, a position that is an integer
   or null, and leaders, each backed by a successful ranking call in the run's calls (a keyword whose call failed twice
   may have no row, with a gap saying so). A position is not stated without a call. Leaders are sites, never
   google.com (the results' `website_name` names the site behind a google.com/goto link).
5. **Fixes stand up.** `fixes` is non-empty and ordered by priority; every fix names its pages, gives evidence that
   matches what the calls returned, says why it matters, and cites a source id that `sources` lists. No fix rests on
   something the calls did not show.
6. **Sources.** `sources` list the fetches and the tool calls (Lighthouse, backlink summary, ranking, page checks) by URL or tool name.

Fail if any one does not hold.
