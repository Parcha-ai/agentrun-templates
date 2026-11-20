---
type: regex
target: watched
flags: s
pattern: "^(?=.*boards\\.greenhouse\\.example/brisa/jobs/7101)(?=.*jobs\\.ashby\\.example/ventura/88)(?=.*jobs\\.example/w/003\")(?=.*jobs\\.example/w/020\")(?=.*jobs\\.example/w/040\")"
expect: match
---
`watched` holds both new postings and is not cut short: w/003 (the oldest kept), w/020 and w/040 (the
newest carried) are still in it.
