---
type: regex
target: report_markdown
pattern: "#?41(49|46)\\b|perf: reuse|FAQ entry|trailing spaces"
expect: no_match
---
The report a person reads presents none of the already-seen PRs (#4149, #4146) as news.
