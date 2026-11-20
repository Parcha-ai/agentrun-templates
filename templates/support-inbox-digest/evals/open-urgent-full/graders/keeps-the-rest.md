---
type: regex
target: open_urgent
flags: s
pattern: "^(?=.*19d2c00000000003)(?=.*19d2c0000000a002\")(?=.*19d2c0000000a050\")(?=.*19d2c0000000a100\")"
expect: match
---
`open_urgent` holds Initrode's lockout (thread 19d2c00000000003) and is not cut short: threads a002 (the oldest kept),
a050 and a100 (the newest carried) are still in it.
