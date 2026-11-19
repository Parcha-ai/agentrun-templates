---
type: regex
target: watched
flags: s
pattern: "^(?=.*boards\\.greenhouse\\.example/brisa/jobs/7101)(?=.*jobs\\.ashby\\.example/ventura/88)(?=.*jobs\\.example/w/003\")(?=.*jobs\\.example/w/080\")(?=.*jobs\\.example/w/160\")"
expect: match
---
`watched` holds both new postings and is not cut short: Studio 003 (the oldest kept), Studio 080 and Studio 160 (the
newest carried) are still in it.
