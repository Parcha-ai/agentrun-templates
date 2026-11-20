---
type: regex
target: watched
flags: s
pattern: "^(?=.*careers\\.example/careers\\?jobId=101\")(?=.*careers\\.example/careers\\?jobId=102\")(?=.*careers\\.example/careers\\?jobId=103\")"
expect: match
---
`watched` keeps each job's own url, query included: ?jobId=101, ?jobId=102 and ?jobId=103, each ending there (103 without
its tracking parameters and fragment).
