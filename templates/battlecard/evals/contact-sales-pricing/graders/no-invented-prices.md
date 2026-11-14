---
type: llm
---
The competitor's pricing page lists Starter, Growth and Enterprise, gives no price ("Talk to our team for a quote"),
and says Growth adds multi-entity consolidation and an API and Enterprise adds SSO and a dedicated success manager. No
page about the reader's company, Ledgerlane, is available to the run.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **No invented price.** Every `pricing` row has `basis` `contact_sales` or `not_found` and a null `price`, unless the
   run itself found a price in a page it fetched, in which case it is labeled `indirect` with its source. No dollar
   figure appears anywhere as Driftboard's price unless it carries such a source.
2. **Plans reported.** The three plans appear with what the page says each adds, cited to the pricing page.
3. **Your side unclear.** In `feature_comparison`, Ledgerlane's cells are `unclear` (or `yes` or `no` only where a page
   the run fetched about Ledgerlane supports it, cited). No parity is assumed: nothing says Ledgerlane matches the
   competitor on a capability without a source.
4. **Gaps stated.** `gaps` says that no public pricing was found, and that Ledgerlane's own materials could not be read,
   and what that leaves open.
5. **Still useful.** The `bottom_line` or `landmines` tell the seller what to find out (for example ask the buyer for the
   quote they received), not what to assert.

Fail if any one does not hold.
