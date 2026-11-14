---
type: llm
---
The window is 2026-11-09 to 2026-11-16, purpose dependency_risk. Against last week's snapshot (handed to the run):
- fernpack: stars 12,400 to 12,950 (+550); npm downloads 1,203,770 to 1,350,214 (about +12%); human contributors over
  90 days 41 to 44 and over 30 days 18 to 21 (bots excluded: dependabot and github-actions); top author 80 of 363 human
  commits (about 22%); v3.0.0 released 2026-11-12, a major version.
- glimmerq: stars 3,100 to 3,080 (-20); downloads 209,500 to 176,040 (about -16%); 2 human contributors over 90 days
  (was 3), 1 over 30 days (ana-r, one commit); top author 13 of 14 commits (about 93%); last release 1.8.2 on
  2025-09-03; open issues 180 to 212; on 2026-11-13 the README added "we are looking for maintainers".

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **fernpack** is `rising`; `stars_delta` 550; contributor counts exclude the bots (44 and 21); an event
   `major_release` for 3.0.0 dated 2026-11-12 linked to its release page.
2. **glimmerq** is `fading`; `stars_delta` -20; downloads 176040 with a trend that says down; top author share about
   0.93; an event `maintainer_call` dated 2026-11-13 linked to the commit or README; `so_what` speaks to dependency risk.
3. **Several signals.** Each `status_reason` names at least two signals.
4. **Order.** glimmerq, the status change with a red flag, comes before fernpack in `projects` or in the report, or the
   report's headline (the line right under its `**OSS tracker**` header, which the skill puts first) names glimmerq's
   call for maintainers or fernpack's major release.
5. **Nothing invented.** No number in the answer that the given answers don't support (derived shares and deltas are
   fine). No advice to adopt, drop or invest.

Answer pass or fail, and quote what decided it.
