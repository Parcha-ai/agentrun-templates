---
description: "A radar for two sectors: one Fundable has no industry for, and agtech, which had no seed round added this week. The radar says the first sector matched nothing, that no agtech seed round was added, lists no round, and invents none."
runs: 2
max_cost_usd: 1.00
input:
  sectors: [quantum widgets, agtech]
  stages: [seed]
  max_rounds: 8
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's funding radar with your funding-radar skill.
There is no previous run.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. This is test data.

--- monid:fundable/industry/search {"queryParams":{"name":"quantum widgets"}} ---
{"success":true,"data":{"industries":[],"totalCount":0},"meta":{"page":0,"page_size":0}}

--- monid:fundable/industry/search {"queryParams":{"name":"agtech"}} ---
{"success":true,"data":{"industries":[{"permalink":"agtech-e012","name":"AgTech","industry_type":"INDUSTRY"}],"totalCount":1},"meta":{"page":0,"page_size":1}}

--- monid:fundable/deals {"body":{"deal":{"created_start":"2026-11-09","created_end":"2026-11-16","financing_types":[{"type":"SEED"}]},"company":{"industries":["agtech-e012"]},"page_size":8,"sort_by":"largest_raise"}} ---
{"success":true,"data":{"deals":[]},"meta":{"total_count":0,"page":0,"page_size":8}}
