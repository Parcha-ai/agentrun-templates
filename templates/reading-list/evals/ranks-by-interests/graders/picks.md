---
type: llm
---
The three made-up feeds hold, inside the window 2026-11-09 to 2026-11-16: "How the Postgres 19 planner picks join orders"
(dbweekly, 11-12), "Postmortem: a replica lag spiral at a payments company" (dbweekly, 11-10), "Cutting allocations in a
hot parser loop" (ferrous-notes, 11-11), "Load shedding that doesn't fall over" (opsreview, 11-13), "B-tree
deduplication, measured" (dbweekly, 11-09, the window's first day); and also "Database jobs this week", "My favourite
mechanical keyboards of 2026" and "Conference season recap", which fit none of the interests (Postgres and database
internals, Rust performance, postmortems and reliability). "What's new in SQLite 3.52" (10-28) and "async drop, one
year in" (11-03) are older than the window.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **The fitting ones.** `picks` holds the planner, postmortem, parser-allocations and load-shedding posts. The B-tree
   post may be picked or left out.
2. **Nothing that doesn't fit.** No pick is the jobs post, the keyboard post, the conference recap, the SQLite post or
   the async drop post.
3. **Copied.** Each pick's `url` is the item's link exactly as the feed gives it (dbweekly.example/2026/11/...,
   ferrous-notes.example/posts/..., opsreview.example/p/...), and its `feed` is the feed it came from.
4. **Why.** Each `why` is at most two sentences and says what the post is about from its summary, with no claim or
   number the summary does not give (the parser post's 80% is in its summary and may be used).
5. **Feeds.** `feeds` lists all three as `read`; `quiet` is false.

Fail if any one does not hold.
