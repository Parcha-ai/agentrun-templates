---
type: regex
target: watched
flags: s
pattern: "req-2026-095[?\"].*req-2026-150[?\"].*(?:brisa/jobs/7101.*req-2026-001[?\"]|req-2026-001[?\"].*brisa/jobs/7101)"
expect: match
---
`watched` stays oldest first: the carried entries keep their order (req-2026-095 before req-2026-150, the newest
carried), and today's two postings come after them.
