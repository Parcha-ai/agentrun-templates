---
description: "A first run with no last snapshot: one entry resolves to nothing anywhere, the other resolves but has no dated series. The snapshot marks the first unresolved with every metric null, the second baseline with no deltas or trends, and invents no number."
runs: 3
max_cost_usd: 1.50
input:
  projects: ["github.com/quillmont/brightwater-sdk", "pypi:larkspur-orm"]
  purpose: "balanced"
  signals: []
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). This is the first run of this snapshot. Write it for the projects below with your oss-tracker skill.

The sites below are not reachable from this run. The answers that follow are what their URLs return today; use them in place of fetching. These projects are test data.

--- https://github.com/quillmont/brightwater-sdk ---
404 Not Found
--- https://api.deps.dev/v3/projects/github.com%2Fquillmont%2Fbrightwater-sdk ---
{"code":5,"message":"project not found"}
--- https://registry.npmjs.org/brightwater-sdk/latest ---
"Not Found"
--- https://pypi.org/pypi/brightwater-sdk/json ---
{"message":"Not Found"}

--- https://pypi.org/pypi/larkspur-orm/json (info only) ---
{"info":{"name":"larkspur-orm","version":"0.14.1","license":"BSD-3-Clause","project_urls":{"Source":"https://github.com/larkspur/larkspur-orm"}}}
--- https://api.deps.dev/v3/projects/github.com%2Flarkspur%2Flarkspur-orm ---
{"projectKey":{"id":"github.com/larkspur/larkspur-orm"},"openIssuesCount":31,"starsCount":640,"forksCount":41,"license":"BSD-3-Clause","description":"A small typed ORM"}
--- https://github.com/larkspur/larkspur-orm (page, summarised) ---
Default branch main. Not archived.
--- https://github.com/larkspur/larkspur-orm/issues (page) ---
23 Open · 190 Closed
--- https://github.com/larkspur/larkspur-orm/releases.atom (summarised) ---
v0.14.1 · updated 2026-10-05T12:00:00Z · https://github.com/larkspur/larkspur-orm/releases/tag/v0.14.1
v0.14.0 · updated 2026-08-21T12:00:00Z
--- https://github.com/larkspur/larkspur-orm/commits/main.atom ---
429 Too Many Requests
--- https://github.com/larkspur/larkspur-orm/pulls ---
429 Too Many Requests
--- https://api.github.com/search/issues?q=repo:larkspur/larkspur-orm+is:pr+is:open&per_page=1 ---
{"message":"API rate limit exceeded for 203.0.113.7.","status":"403"}
--- https://pypistats.org/api/packages/larkspur-orm/recent ---
{"data":{"last_day":1190,"last_week":8204,"last_month":33870},"package":"larkspur-orm"}
--- https://pypistats.org/api/packages/larkspur-orm/overall?mirrors=false ---
429 Too Many Requests
