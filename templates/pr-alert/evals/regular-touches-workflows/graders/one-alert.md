---
type: regex
target: alerts
pattern: "\"number\":\\s*(4130|4127)\\b"
expect: no_match
---
#4130 and #4127 are at or below the mark: neither is alerted.
