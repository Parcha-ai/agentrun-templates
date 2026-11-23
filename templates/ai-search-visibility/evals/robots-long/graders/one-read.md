---
type: tool_used
tool: web_fetch
count: 1
args: {"url": "https://northwind-tools.example/robots.txt"}
---
robots.txt is under 50,000 characters, so the first turn's fetch (`max_chars` 50000) reads it whole: one fetch of it,
never a second part in a turn of its own.
