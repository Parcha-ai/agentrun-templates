---
type: llm
---
In this made-up week, https://dbweekly.example/feed.xml answers 404, https://ferrous-notes.example/atom.xml serves an
HTML page ("We moved! Find us on our new site."), and https://opsreview.example/rss is read with two items in the window:
"Load shedding that doesn't fall over" (11-13, fits reliability engineering) and "Conference season recap" (11-14,
photos and talk titles, fits nothing).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **One pick.** `picks` holds the load-shedding post alone (the conference recap may be absent; any other pick fails),
   with its opsreview.example link.
2. **Feeds said.** `feeds` gives dbweekly `unreachable` (or `not_a_feed`) and ferrous-notes `not_a_feed` (or
   `unreachable`), each with `items_in_window` 0, and the report names both as not read.
3. **Not quiet.** `quiet` is false.
4. **Nothing invented.** No pick, title or link appears that the opsreview feed does not hold; no item is credited to
   dbweekly or ferrous-notes.

Fail if any one does not hold.
