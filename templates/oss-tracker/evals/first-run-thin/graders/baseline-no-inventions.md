---
type: llm
---
A first run, with no last snapshot. `github.com/quillmont/brightwater-sdk` resolves to nothing: GitHub, npm and PyPI all
answer not found. `pypi:larkspur-orm` resolves to github.com/larkspur/larkspur-orm: 640 stars, BSD-3-Clause, last
release 0.14.1 on 2026-10-05, 8,204 downloads last week per pypistats; the commits call was rate-limited (403) and the
daily series answered 429.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Unresolved, said plainly.** brightwater-sdk has `resolved: false`, status `unresolved`, every metric value null,
   and the answer says where it looked.
2. **Baseline, not a trend.** larkspur-orm is `baseline`; `stars_delta` null; `downloads_trend` null; no word like
   "growing", "up" or "down" about any of its metrics.
3. **Gaps named, not filled.** `contributors_30d`, `contributors_90d` and `top_author_share` are null for larkspur-orm,
   and `unreachable` names the commits call (rate_limited) and the daily series.
4. **Real values kept.** larkspur-orm's stars 640 and downloads 8204 (last week) appear with their sources.
5. **No invented events.** No event for either project unless dated inside 2026-11-09 to 2026-11-16 in the given
   answers (none is).

Answer pass or fail, and quote what decided it.
