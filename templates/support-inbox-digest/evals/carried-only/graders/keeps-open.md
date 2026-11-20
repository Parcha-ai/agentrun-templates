---
type: regex
target: open_urgent
flags: s
pattern: "^(?=.*19d2c00000000003)(?=.*19d2c0000000b001\")(?=.*19d2c0000000b019\")"
expect: match
---
`open_urgent` keeps the carried threads through a week with no mail from them: Initrode's lockout and the outage
threads b001 to b019 (first reported 2026-11-12, inside 30 days).
