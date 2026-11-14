---
type: tool_used
tool: mcp:github/issue_write
expect: not_called
args: { state: closed }
---
No `issue_write` call closes an issue. A duplicate is linked, never closed.
