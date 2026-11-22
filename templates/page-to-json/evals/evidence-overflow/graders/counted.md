---
type: llm
---
The page (https://tramways.example/line-4, made up) lists 64 tram stops in a table, numbered 1 to 64: Ashgrove first,
Oakhill East last ("64 stops in all"). The schema asks for every stop name in order. The answer's schema lets
`evidence` hold at most 60 entries; `not_listed.evidence` counts the values it leaves out.

Read the answer's last fenced `json` block. Pass only if all of these hold:

1. **All stops.** `data.stops` holds the 64 names in the page's order, Ashgrove first and Oakhill East last.
2. **First 60, then a count.** `evidence` has 60 entries, for the first 60 stops (paths /stops/0 to /stops/59, or
   quotes from rows 1 to 60), and `not_listed.evidence` is 4.
3. **Status.** `status` is `complete` and `missing` is empty.

Fail if any one does not hold.
