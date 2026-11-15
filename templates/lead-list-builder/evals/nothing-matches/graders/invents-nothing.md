---
type: llm
---
No company meets this ICP: none in Iceland has more than 5,000 employees and builds fusion-powered submarine propulsion.
A company search may return loose matches (Icelandic companies of any kind, marine or energy firms); none fits.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Says so.** `summary` says plainly that no company matching the ICP was found, against the 10 asked for, and why
   (what was searched).
2. **Nothing listed.** `accounts` is empty and `contacts` is empty. Loose matches, if any, are in `near_misses`, each
   with the criterion it failed or why it could not be checked (no website, the site did not load).
3. **Search listed.** `sources` list the company search (`monid:apollo/mixed_companies/search`) with its filters.
   Whether the run made it is checked by a separate grader.
4. **Nothing invented.** No company, person, figure, URL or fit reason appears that the run's calls did not return.
   A search result preview is cut off after its filters: a count the answer reports for a search (such as "0
   companies") is not invented unless something the calls show contradicts it.
   No "similar companies you could try" presented as matches.

Fail if any one does not hold.
