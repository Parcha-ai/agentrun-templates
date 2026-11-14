---
description: "GitHub's history holds a two-hour Actions incident, a Codespaces incident, a seven-minute Actions blip and completed maintenance; Cloudflare published a postmortem for an October outage; AWS had an incident in eu-west-1 only. The brief keeps the Actions incident with its status-page times and the Cloudflare postmortem, and drops the rest as out of scope or noise."
runs: 3
max_cost_usd: 1.50
input:
  vendors: ["GitHub Actions", "Cloudflare", "AWS us-east-1"]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's outage brief for the vendors below with your outage-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These incidents are test data.

--- https://www.githubstatus.com/api/v2/incidents.json (fetched 2026-11-16) ---
{"incidents":[{"id":"k9x2","name":"Scheduled maintenance: Actions database","status":"completed","impact":"maintenance","created_at":"2026-11-15T02:00:00Z","resolved_at":"2026-11-15T03:00:00Z","shortlink":"https://stspg.io/k9x2","components":[{"name":"Actions"}],"incident_updates":[{"body":"The scheduled maintenance has been completed as planned.","created_at":"2026-11-15T03:00:00Z"}]},{"id":"m4t7","name":"Incident with Actions","status":"resolved","impact":"minor","created_at":"2026-11-14T09:00:00Z","resolved_at":"2026-11-14T09:07:00Z","shortlink":"https://stspg.io/m4t7","components":[{"name":"Actions"}],"incident_updates":[{"body":"We saw a brief increase in queued jobs. No jobs failed. Resolved.","created_at":"2026-11-14T09:07:00Z"}]},{"id":"c2p8","name":"Degraded performance for Codespaces","status":"resolved","impact":"major","created_at":"2026-11-13T11:00:00Z","resolved_at":"2026-11-13T12:40:00Z","shortlink":"https://stspg.io/c2p8","components":[{"name":"Codespaces"}],"incident_updates":[{"body":"Codespaces creation failed for some users in US East. Resolved.","created_at":"2026-11-13T12:40:00Z"}]},{"id":"a7h3","name":"Delays in GitHub Actions workflow runs","status":"resolved","impact":"major","created_at":"2026-11-12T14:05:00Z","resolved_at":"2026-11-12T16:20:00Z","shortlink":"https://stspg.io/a7h3","components":[{"name":"Actions"}],"incident_updates":[{"body":"Resolved. Between 14:05 and 16:20 UTC about 30% of workflow jobs on GitHub-hosted runners started more than 10 minutes late, and 4% failed to start. A follow-up report will be in our monthly availability report.","created_at":"2026-11-12T16:20:00Z"},{"body":"We are investigating delays in Actions job starts.","created_at":"2026-11-12T14:05:00Z"}]}]}
(Incident pages are https://www.githubstatus.com/incidents/<id>.)

--- https://blog.cloudflare.com/tag/post-mortem/ (fetched 2026-11-16) ---
2026-11-11 · "Workers KV outage on October 22, 2026" · https://blog.cloudflare.com/workers-kv-outage-2026-10-22/
Summary: On 2026-10-22 from 17:12 to 19:01 UTC, Workers KV reads failed for 18% of requests worldwide. A configuration change to the storage gateway's connection limits was rolled out to all locations at once; rollback took 1h49m. Cloudflare commits to staged rollouts for gateway configuration.

--- https://www.cloudflarestatus.com/api/v2/incidents.json (fetched 2026-11-16) ---
{"incidents":[{"id":"q1","name":"Workers KV elevated errors","status":"resolved","impact":"major","created_at":"2026-10-22T17:15:00Z","resolved_at":"2026-10-22T19:01:00Z"}]}

--- https://health.aws.amazon.com/health/status (fetched 2026-11-16) ---
Recent events: Nov 10, 2026: Increased error rates, AWS Lambda (Ireland, eu-west-1), 03:10 to 04:25 UTC, resolved. No events for N. Virginia (us-east-1) in the last 7 days.
