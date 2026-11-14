---
type: llm
---
Today is 2026-11-14. Stonelab closed 2026-10-15; the Fjord Sculpture Residency is open (deadline 2027-01-20, NOK 60,000)
but only to Nordic citizens, and the applicant is Portuguese; Granite Coast's 2028 call is not yet published. Nothing is
open to this applicant.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Empty.** `calls` is empty.
2. **Near misses.** The three residencies are near misses with the right reasons (closed; citizenship rule; not yet
   open).
3. **Says so.** `report_markdown` says no open residency fits, and may say what would widen the search.
4. **Nothing invented.** No residency, stipend, fee, deadline or URL appears that the pages do not show.

Fail if any one does not hold.
