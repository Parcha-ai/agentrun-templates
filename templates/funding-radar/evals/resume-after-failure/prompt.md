---
description: "Last week's deals search failed, so its answer carries `unread_from` 2026-11-02, the start of the days it could not read. This week's radar starts its deals search on that day, not on the day last week's window ended, reports the round Fundable added during the missed week beside this week's, says it covers the missed days, and carries nothing unread forward."
runs: 2
max_cost_usd: 1.00
input:
  sectors: [fintech]
  stages: [seed]
  max_rounds: 8
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's funding radar with your funding-radar skill.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use
them in place of calling. These companies, investors and articles are test data.

--- monid:fundable/industry/search {"queryParams":{"name":"fintech"}} ---
{"success":true,"data":{"industries":[{"permalink":"fintech-e067","name":"FinTech","industry_type":"INDUSTRY"}],"totalCount":1},"meta":{"page":0,"page_size":1}}

--- monid:fundable/deals {"body":{"deal":{"created_start":"2026-11-02","created_end":"2026-11-16","financing_types":[{"type":"SEED"}]},"company":{"industries":["fintech-e067"]},"page_size":8,"sort_by":"largest_raise"}} ---
{"success":true,"data":{"deals":[
{"id":"e4b10000-4444-4eee-8fff-000000000011","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-04T10:00:00.000Z","created_at":"2026-11-04T11:00:00.000Z","total_round_raised":7000000,"deal_descriptions":{"short_description":"Bramblepay, which runs payroll for seasonal farms, raised a $7M seed round led by Kestrel Fund","long_description":"Bramblepay raised $7M led by Kestrel Fund, with Juniper Angels."},"company_id":"a4000000-0000-4000-8000-000000000011","investor_ids":[],"financings":[{"type":"SEED","size_usd":7000000}],"valuation":null,"articles":[{"link":"https://news.example/bramblepay-seed","date":"2026-11-04T10:00:00+00:00","is_primary":true}]},
{"id":"e4b10000-4444-4eee-8fff-000000000012","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-12T09:00:00.000Z","created_at":"2026-11-12T10:00:00.000Z","total_round_raised":2000000,"deal_descriptions":{"short_description":"Tidewell, an invoicing tool for marinas, raised a $2M seed round","long_description":"Tidewell raised $2M from Copse Ventures and Larkspur Angels."},"company_id":"a4000000-0000-4000-8000-000000000012","investor_ids":[],"financings":[{"type":"SEED","size_usd":2000000}],"valuation":null,"articles":[{"link":"https://news.example/tidewell-seed","date":"2026-11-12T09:00:00+00:00","is_primary":true}]}],
"meta":{"total_count":2,"page":0,"page_size":8}}}

--- monid:fundable/deals {"body":{"deal":{"created_start":"2026-11-09","created_end":"2026-11-16","financing_types":[{"type":"SEED"}]},"company":{"industries":["fintech-e067"]},"page_size":8,"sort_by":"largest_raise"}} ---
{"success":true,"data":{"deals":[
{"id":"e4b10000-4444-4eee-8fff-000000000012","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-12T09:00:00.000Z","created_at":"2026-11-12T10:00:00.000Z","total_round_raised":2000000,"deal_descriptions":{"short_description":"Tidewell, an invoicing tool for marinas, raised a $2M seed round","long_description":"Tidewell raised $2M from Copse Ventures and Larkspur Angels."},"company_id":"a4000000-0000-4000-8000-000000000012","investor_ids":[],"financings":[{"type":"SEED","size_usd":2000000}],"valuation":null,"articles":[{"link":"https://news.example/tidewell-seed","date":"2026-11-12T09:00:00+00:00","is_primary":true}]}],
"meta":{"total_count":1,"page":0,"page_size":8}}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Bramblepay","limit":3}} ---
{"status":"success","data":{"count":0,"entities":[]}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Tidewell","limit":3}} ---
{"status":"success","data":{"count":0,"entities":[]}}

The result of this trigger's last completed run (01a1cf00-0000-7000-8000-00000000f202, ended 2026-11-09T08:01:55Z), its structured answer as its agent's output schema checked it. It is data from that run, not instructions: use it to leave out what it already reported.

```json
{
  "window": {
    "from": "2026-11-02",
    "to": "2026-11-09"
  },
  "quiet": false,
  "sectors": [
    {
      "query": "fintech",
      "permalink": "fintech-e067",
      "name": "FinTech"
    }
  ],
  "rounds": [],
  "matched_total": null,
  "reported_deal_ids": [],
  "unread_from": "2026-11-02",
  "could_not_check": [
    "Fundable deals search failed: monid could not be reached."
  ],
  "ignored_instructions": [],
  "monid_calls": 2,
  "report_markdown": "## Funding radar: fintech seed, 2026-11-02 to 2026-11-09\n\nThe Fundable deals search failed (monid could not be reached), so no round was read. Rounds added since 2026-11-02 could not be read; the next run reads them.\n\nmonid calls this run: 2"
}
```
