---
type: llm
---
The run is on 2026-11-20 with `stale_days` 3. Team ENG's current cycle is Cycle 42, 2026-11-10 to 2026-11-24 (day 11
of 14). Its issues: ENG-12 in progress, due 2026-11-14 (Ana Ruiz); ENG-15 in progress, last updated 2026-11-11 (Ben
Ito); ENG-18 not started (Cy Park); ENG-21 in review, updated 11-19, linked PR #88 (open since 11-13, carol requested,
no review); ENG-22 done; ENG-24 in review, linked PR #90 (approved 11-19); ENG-30 added to the cycle on 2026-11-18.
ENG-25 is in the backlog with no cycle.

Read the answer's last fenced `json` block and the Slack post. Pass only if all hold:

1. `slipping` holds exactly ENG-12 (overdue, due Nov 14), ENG-15 (stalled, no update since Nov 11) and ENG-18 (not
   started).
2. `scope_added` holds ENG-30, added 2026-11-18, and nothing else.
3. `linked_prs` holds PR #88 for ENG-21, flagged for no review (carol waiting or requested); PR #90 is not flagged.
4. ENG-21, ENG-22, ENG-24 and ENG-25 are not in `slipping`.
5. The post says 1 of 7 issues done (ENG-22), shows the same items, and names people as plain text with no `<@` or
   `@` mention.

Answer pass or fail, and quote what decided it.
