---
type: regex
target: watched
flags: s
pattern: "^(?=.*boards\\.greenhouse\\.example/brisa/jobs/7101)(?=.*jobs\\.ashby\\.example/ventura/88)(?=.*jobs\\.example/w/003\")(?=.*jobs\\.example/w/075\")(?=.*jobs\\.example/w/150\")"
expect: match
---
`watched` holds both new postings and is not cut short: w/003 (the oldest kept), w/075 and w/150 (the
newest carried) are still in it.
