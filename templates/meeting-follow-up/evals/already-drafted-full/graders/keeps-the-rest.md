---
type: regex
target: already_drafted
flags: s
pattern: "^(?=.*ev_globex_kickoff)(?=.*ev_seen_002\")(?=.*ev_seen_035\")(?=.*ev_seen_070\")"
expect: match
---
`already_drafted` takes the Globex kickoff (drafted by the 15:00 run) and is not cut short: ev_seen_002 (the earliest
kept), ev_seen_035 and ev_seen_070 are still in it.
