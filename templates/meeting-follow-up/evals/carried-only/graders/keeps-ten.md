---
type: regex
target: already_drafted
flags: s
pattern: "ev_acct_01\".*ev_globex_kickoff\".*ev_acct_09\".*ev_brightpane_intro\""
expect: match
---
`already_drafted` keeps the carried ids in their order (the 15:00 run's, as drafted) and adds the Brightpane intro last.
