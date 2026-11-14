---
description: "Last week's snapshot reported fernpack's 3.0.0 release. This week only a 3.0.1 patch shipped, and a learned note says to track @fernpack/core's downloads, not the old wrapper's. The snapshot does not report 3.0.0 again and takes downloads from @fernpack/core."
runs: 3
max_cost_usd: 1.50
---
Scheduled run, fired 2026-11-23T08:00:00Z (Monday). Write this week's snapshot for the projects below with your oss-tracker skill.

The sites below are not reachable from this run. The answers that follow are what their URLs return today; use them in place of fetching. These projects are test data.

--- https://api.github.com/repos/fernpack/fernpack ---
{"full_name":"fernpack/fernpack","stargazers_count":13210,"archived":false,"license":{"spdx_id":"MIT"},"open_issues_count":402}
--- https://api.github.com/repos/fernpack/fernpack/releases?per_page=20 ---
[{"tag_name":"v3.0.1","published_at":"2026-11-20T09:00:00Z","html_url":"https://github.com/fernpack/fernpack/releases/tag/v3.0.1","body":"Fixes a plugin loading regression from 3.0.0."},{"tag_name":"v3.0.0","published_at":"2026-11-12T15:00:00Z","html_url":"https://github.com/fernpack/fernpack/releases/tag/v3.0.0"},{"tag_name":"v2.9.4","published_at":"2026-10-20T10:00:00Z"}]
--- https://api.github.com/repos/fernpack/fernpack/commits?since=2026-08-25 (summarised) ---
431 commits on main since 2026-08-25 by 45 distinct authors excluding bots. Top author kwame-o: 84 commits. Since 2026-10-24: 23 distinct human authors.
--- https://api.github.com/search/issues?q=repo:fernpack/fernpack+is:issue+is:open ---
{"total_count":309}
--- https://api.github.com/search/issues?q=repo:fernpack/fernpack+is:pr+is:open ---
{"total_count":93}
--- https://api.npmjs.org/downloads/point/last-week/fernpack ---
{"downloads":402118,"start":"2026-11-16","end":"2026-11-22","package":"fernpack"}
--- https://api.npmjs.org/downloads/point/last-week/@fernpack%2Fcore ---
{"downloads":1488305,"start":"2026-11-16","end":"2026-11-22","package":"@fernpack/core"}

The result of this trigger's last completed run (2026-11-16), its projects only:

```json
{"window":{"from":"2026-11-09","to":"2026-11-16"},"projects":[{"input":"fernpack/fernpack","package":"npm:@fernpack/core","status":"rising","metrics":{"stars":{"value":12950},"downloads":{"value":1402660,"period":"2026-11-09 to 2026-11-15","source":"https://api.npmjs.org/downloads/point/last-week/@fernpack%2Fcore"},"contributors_30d":{"value":21},"contributors_90d":{"value":44},"top_author_share":{"value":0.19},"open_issues":{"value":301},"open_prs":{"value":87},"last_release":{"version":"3.0.0","date":"2026-11-12"}},"events":[{"kind":"major_release","date":"2026-11-12","summary":"3.0.0: drops Node 18, new plugin API","url":"https://github.com/fernpack/fernpack/releases/tag/v3.0.0"}]}]}
```

Input:
```json
{
  "projects": [
    "fernpack/fernpack"
  ],
  "purpose": "balanced",
  "signals": [],
  "lookback_days": 7
}
```
