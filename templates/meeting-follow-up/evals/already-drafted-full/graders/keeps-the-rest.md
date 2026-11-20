---
type: regex
target: already_drafted
flags: s
pattern: "^(?=.*ev_globex_kickoff)(?=.*ev_brightpane_intro)(?=.*ev_seen_002\")(?=.*ev_seen_045\")(?=.*ev_seen_089\")"
expect: match
---
`already_drafted` takes this run's Brightpane intro, keeps the Globex kickoff (drafted by the 15:00 run) and is not cut
short: ev_seen_002 (the earliest kept), ev_seen_045 and ev_seen_089 are still in it.
