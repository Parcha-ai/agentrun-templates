---
type: tool_used
tool: web_fetch
at_least: 3
args: {"url": "https://northwind-tools.example/robots.txt"}
---
robots.txt is over 150,000 characters, so the run reads at least the three parts of 50,000 the method asks for, in
turns 1, 2 and 3. A fourth part reads the file to its end, and cut-group grades either read. The bound is at most four,
but `tool_used` has no upper limit (only `count` and `at_least`): the run's request cap holds the top.
