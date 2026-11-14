---
description: "Neither Twilio nor Datadog had an incident in the window; their last incidents are weeks old. The brief is one quiet line with the vendors checked, and invents nothing."
runs: 3
max_cost_usd: 1.50
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's outage brief for the vendors below with your outage-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These incidents are test data.

--- https://status.twilio.com/api/v2/incidents.json (fetched 2026-11-16) ---
{"incidents":[{"id":"t1","name":"SMS delivery delays to Carrier X in Brazil","status":"resolved","impact":"minor","created_at":"2026-10-19T08:00:00Z","resolved_at":"2026-10-19T11:30:00Z"}]}

--- https://status.datadoghq.com/api/v2/incidents.json (fetched 2026-11-16) ---
{"incidents":[{"id":"d1","name":"Delayed log ingestion in US1","status":"resolved","impact":"minor","created_at":"2026-10-28T13:00:00Z","resolved_at":"2026-10-28T13:50:00Z"}]}

A web search for outages at either vendor this week returns nothing new.

Input:
```json
{
  "vendors": [
    "Twilio",
    "Datadog"
  ],
  "lookback_days": 7
}
```
