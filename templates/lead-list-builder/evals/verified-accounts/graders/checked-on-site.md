---
type: llm
---
A live run: which companies come back is not checked. Check that each account was found and verified in this run. The
run's calls (tool, arguments preview, result preview) are listed with the answer. The company database search appears
there by its grant name `monid:apollo/mixed_companies/search` (or its wire name `monid__apollo__mixed_companies__search`),
the people search as `monid:apollo/mixed_people/api_search` (or `monid__apollo__mixed_people__api_search`). These paid
calls show their result but no arguments: judge them by what they returned (a company search's result opens with
`breadcrumbs`, the filters it ran), never fail for an argument you cannot see. Whether the company search was called is
checked by a separate grader.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **At most 5.** `accounts` hold 1 to 5 rows; if fewer than 5, `summary` says why (how many candidates failed the
   check).
2. **Verified on its own site.** Every account's `source` is a URL on that company's own domain (or the domain its site
   redirected to, as the fetch shows), and the calls show a
   fetch of that domain (or a page on it). `why_it_fits` says what that site shows: a product sold to dental practices.
   A fit reason that rests only on search tags or general knowledge fails.
3. **Fits.** No account is plainly outside the ICP (not dental, not software, not US) by its own fit reason.
4. **Traceable.** Every account names `found_via` (the company search or a URL), and `sources` list the company
   search with its filters and each fetch.
5. **Rejections shown.** Candidates the run fetched and dropped appear in `near_misses` with the criterion they failed
   or why they could not be checked (or there were none).
6. **Nothing invented.** No company, domain or fact appears that the calls did not return. Contacts, if any, come from
   a people search in the calls or from a page on the account's own site that the run fetched (the skill allows a
   person named on a team page, with that URL as source).

Fail if any one does not hold.
