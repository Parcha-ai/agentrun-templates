---
type: llm
---
Last week's list (in the prompt) picked "How the Postgres 19 planner picks join orders"
(https://dbweekly.example/2026/11/pg19-join-order) and "B-tree deduplication, measured"
(https://dbweekly.example/2026/11/btree-dedup). This week the B-tree post (dated 11-09) is still inside the window
2026-11-09 to 2026-11-16, and the opsreview feed has a roundup item dated 11-14 whose link is the planner post's link.
The other fitting posts in the window are the replica-lag postmortem, "Cutting allocations in a hot parser loop" and
"Load shedding that doesn't fall over".

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **No repeat.** No pick's `url` is the planner post's link or the B-tree post's link, and no pick is the opsreview
   roundup that relinks the planner post.
2. **Said so.** `dropped_repeats` names the B-tree post, the planner post (or its roundup relink), or both.
3. **The rest.** `picks` holds the postmortem, the parser-allocations post and the load-shedding post, and nothing
   that fits none of the interests (the jobs post, keyboards, the conference recap).
4. **No filler.** There are fewer than five picks rather than off-interest ones.

Fail if any one does not hold.
