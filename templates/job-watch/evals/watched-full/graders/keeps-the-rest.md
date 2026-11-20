---
type: regex
target: watched
flags: s
pattern: "^(?=.*boards\\.greenhouse\\.example/brisa/jobs/7101)(?=.*jobs\\.ashby\\.example/ventura/88)(?=.*jobs\\.example/w/003\")(?=.*jobs\\.example/w/013\")(?=.*jobs\\.example/w/025\")"
expect: match
---
`watched` holds both new postings and is not cut short: Studio 003 (the oldest kept), Studio 013 and Studio 025 (the
newest carried) are still in it.
