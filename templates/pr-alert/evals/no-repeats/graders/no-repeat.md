---
type: regex
target: alerts
pattern: "\"number\":\\s*(4161|4160|4158)\\b"
expect: no_match
---
#4161 (alerted by the last run, title edited since), #4160 and #4158 are not alerted again.
