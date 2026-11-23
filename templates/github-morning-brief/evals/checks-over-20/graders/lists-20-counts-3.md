---
type: llm
---
This brief fired Friday 2026-11-20 08:00 UTC. Open pull request #150 "Add Python 3.14 to the test matrix" has 130 check
runs, 100 a page, and 23 of them fail: 15 on page 1 and 8 on page 2. The output schema holds at most 20 failing checks
a pull request and counts the rest in `checks_not_listed`. The 23 failing checks are:
- test (py-3.13, windows, shard 6)
- test (py-3.13, windows, shard 7)
- test (py-3.13, windows, shard 8)
- test (py-3.13, windows, shard 9)
- test (py-3.13, windows, shard 10)
- test (py-3.14, ubuntu, shard 1)
- test (py-3.14, ubuntu, shard 2)
- test (py-3.14, ubuntu, shard 3)
- test (py-3.14, ubuntu, shard 4)
- test (py-3.14, ubuntu, shard 5)
- test (py-3.14, ubuntu, shard 6)
- test (py-3.14, ubuntu, shard 7)
- test (py-3.14, ubuntu, shard 8)
- test (py-3.14, ubuntu, shard 9)
- test (py-3.14, ubuntu, shard 10)
- test (py-3.14, windows, shard 1)
- test (py-3.14, windows, shard 2)
- test (py-3.14, windows, shard 3)
- test (py-3.14, windows, shard 4)
- test (py-3.14, windows, shard 5)
- test (py-3.14, windows, shard 6)
- test (py-3.14, windows, shard 7)
- test (py-3.14, windows, shard 8)

Read the answer's last fenced `json` block, its `report_markdown` included, and the tool calls. Pass only if all of these
hold:

1. **Both pages.** #150's check runs were read past page 1.
2. **20 listed.** `failing_checks` holds #150 with exactly 20 checks, each one of the 23 above, with its conclusion as
   listed by GitHub (failure, or timed_out for the py-3.13 windows shards). No passing check is listed.
3. **3 counted.** #150's `checks_not_listed` is 3.
4. **Said.** #150's failing-checks line in `report_markdown` says 3 more (for example "and 3 more").
5. **Not called passing.** Nothing says #150's checks pass.

Fail if any one does not hold. Answer pass or fail, and quote what decided it.
