---
description: "Second week of a fintech seed radar. Last week's answer carries its window and the ids it reported. This week's deals search, which starts on the day last week's ended, returns one of last week's rounds again beside two new ones. The radar reports only the two new rounds and carries their ids forward."
runs: 2
max_cost_usd: 1.00
input:
  sectors: [fintech]
  stages: [seed]
  max_rounds: 8
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's funding radar with your funding-radar skill.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These companies, investors and articles are test data.

--- monid:fundable/industry/search {"queryParams":{"name":"fintech"}} ---
{"success":true,"data":{"industries":[{"permalink":"fintech-e067","name":"FinTech","industry_type":"INDUSTRY"}],"totalCount":1},"meta":{"page":0,"page_size":1}}

--- monid:fundable/deals {"body":{"deal":{"created_start":"2026-11-09","created_end":"2026-11-16","financing_types":[{"type":"SEED"}]},"company":{"industries":["fintech-e067"]},"page_size":8,"sort_by":"largest_raise"}} ---
{"success":true,"data":{"deals":[
{"id":"e4b10000-3333-4eee-8fff-000000000003","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-08T15:00:00.000Z","created_at":"2026-11-09T07:20:00.000Z","total_round_raised":9000000,"deal_descriptions":{"short_description":"Quayfund, a cash management tool for importers, raised a $9M seed round led by Harbor Light Capital","long_description":"Quayfund raised $9M led by Harbor Light Capital."},"company_id":"a4000000-0000-4000-8000-000000000003","investor_ids":[],"financings":[{"type":"SEED","size_usd":9000000}],"valuation":null,"articles":[{"link":"https://news.example/quayfund-seed","date":"2026-11-08T15:00:00+00:00","is_primary":true}]},
{"id":"e4b10000-3333-4eee-8fff-000000000004","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-12T12:00:00.000Z","created_at":"2026-11-12T13:00:00.000Z","total_round_raised":5000000,"deal_descriptions":{"short_description":"Mintlark, which handles sales tax filing for online sellers, raised a $5M seed round led by Wren Partners","long_description":"Mintlark raised $5M led by Wren Partners, with Fable Angels."},"company_id":"a4000000-0000-4000-8000-000000000004","investor_ids":[],"financings":[{"type":"SEED","size_usd":5000000}],"valuation":null,"articles":[{"link":"https://news.example/mintlark-seed","date":"2026-11-12T12:00:00+00:00","is_primary":true}]},
{"id":"e4b10000-3333-4eee-8fff-000000000005","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-14T09:00:00.000Z","created_at":"2026-11-14T09:30:00.000Z","total_round_raised":1500000,"deal_descriptions":{"short_description":"Ochre Pay, a payments app for tradespeople, raised a $1.5M seed round led by Saffron Seed","long_description":"Ochre Pay raised $1.5M led by Saffron Seed."},"company_id":"a4000000-0000-4000-8000-000000000005","investor_ids":[],"financings":[{"type":"SEED","size_usd":1500000}],"valuation":null,"articles":[{"link":"https://news.example/ochre-pay-seed","date":"2026-11-14T09:00:00+00:00","is_primary":true}]}],
"meta":{"total_count":3,"page":0,"page_size":8}}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Mintlark","limit":3}} ---
{"status":"success","data":{"count":0,"entities":[]}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Ochre Pay","limit":3}} ---
{"status":"success","data":{"count":0,"entities":[]}}

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"quiet":false,"sectors":[{"query":"fintech","permalink":"fintech-e067","name":"FinTech"}],"rounds":[{"deal_id":"e4b10000-3333-4eee-8fff-000000000003","company":"Quayfund","what_it_does":"Cash management for importers.","stage":"Seed","amount_usd":9000000,"announced":"2026-11-08","lead":["Harbor Light Capital"],"other_investors":[],"valuation_usd":null,"links":["https://news.example/quayfund-seed"],"crunchbase_url":null},{"deal_id":"e4b10000-3333-4eee-8fff-000000000002","company":"Ferrule","what_it_does":"Expense cards for field teams.","stage":"Seed","amount_usd":3000000,"announced":"2026-11-05","lead":[],"other_investors":["Tern Angels"],"valuation_usd":null,"links":["https://news.example/ferrule-seed"],"crunchbase_url":null}],"matched_total":2,"reported_deal_ids":["e4b10000-3333-4eee-8fff-000000000003","e4b10000-3333-4eee-8fff-000000000002"],"could_not_check":[],"ignored_instructions":[],"monid_calls":4,"report_markdown":"## Funding radar: fintech seed, 2026-11-02 to 2026-11-09\n\n- **Quayfund** raised $9M Seed, led by Harbor Light Capital."}
```
