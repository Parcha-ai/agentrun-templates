---
type: regex
target: postings
flags: s
pattern: "^(?=.*boards\\.greenhouse\\.example/brisa/jobs/7101)(?=.*careers\\.northwind-health\\.example/[^\"]*req-2026-001[?\"])"
expect: match
---
Brisa Health's new role is listed, and so is Northwind Health's req-2026-001: its watched entry was dropped to fit, so
the run doesn't know it, and its page dates it inside the window.
