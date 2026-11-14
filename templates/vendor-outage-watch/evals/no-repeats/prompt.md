---
description: "Last week's brief reported an AWS us-east-1 DynamoDB incident and a GitHub Pages incident. This week AWS published the post-event summary (a development), the Pages incident is unchanged, and Azure had an East US incident that a learned note puts out of scope. The brief holds only the AWS postmortem."
runs: 3
max_cost_usd: 1.50
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's outage brief for the vendors below with your outage-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These incidents are test data.

--- https://aws.amazon.com/premiumsupport/technology/pes/ (fetched 2026-11-16) ---
Summary of the Amazon DynamoDB Service Disruption in the Northern Virginia (US-EAST-1) Region · published November 12, 2026 · https://aws.amazon.com/message/2026-11-dynamodb-use1/
Between 13:20 and 15:05 UTC on November 7, DynamoDB API error rates in us-east-1 reached 22%. An automated capacity change removed healthy storage nodes from a partition map faster than replacements joined. AWS has paused that automation and added a rate limit to node removal.

--- https://health.aws.amazon.com/health/status (fetched 2026-11-16) ---
No events for N. Virginia (us-east-1) in the last 7 days.

--- https://azure.status.microsoft/en-us/status/history/ (fetched 2026-11-16) ---
13/11/2026 · Virtual Machines - East US - Connectivity issues · 09:40 to 11:10 UTC · Mitigated. Preliminary root cause: a network device failure in one datacenter. Tracking ID: VM7K-3PZ.
No events for West Europe.

--- https://www.githubstatus.com/api/v2/incidents.json (fetched 2026-11-16) ---
{"incidents":[{"id":"p5r1","name":"GitHub Pages builds failing","status":"resolved","impact":"major","created_at":"2026-11-09T22:00:00Z","resolved_at":"2026-11-09T23:35:00Z","components":[{"name":"Pages"}],"incident_updates":[{"body":"Pages builds are succeeding again. Resolved.","created_at":"2026-11-09T23:35:00Z"}]}]}

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"quiet":false,"incidents":[{"vendor":"AWS us-east-1","service":"Amazon DynamoDB","regions":["us-east-1"],"kind":"incident","title":"DynamoDB elevated API error rates in N. Virginia","status":"resolved","started_at":"2026-11-07T13:20:00Z","resolved_at":"2026-11-07T15:05:00Z","duration_minutes":105,"time_source":"status_page","impact":"Elevated DynamoDB API errors in us-east-1","root_cause":null,"root_cause_status":"not_published","so_what":"Check retries and backoff on DynamoDB clients in us-east-1.","date":"2026-11-07","source_urls":["https://health.aws.amazon.com/health/status"]},{"vendor":"GitHub","service":"Pages","regions":[],"kind":"incident","title":"GitHub Pages builds failing for 95 minutes","status":"resolved","started_at":"2026-11-09T22:00:00Z","resolved_at":"2026-11-09T23:35:00Z","duration_minutes":95,"time_source":"status_page","impact":"Pages builds failed","root_cause":null,"root_cause_status":"not_published","so_what":"Re-run any Pages deploys from that evening.","date":"2026-11-09","source_urls":["https://www.githubstatus.com/incidents/p5r1"]}],"vendors_checked":[],"assumptions":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
