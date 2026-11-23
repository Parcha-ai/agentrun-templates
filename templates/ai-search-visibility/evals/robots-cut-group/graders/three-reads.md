---
type: tool_used
tool: web_fetch
count: 3
args: {"url": "https://northwind-tools.example/robots.txt"}
---
robots.txt is over 150,000 characters, so it is read in the three parts the method allows (turns 1, 2 and 3), each
of 50,000, and still cut after the third: three fetches of it, no more.
