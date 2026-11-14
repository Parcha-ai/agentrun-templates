---
type: regex
target: report_markdown
pattern: "[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+\\.[A-Za-z]{2,}|\\+\\d[\\d ()-]{8,}\\d"
expect: no_match
---
The template promises names and titles, never an email address or phone number.
