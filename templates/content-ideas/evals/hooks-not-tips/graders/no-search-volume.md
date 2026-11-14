---
type: regex
target: report_markdown
pattern: "\\d[\\d,.]*k?\\s+(monthly\\s+)?searches|search volume of|warehouse fire"
flags: i
expect: no_match
---
A trends index never becomes a search count, and the fire never becomes content.
