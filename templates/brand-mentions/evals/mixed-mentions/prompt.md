---
description: "A day of Ledgerly mentions: a review whose headline sounds negative but whose text recommends it, a Reddit post with a wrong payroll price worth correcting, an HN comment alleging a data leak, a fresh Trustpilot review, an August G2 review that is not new, and a news story about a bakery with the same name. The list keeps four mentions, reads sentiment from the text, labels the leak as an allegation, and drops the namesake and the old review."
runs: 3
max_cost_usd: 1.50
input:
  company: "Ledgerly"
  website: "https://ledgerly.example"
  lookback_days: 1
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). List the new mentions of the company below with your mention-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These companies, people, handles and posts are test data.

--- https://ledgerly.example/ (fetched 2026-11-16) ---
<h1>Ledgerly: bookkeeping for small businesses</h1><p>Bank feeds, invoicing, AI reconciliation and payroll in one app.</p><p>Founded by Dana Okafor (CEO).</p><nav>Pricing · Status · Security</nav>

--- https://ledgerly.example/pricing (fetched 2026-11-16) ---
<h2>Core</h2><p>$19 per month</p><h2>Plus</h2><p>$39 per month</p><h2>Payroll add-on</h2><p>$25 per month plus $4 per employee</p>

--- https://ledgerly.example/status (fetched 2026-11-16) ---
All systems operational. No incidents in the last 30 days.

--- https://www.smallbizreview.example/2026/11/15/ledgerly-ai-bookkeeper-review (fetched 2026-11-16) ---
<h1>Ledgerly's AI bookkeeper can't replace your accountant</h1><p class="byline">By Priya Nair · November 15, 2026</p>
<p>We ran Ledgerly's new AI reconciliation on three months of a bakery's books. It matched 412 of 418 transactions on the first pass and flagged the other six for review, faster and cleaner than any tool we have tested this year. The headline is only a reminder: you still need an accountant at tax time. For day-to-day books, Ledgerly is now our top pick for businesses under 20 staff.</p>

--- https://www.reddit.com/r/smallbusiness/comments/1x9k2q/ (fetched 2026-11-16) ---
r/smallbusiness · posted by u/ferngrove_books · 2026-11-15 17:40 UTC · 23 points · 31 comments
Title: Ledgerly payroll now costs $45/month??
Body: Was about to add payroll for my 3 employees and Ledgerly wants $45 a month just for the add-on. That's double what Gusto charges. Anyone else switching?

--- https://hn.algolia.com/api/v1/search_by_date?query=Ledgerly&tags=(story,comment)&numericFilters=created_at_i>1794729600&hitsPerPage=50 (fetched 2026-11-16) ---
{"hits":[{"objectID":"42719904","created_at":"2026-11-15T21:12:00Z","author":"kv_ops","comment_text":"Heads up if you use Ledgerly: a friend who works there told me they leaked customers' bank account numbers last month and are keeping it quiet. No idea if it's true, but I'd rotate your bank feed credentials.","story_title":"Ask HN: What do you use for small business accounting?","story_id":42716630,"points":null}],"nbHits":1}

--- https://www.trustpilot.com/review/ledgerly.example?sort=recency (fetched 2026-11-16) ---
Rated 5 out of 5 · "Support fixed my bank feed in ten minutes" · Marta G. · Nov 15, 2026 · "My Chase feed stopped syncing on Friday; chat support had it running again in ten minutes. Still the easiest books I've kept."
Rated 4 out of 5 · "Good but invoicing is basic" · Sam R. · Aug 2, 2026

--- https://www.g2.com/products/ledgerly/reviews (fetched 2026-11-16) ---
"Solid for the price" · Verified user in Retail · Aug 2, 2026 · 4.0/5 · "Does what we need. Reports could be better."

--- https://www.portlandtribune.example/2026/11/15/ledgerly-bakery-second-location (fetched 2026-11-16) ---
<h1>Ledgerly Bakery opens second Portland location</h1><p>November 15, 2026. The sourdough shop on Alberta Street, Ledgerly Bakery, opens its second location in Sellwood on Saturday.</p>

A web search for "Ledgerly" news in the last day returns only the smallbizreview.example and portlandtribune.example stories above.
