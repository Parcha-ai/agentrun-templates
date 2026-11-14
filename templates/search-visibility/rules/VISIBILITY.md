# Visibility rules

## What a result is

- A position is a place in a result list you read in this run, in the order the list gave. Never a place you estimate.
- The same domain at two places counts once, at the better place.
- Sponsored results do not count as positions. A featured snippet or other SERP feature is listed in `features`,
  and is a position only when the list also ranks the page.
- Engines differ and personalisation is off: rows from different engines are never merged or averaged.

## What never goes in

- A position, URL, snippet, domain or feature you did not see in this run's results.
- A ranking from memory, from the owner's page, or from a ranking tool's marketing page.
- An AI answer engine's output you did not read yourself. `unchecked` is the answer.
- Personal data: no emails, phone numbers or names of people from a result.

## Limits

- 25 queries a run, 10 results per read, 5 competitor rows per query, 5 next actions.
- A single absence is tentative. Say so in the row's note in `report_markdown`; do not re-search to settle it.
