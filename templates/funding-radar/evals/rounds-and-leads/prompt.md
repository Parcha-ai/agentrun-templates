---
description: "First week of a fintech radar for seed and Series A. Fundable returns four rounds: a Series A with a named lead, a co-led Series A extension, a seed whose description names investors but no lead, and an undisclosed seed. The radar reports each from its own fields: amounts (null when undisclosed), the leads the descriptions name and no invented one, what each company does, the article links, and Crunchbase links only where the name matched exactly."
runs: 2
max_cost_usd: 1.00
input:
  sectors: [fintech]
  stages: [seed, series_a]
  max_rounds: 8
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's funding radar with your funding-radar skill.
There is no previous run.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These companies, investors and articles are test data.

--- monid:fundable/industry/search {"queryParams":{"name":"fintech"}} ---
{"success":true,"data":{"industries":[{"permalink":"fintech-e067","name":"FinTech","industry_type":"INDUSTRY"}],"totalCount":1},"meta":{"page":0,"page_size":1}}

--- monid:fundable/deals {"body":{"deal":{"created_start":"2026-11-09","created_end":"2026-11-16","financing_types":[{"type":"SEED"},{"type":"SERIES_A"}]},"company":{"industries":["fintech-e067"]},"page_size":8,"sort_by":"largest_raise"}} ---
{"success":true,"data":{"deals":[
{"id":"5b1e2c3d-0a11-4b22-8c33-0d44e55f6601","round_type":"SERIES_A","extension":false,"pre":false,"date":"2026-11-12T14:00:00.000Z","created_at":"2026-11-12T15:10:00.000Z","total_round_raised":12000000,"deal_descriptions":{"short_description":"Ledgerline, which automates month-end reconciliation for mid-size finance teams, raised a $12M Series A led by Northfield Ventures with participation from Quarry Capital and Sela Partners","long_description":"Ledgerline raised $12M in a Series A led by Northfield Ventures. Quarry Capital and Sela Partners also took part. The company will hire engineers in Lisbon."},"company_id":"a1000000-0000-4000-8000-000000000001","investor_ids":["b1000000-0000-4000-8000-000000000001","b1000000-0000-4000-8000-000000000002","b1000000-0000-4000-8000-000000000003"],"financings":[{"type":"SERIES_A","size_usd":12000000}],"valuation":{"valuation_usd":60000000},"articles":[{"link":"https://news.example/ledgerline-series-a","date":"2026-11-12T14:00:00+00:00","is_primary":true},{"link":"https://wire.example/2026/11/12/ledgerline","date":"2026-11-12T16:00:00+00:00","is_primary":false}]},
{"id":"5b1e2c3d-0a11-4b22-8c33-0d44e55f6602","round_type":"SERIES_A","extension":true,"pre":false,"date":"2026-11-10T09:00:00.000Z","created_at":"2026-11-11T08:00:00.000Z","total_round_raised":6000000,"deal_descriptions":{"short_description":"Fernbank, a savings app for gig workers that sets aside tax from each payout, raised a $6M Series A extension co-led by Maple Growth and Ridge Partners","long_description":"Fernbank's $6M Series A extension was co-led by Maple Growth and Ridge Partners. Existing investor Olive Seed Fund joined."},"company_id":"a1000000-0000-4000-8000-000000000002","investor_ids":["b1000000-0000-4000-8000-000000000004","b1000000-0000-4000-8000-000000000005","b1000000-0000-4000-8000-000000000006"],"financings":[{"type":"SERIES_A","size_usd":6000000}],"valuation":null,"articles":[{"link":"https://startups.example/fernbank-raises-6m","date":"2026-11-10T09:00:00+00:00","is_primary":true}]},
{"id":"5b1e2c3d-0a11-4b22-8c33-0d44e55f6603","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-13T11:00:00.000Z","created_at":"2026-11-13T12:30:00.000Z","total_round_raised":3500000,"deal_descriptions":{"short_description":"Tallypay, which lets small shops accept instant bank payments at the counter, raised a $3.5M seed round with participation from Alder Fund, Brook Angels and Cove Ventures","long_description":"Tallypay raised $3.5M in seed funding. Alder Fund, Brook Angels and Cove Ventures took part. The article does not say who led."},"company_id":"a1000000-0000-4000-8000-000000000003","investor_ids":["b1000000-0000-4000-8000-000000000007","b1000000-0000-4000-8000-000000000008","b1000000-0000-4000-8000-000000000009"],"financings":[{"type":"SEED","size_usd":3500000}],"valuation":null,"articles":[{"link":"https://news.example/tallypay-seed","date":"2026-11-13T11:00:00+00:00","is_primary":true}]},
{"id":"5b1e2c3d-0a11-4b22-8c33-0d44e55f6604","round_type":"SEED","extension":false,"pre":false,"date":"2026-11-14T10:00:00.000Z","created_at":"2026-11-14T10:40:00.000Z","total_round_raised":0,"deal_descriptions":{"short_description":"Coinwell, a treasury tool for crypto-native companies, raised an undisclosed seed round from Pine Street Partners","long_description":"Coinwell raised a seed round from Pine Street Partners. The amount was not disclosed."},"company_id":"a1000000-0000-4000-8000-000000000004","investor_ids":["b1000000-0000-4000-8000-000000000010"],"financings":[{"type":"SEED","size_usd":0}],"valuation":null,"articles":[{"link":"https://blog.example/coinwell-seed","date":"2026-11-14T10:00:00+00:00","is_primary":true}]}],
"meta":{"total_count":4,"page":0,"page_size":8}}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Ledgerline","limit":3}} ---
{"status":"success","data":{"count":1,"entities":[{"uuid":"c1000000-0000-4000-8000-000000000001","properties":{"identifier":{"permalink":"ledgerline","value":"Ledgerline"},"short_description":"Ledgerline builds reconciliation software for finance teams at mid-size companies.","location_identifiers":[{"value":"Lisbon"}]}}]}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Fernbank","limit":3}} ---
{"status":"success","data":{"count":1,"entities":[{"uuid":"c1000000-0000-4000-8000-000000000002","properties":{"identifier":{"permalink":"fernbank-app","value":"Fernbank"},"short_description":"Fernbank is a savings and tax app for gig workers.","location_identifiers":[{"value":"Austin"}]}}]}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Tallypay","limit":3}} ---
{"status":"success","data":{"count":1,"entities":[{"uuid":"c1000000-0000-4000-8000-000000000003","properties":{"identifier":{"permalink":"tallypay-labs","value":"TallyPay Labs"},"short_description":"TallyPay Labs makes payroll software for restaurants.","location_identifiers":[{"value":"Leeds"}]}}]}}
