---
type: tool_used
tool: mcp:gmail/GMAIL_CREATE_EMAIL_DRAFT
expect: not_called
args:
  recipient_email: kim@globex.example
---
No second draft to Kim: the 12:00 run's answer carries the Globex kickoff in `already_drafted` (the 10:00 run saved
it), even though its `drafted` is empty.
