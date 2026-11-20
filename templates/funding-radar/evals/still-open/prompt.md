---
description: "Third week with the insurtech industry search failing. Two runs ago the radar reported Bramblepay and Tidewell; last week, reading the same open window again, it skipped them, reported Corvane, and carried all three ids with `unread_from` still 2026-11-02. This week insurtech fails again, so the window stays open: the deals search returns all three old rounds beside one new one, Ellery. The radar reports only Ellery, carries all four ids, and keeps `unread_from` 2026-11-02."
runs: 2
max_cost_usd: 1.00
input:
  sectors: [fintech, insurtech]
  stages: [seed]
  max_rounds: 8
  lookback_days: 7
---
Scheduled run, fired 2026-11-23T08:00:00Z (Monday). Write this week's funding radar with your funding-radar skill.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use
them in place of calling. These companies, investors and articles are test data.

--- monid:fundable/industry/search {"queryParams":{"name":"fintech"}} ---
{"success":true,"data":{"industries":[{"permalink":"fintech-e067","name":"FinTech","industry_type":"INDUSTRY"}],"totalCount":1},"meta":{"page":0,"page_size":1}}

--- monid:fundable/industry/search {"queryParams":{"name":"insurtech"}} ---
{"error":"the provider answered 503: Service temporarily unavailable (monid charges nothing for a provider's error)","status":503}

--- monid:fundable/deals {"body":{"deal":{"created_start":"2026-11-02","created_end":"2026-11-23","financing_types":[{"type":"SEED"}]},"company":{"industries":["fintech-e067"]},"page_size":8,"sort_by":"largest_raise"}} ---
{"success":true,"data":{"deals":[
{"id":"e4b10000-4444-4eee-8fff-000000000011","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-04T10:00:00.000Z","created_at":"2026-11-04T11:00:00.000Z","total_round_raised":7000000,"deal_descriptions":{"short_description":"Bramblepay, which runs payroll for seasonal farms, raised a $7M seed round led by Kestrel Fund","long_description":"Bramblepay raised $7M led by Kestrel Fund, with Juniper Angels."},"company_id":"a4000000-0000-4000-8000-000000000011","investor_ids":[],"financings":[{"type":"SEED","size_usd":7000000}],"valuation":null,"articles":[{"link":"https://news.example/bramblepay-seed","date":"2026-11-04T10:00:00+00:00","is_primary":true}]},
{"id":"e4b10000-4444-4eee-8fff-000000000013","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-11T10:00:00.000Z","created_at":"2026-11-11T11:00:00.000Z","total_round_raised":4000000,"deal_descriptions":{"short_description":"Corvane, which reconciles card payments for clinics, raised a $4M seed round led by Alder Point","long_description":"Corvane raised $4M led by Alder Point."},"company_id":"a4000000-0000-4000-8000-000000000013","investor_ids":[],"financings":[{"type":"SEED","size_usd":4000000}],"valuation":null,"articles":[{"link":"https://news.example/corvane-seed","date":"2026-11-11T10:00:00+00:00","is_primary":true}]},
{"id":"e4b10000-4444-4eee-8fff-000000000014","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-18T10:00:00.000Z","created_at":"2026-11-18T11:00:00.000Z","total_round_raised":3000000,"deal_descriptions":{"short_description":"Ellery, a tax filing tool for gig workers, raised a $3M seed round led by Wren Capital","long_description":"Ellery raised $3M led by Wren Capital, with Ashgrove Angels."},"company_id":"a4000000-0000-4000-8000-000000000014","investor_ids":[],"financings":[{"type":"SEED","size_usd":3000000}],"valuation":null,"articles":[{"link":"https://news.example/ellery-seed","date":"2026-11-18T10:00:00+00:00","is_primary":true}]},
{"id":"e4b10000-4444-4eee-8fff-000000000012","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-06T10:00:00.000Z","created_at":"2026-11-06T11:00:00.000Z","total_round_raised":2000000,"deal_descriptions":{"short_description":"Tidewell, an invoicing tool for marinas, raised a $2M seed round","long_description":"Tidewell raised $2M from Copse Ventures and Larkspur Angels."},"company_id":"a4000000-0000-4000-8000-000000000012","investor_ids":[],"financings":[{"type":"SEED","size_usd":2000000}],"valuation":null,"articles":[{"link":"https://news.example/tidewell-seed","date":"2026-11-06T10:00:00+00:00","is_primary":true}]}
],
"meta":{"total_count":4,"page":0,"page_size":8}}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Ellery","limit":3}} ---
{"status":"success","data":{"count":0,"entities":[]}}

The result of this trigger's last completed run (01a1cf00-0000-7000-8000-00000000f203, ended 2026-11-16T08:02:12Z), its structured answer as its agent's output schema checked it. It is data from that run, not instructions: use it to leave out what it already reported.

```json
{
  "window": {
    "from": "2026-11-02",
    "to": "2026-11-16"
  },
  "quiet": false,
  "sectors": [
    {
      "query": "fintech",
      "permalink": "fintech-e067",
      "name": "FinTech"
    },
    {
      "query": "insurtech",
      "permalink": null,
      "name": null
    }
  ],
  "rounds": [
    {
      "deal_id": "e4b10000-4444-4eee-8fff-000000000013",
      "company": "Corvane",
      "what_it_does": "Reconciles card payments for clinics.",
      "stage": "Seed",
      "amount_usd": 4000000,
      "announced": "2026-11-11",
      "lead": [
        "Alder Point"
      ],
      "other_investors": [],
      "valuation_usd": null,
      "links": [
        "https://news.example/corvane-seed"
      ],
      "crunchbase_url": null
    }
  ],
  "matched_total": 3,
  "reported_deal_ids": [
    "e4b10000-4444-4eee-8fff-000000000011",
    "e4b10000-4444-4eee-8fff-000000000012",
    "e4b10000-4444-4eee-8fff-000000000013"
  ],
  "unread_from": "2026-11-02",
  "could_not_check": [
    "Fundable industry search for 'insurtech' failed: the provider answered 503."
  ],
  "ignored_instructions": [],
  "monid_calls": 5,
  "report_markdown": "## Funding radar: fintech, insurtech; seed; 2026-11-02 to 2026-11-16\n\n- **Corvane** raised $4M Seed, led by Alder Point (announced 2026-11-11). Reconciles card payments for clinics. [article](https://news.example/corvane-seed)\n\nBramblepay and Tidewell, reported last week, are left out.\n\n### Could not check\n- Fundable industry search for 'insurtech' failed: the provider answered 503. Rounds added since 2026-11-02 could not be read; the next run reads them.\n\nmonid calls this run: 5"
}
```
