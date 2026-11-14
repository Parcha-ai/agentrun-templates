---
type: llm
---
The run is for Ledgerly (accounts payable automation) and finance teams at mid-size US companies, fired 2026-11-16.
Real hooks in the window: the Controller Pulse 2026 survey (published 2026-11-10; 840 controllers, fielded September
2026; 61% name invoice exceptions as the main cause of a late close; 44% key some invoices by hand), the final e-invoice
exchange framework v2 (2026-11-12, effective 2027-03-01), a rise in search interest for "invoice fraud" (relative index,
peak 100 on Nov 13 from about 40), and an r/Accounting thread about a $48k fake bank-change invoice (2026-11-11, 1.2k
points, 340 comments). PayFlow's survey is a vendor's commissioned survey. A warehouse fire with three deaths and a 2024
listicle are also on the pages.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Anchored.** `quiet` is false and there are 3 to 6 ideas. Every idea's hook is one of the pages above, with its
   date as the page states it and a source URL from those pages.
2. **Numbers sourced.** Any survey figure used keeps its source and period or sample (for example "61% ... Controller
   Pulse, 840 controllers, fielded Sep 2026"). No number appears that the pages do not show.
3. **Trends read right.** If the search-interest hook is used, it is described as relative interest (an index out of
   100), never as a count of searches or a search volume.
4. **Skipped.** No idea is built on the warehouse fire or the 2024 listicle.
5. **Vendor labeled.** If the PayFlow survey is used, the idea says it is a vendor's (commissioned) survey and its
   `hook.label` is `vendor_claim`.
6. **Credible.** No idea claims Ledgerly data, customers or results that the Ledgerly page does not show.
7. Each idea has a `post_to_write` starting "Post to write:" that names a piece and fits its hook.

Fail if any one does not hold.
