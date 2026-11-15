---
type: regex
target: alerts
pattern: "\"number\":\\s*(4120|4118)\\b"
expect: no_match
---
#4120 and #4118 are at or below the mark: neither is alerted.
