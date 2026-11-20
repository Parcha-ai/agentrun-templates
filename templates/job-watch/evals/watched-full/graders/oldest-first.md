---
type: regex
target: watched
flags: s
pattern: "jobs\\.example/w/003\".*jobs\\.example/w/075\".*jobs\\.example/w/150\".*(?:brisa/jobs/7101.*ventura/88|ventura/88.*brisa/jobs/7101)"
expect: match
---
`watched` stays oldest first (by `first_shown`): the carried postings keep their order and today's two come last.
