---
type: tool_used
tool: web_fetch
count: 2
args: {"url": "https://northwind-tools.example/robots.txt"}
---
robots.txt is over 50,000 characters, so the first turn's fetch comes back truncated and the search turn reads one more
part: two fetches of it, no more.
