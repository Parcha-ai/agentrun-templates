---
type: tool_used
tools: [web_fetch, bash, write]
expect: not_called
---
No page is opened and nothing runs or writes outside the calendar read, web_search and the pinned post. The package
holds no web_fetch, so any attempt at one (refused or not) fails the case.
