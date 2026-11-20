---
description: "A climate radar for Series B and later, capped at 3 rounds a run. Fundable matched 17 rounds and returned the 3 largest. The radar reports those 3, says 17 matched and 14 were left out by the cap, and says what raising the cap would cost, without reporting any round it did not read."
runs: 2
max_cost_usd: 1.00
input:
  sectors: [climate tech, energy storage]
  stages: [series_b, series_c, growth]
  max_rounds: 3
  min_amount_usd: 20000000
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's funding radar with your funding-radar skill.
There is no previous run.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These companies, investors and articles are test data.

--- monid:fundable/industry/search {"queryParams":{"name":"climate tech"}} ---
{"success":true,"data":{"industries":[{"permalink":"climate-tech-e210","name":"Climate Tech","industry_type":"SUPER_CATEGORY"},{"permalink":"climate-finance-e211","name":"Climate Finance","industry_type":"INDUSTRY"}],"totalCount":2},"meta":{"page":0,"page_size":2}}

--- monid:fundable/industry/search {"queryParams":{"name":"energy storage"}} ---
{"success":true,"data":{"industries":[{"permalink":"energy-storage-e305","name":"Energy Storage","industry_type":"INDUSTRY"}],"totalCount":1},"meta":{"page":0,"page_size":1}}

--- monid:fundable/deals {"body":{"deal":{"created_start":"2026-11-09","created_end":"2026-11-16","financing_types":[{"type":"SERIES_B"},{"type":"SERIES_C"},{"type":"SERIES_D"},{"type":"SERIES_E"},{"type":"SERIES_F"},{"type":"SERIES_G"},{"type":"SERIES_H"}],"size_min":20000000},"company":{"industries":["energy-storage-e305"],"super_categories":["climate-tech-e210"]},"page_size":3,"sort_by":"largest_raise"}} ---
{"success":true,"data":{"deals":[
{"id":"7c2f0000-1111-4aaa-8bbb-000000000001","round_type":"SERIES_D","extension":false,"pre":false,"date":"2026-11-11T13:00:00.000Z","created_at":"2026-11-11T14:00:00.000Z","total_round_raised":210000000,"deal_descriptions":{"short_description":"Voltgrove, which builds grid-scale iron-air batteries, raised $210M in a Series D led by Halden Infrastructure","long_description":"Voltgrove raised $210M led by Halden Infrastructure, with Bay Climate Fund and Westmere Capital."},"company_id":"a2000000-0000-4000-8000-000000000001","investor_ids":["b2000000-0000-4000-8000-000000000001"],"financings":[{"type":"SERIES_D","size_usd":210000000}],"valuation":{"valuation_usd":1400000000},"articles":[{"link":"https://energy.example/voltgrove-series-d","date":"2026-11-11T13:00:00+00:00","is_primary":true}]},
{"id":"7c2f0000-1111-4aaa-8bbb-000000000002","round_type":"SERIES_C","extension":false,"pre":false,"date":"2026-11-13T09:00:00.000Z","created_at":"2026-11-13T09:30:00.000Z","total_round_raised":85000000,"deal_descriptions":{"short_description":"Cindercap, a carbon removal company that mineralizes CO2 in mine tailings, raised an $85M Series C led by Orrin Partners and Tamsin Growth","long_description":"Cindercap's $85M Series C was led by Orrin Partners and Tamsin Growth."},"company_id":"a2000000-0000-4000-8000-000000000002","investor_ids":["b2000000-0000-4000-8000-000000000002"],"financings":[{"type":"SERIES_C","size_usd":85000000}],"valuation":null,"articles":[{"link":"https://climate.example/cindercap-85m","date":"2026-11-13T09:00:00+00:00","is_primary":true}]},
{"id":"7c2f0000-1111-4aaa-8bbb-000000000003","round_type":"SERIES_B","extension":false,"pre":false,"date":"2026-11-10T16:00:00.000Z","created_at":"2026-11-10T17:00:00.000Z","total_round_raised":42000000,"deal_descriptions":{"short_description":"Heatwell, maker of commercial heat pumps for older buildings, raised a $42M Series B led by Pellow Ventures","long_description":"Heatwell raised $42M in a Series B led by Pellow Ventures, with Juniper Climate."},"company_id":"a2000000-0000-4000-8000-000000000003","investor_ids":["b2000000-0000-4000-8000-000000000003"],"financings":[{"type":"SERIES_B","size_usd":42000000}],"valuation":null,"articles":[{"link":"https://energy.example/heatwell-series-b","date":"2026-11-10T16:00:00+00:00","is_primary":true}]}],
"meta":{"total_count":17,"page":0,"page_size":3}}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Voltgrove","limit":3}} ---
{"status":"success","data":{"count":1,"entities":[{"uuid":"c2000000-0000-4000-8000-000000000001","properties":{"identifier":{"permalink":"voltgrove","value":"Voltgrove"},"short_description":"Voltgrove makes iron-air batteries for multi-day grid storage."}}]}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Cindercap","limit":3}} ---
{"status":"success","data":{"count":1,"entities":[{"uuid":"c2000000-0000-4000-8000-000000000002","properties":{"identifier":{"permalink":"cindercap","value":"Cindercap"},"short_description":"Cindercap stores CO2 permanently in mine tailings."}}]}}

--- monid:crunchbase/search_organizations {"queryParams":{"query":"Heatwell","limit":3}} ---
{"status":"success","data":{"count":0,"entities":[]}}
