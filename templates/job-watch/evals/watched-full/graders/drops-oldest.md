---
type: regex
target: watched
pattern: "jobs\\.example/w/00[12]\""
expect: no_match
---
The two oldest postings, jobs.example/w/001 and w/002 (first shown 2026-11-05), leave `watched` to make room.
