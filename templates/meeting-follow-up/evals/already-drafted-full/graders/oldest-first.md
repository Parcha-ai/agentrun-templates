---
type: regex
target: already_drafted
flags: s
pattern: "ev_seen_002\".*ev_seen_040\".*ev_seen_079\".*ev_globex_kickoff\".*ev_brightpane_intro\""
expect: match
---
`already_drafted` stays oldest first (in the order drafted): the carried ids keep their order and the Brightpane intro,
drafted by this run, comes last.
