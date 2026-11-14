---
description: "Yesterday's list already had a Show HN post about building on Ledgerly's API. Today it has more points but nothing else changed; a new Trustpilot review says a bank feed has failed for three days, and a new Glassdoor review appeared, which a learned note says the owner doesn't want. The list holds only the Trustpilot review, marked worth answering; the HN post sits in dropped_repeats."
runs: 3
max_cost_usd: 1.50
input:
  company: "Ledgerly"
  website: "https://ledgerly.example"
  lookback_days: 2
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). List the new mentions of the company below with your mention-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These companies, handles and posts are test data.

--- https://ledgerly.example/ (fetched 2026-11-16) ---
<h1>Ledgerly: bookkeeping for small businesses</h1><p>Bank feeds, invoicing, AI reconciliation and payroll in one app.</p>

--- https://hn.algolia.com/api/v1/search_by_date?query=Ledgerly&tags=(story,comment)&numericFilters=created_at_i>1794643200&hitsPerPage=50 (fetched 2026-11-16) ---
{"hits":[{"objectID":"42709310","created_at":"2026-11-14T15:02:00Z","author":"ovenlight","title":"Show HN: I run my bakery's books on Ledgerly's API","url":"https://ovenlight.example/blog/ledgerly-api","points":187,"num_comments":64}],"nbHits":1}

--- https://news.ycombinator.com/item?id=42709310 (fetched 2026-11-16) ---
Show HN: I run my bakery's books on Ledgerly's API (ovenlight.example) · 187 points by ovenlight · 64 comments. Top comments discuss webhook retries and CSV export. No reply from Ledgerly staff.

--- https://www.trustpilot.com/review/ledgerly.example?sort=recency (fetched 2026-11-16) ---
Rated 1 out of 5 · "Bank feed down for three days, no answer" · Dev K. · Nov 15, 2026 · "My Wells Fargo feed hasn't synced since Thursday. Two support tickets, no reply. I have payroll on Wednesday."
Rated 5 out of 5 · "Great for freelancers" · Ana P. · Jul 21, 2026

--- https://www.glassdoor.com/Reviews/Ledgerly-Reviews-E998877.htm (fetched 2026-11-16) ---
3.0 ★ · "Fast-moving, thin support team" · Former Employee - Support Specialist · Nov 15, 2026

A web search for "Ledgerly" news in the last two days returns nothing new.

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-13T08:00:00Z","to":"2026-11-15T08:00:00Z"},"quiet":false,"mentions":[{"url":"https://news.ycombinator.com/item?id=42709310","channel":"Hacker News","source":"ovenlight","published":"2026-11-14T15:02:00Z","kind":"forum","summary":"Show HN post about running a bakery's books on Ledgerly's API; commenters ask about webhooks.","sentiment":"positive","reach":"41 points, 12 comments (read 2026-11-15)","claim":null,"worth_answering":true,"response":"Thank the author and answer the webhook retry question from the docs."}],"volume":[{"channel":"Hacker News","count":1}],"channels_checked":[],"rejected":[],"assumptions":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
