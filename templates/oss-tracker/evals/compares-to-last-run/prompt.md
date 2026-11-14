---
description: "Two projects against last week's snapshot: fernpack ships 3.0.0 with stars, downloads and contributors up; glimmerq loses downloads and contributors, has had no release in 14 months, and adds a call for maintainers. fernpack is rising with the major release as its event; glimmerq is fading with the call as its event; every delta is against the last snapshot."
runs: 3
max_cost_usd: 1.50
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's snapshot for the projects below with your oss-tracker skill.

The sites below are not reachable from this run. The answers that follow are what their URLs return today; use them in place of fetching. These projects are test data.

--- https://api.github.com/repos/fernpack/fernpack ---
{"full_name":"fernpack/fernpack","stargazers_count":12950,"archived":false,"license":{"spdx_id":"MIT"},"open_issues_count":388,"default_branch":"main","pushed_at":"2026-11-15T21:04:00Z"}
--- https://api.github.com/repos/fernpack/fernpack/releases?per_page=20 ---
[{"tag_name":"v3.0.0","published_at":"2026-11-12T15:00:00Z","html_url":"https://github.com/fernpack/fernpack/releases/tag/v3.0.0","body":"Breaking: drops Node 18; new plugin API."},{"tag_name":"v2.9.4","published_at":"2026-10-20T10:00:00Z"},{"tag_name":"v2.9.3","published_at":"2026-09-30T10:00:00Z"},{"tag_name":"v2.9.2","published_at":"2026-09-02T10:00:00Z"}]
--- https://api.github.com/repos/fernpack/fernpack/commits?since=2026-08-18 (summarised: author logins and counts) ---
412 commits on main since 2026-08-18 by 46 distinct authors, two of them bots (dependabot[bot] 37, github-actions[bot] 12). Top human author kwame-o: 80 commits. Since 2026-10-17: 21 distinct human authors.
--- https://api.github.com/search/issues?q=repo:fernpack/fernpack+is:issue+is:open ---
{"total_count":301}
--- https://api.github.com/search/issues?q=repo:fernpack/fernpack+is:pr+is:open ---
{"total_count":87}
--- https://api.npmjs.org/downloads/point/last-week/fernpack ---
{"downloads":1350214,"start":"2026-11-09","end":"2026-11-15","package":"fernpack"}

--- https://registry.npmjs.org/glimmerq/latest ---
{"name":"glimmerq","version":"1.8.2","license":"Apache-2.0","repository":{"url":"git+https://github.com/glimmer-labs/glimmerq.git"}}
--- https://api.github.com/repos/glimmer-labs/glimmerq ---
{"full_name":"glimmer-labs/glimmerq","stargazers_count":3080,"archived":false,"license":{"spdx_id":"Apache-2.0"},"open_issues_count":231}
--- https://api.github.com/repos/glimmer-labs/glimmerq/releases?per_page=20 ---
[{"tag_name":"v1.8.2","published_at":"2025-09-03T09:00:00Z","html_url":"https://github.com/glimmer-labs/glimmerq/releases/tag/v1.8.2"}]
--- https://api.github.com/repos/glimmer-labs/glimmerq/commits?since=2026-08-18 (summarised) ---
14 commits on main since 2026-08-18 by 2 distinct human authors (ana-r 13, tbell 1). None since 2026-10-17 except one by ana-r on 2026-11-13: "README: we are looking for maintainers" (https://github.com/glimmer-labs/glimmerq/commit/4be21c9).
--- https://api.github.com/search/issues?q=repo:glimmer-labs/glimmerq+is:issue+is:open ---
{"total_count":212}
--- https://api.github.com/search/issues?q=repo:glimmer-labs/glimmerq+is:pr+is:open ---
{"total_count":19}
--- https://api.npmjs.org/downloads/point/last-week/glimmerq ---
{"downloads":176040,"start":"2026-11-09","end":"2026-11-15","package":"glimmerq"}

The result of this trigger's last completed run (2026-11-09), its projects' metrics only:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"projects":[{"input":"fernpack/fernpack","status":"rising","metrics":{"stars":{"value":12400},"downloads":{"value":1203770,"period":"2026-11-02 to 2026-11-08"},"contributors_30d":{"value":18},"contributors_90d":{"value":41},"top_author_share":{"value":0.22},"open_issues":{"value":296},"open_prs":{"value":80},"last_release":{"version":"2.9.4","date":"2026-10-20"}},"events":[]},{"input":"npm:glimmerq","status":"stalling","metrics":{"stars":{"value":3100},"downloads":{"value":209500,"period":"2026-11-02 to 2026-11-08"},"contributors_30d":{"value":1},"contributors_90d":{"value":3},"top_author_share":{"value":0.81},"open_issues":{"value":180},"open_prs":{"value":17},"last_release":{"version":"1.8.2","date":"2025-09-03"}},"events":[]}]}
```
