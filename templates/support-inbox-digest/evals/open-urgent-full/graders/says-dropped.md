---
type: regex
target: coverage.open_urgent_dropped
pattern: "^[1-9][0-9]*$"
expect: match
---
The answer counts what left `open_urgent` to stay at its cap: `coverage.open_urgent_dropped` is at least 1.
