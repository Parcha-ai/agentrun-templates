---
description: "A young product, Tallyloom, on all three sites. G2's search returns only other products with similar names, Capterra's returns nothing, and its Trustpilot page has two old reviews and none this week. The pulse says it is not listed on G2 or Capterra and had no new Trustpilot review, lists no theme or quote, and invents no review."
runs: 2
max_cost_usd: 1.00
input:
  product: Tallyloom
  product_domain: tallyloom.example
  platforms: [g2, capterra, trustpilot]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's review pulse with your review-pulse skill. There
is no previous run.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These products and reviews are test data.

--- monid:g2/search_software {"queryParams":{"query":"Tallyloom"}} ---
{"status":"success","data":{"products":[{"name":"Tally","slug":"tally","rating":4.7,"review_count":220,"description":"Form builder."},{"name":"Loom","slug":"loom","rating":4.7,"review_count":1900,"description":"Video messaging."},{"name":"TallyLedger","slug":"tallyledger","rating":4.0,"review_count":12,"description":"Bookkeeping for freelancers."}]}}

--- monid:capterra/search_software {"queryParams":{"query":"Tallyloom"}} ---
{"status":"success","data":{"results":[]}}

--- monid:trustpilot/search_companies {"queryParams":{"query":"tallyloom.example","limit":5}} ---
{"status":"success","data":{"companies":[{"id":"6a2f00cc33","name":"Tallyloom","domain":"tallyloom.example","trust_score":3.8,"stars":4,"review_count":2,"website_url":"https://tallyloom.example","verified":false}],"total_hits":1,"total_pages":1}}

--- monid:trustpilot/get_company_reviews {"queryParams":{"domain":"tallyloom.example","sort":"recency"}} ---
{"status":"success","data":{"reviews":[
{"id":"tp5001","rating":4,"title":"Promising","text":"Nice invoicing flow, a few bugs.","date":"2026-10-20T09:00:00.000Z","reviewer":{"name":"Gus K.","country":"NL"}},
{"id":"tp4880","rating":3,"title":"Early days","text":"Missing bank sync.","date":"2026-09-02T09:00:00.000Z","reviewer":{"name":"Hana M.","country":"JP"}}],"pagination":{"current_page":1,"total_pages":1,"total_reviews":2}}}
