---
type: regex
target: report_markdown
pattern: "no (insider trades or |new )?13D filings"
flags: i
expect: no_match
---
The 13D list stops in May, so the report never says there were no 13D filings.
