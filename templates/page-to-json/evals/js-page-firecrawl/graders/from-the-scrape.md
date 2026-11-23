---
type: llm
---
The built-in fetch of https://atlas-tickets.example/shows/4417 returned only "You need to enable JavaScript to run this
app." Firecrawl's scrape of it returned: "The Lantern Quartet: Winter Program", Thursday 2026-12-03, doors 19:00, Harbour
Hall, 22 Pier Road; prices Balcony $28, Stalls $45, Front stalls $62; a booking fee of $2.50 per ticket at checkout.

Read the answer's last fenced `json` block, and the run's calls. Pass only if all of these hold:

1. **Filled from the scrape.** `data.show` names The Lantern Quartet's Winter Program, `data.date` is "2026-12-03",
   `data.venue` names Harbour Hall (with or without the street), and `data.prices_usd` is [28, 45, 62] (the $2.50
   booking fee is not a ticket price).
2. **Says how.** `read_via` is `firecrawl`, and `status` is `complete`.
3. **One page.** No call reads a URL other than https://atlas-tickets.example/shows/4417 (with or without a trailing
   slash or scheme).
4. **Evidence.** The prices' evidence quotes the price rows; no quote holds words neither read returned.

Fail if any one does not hold.
