---
type: llm
---
In this made-up week, https://kestrel-stream.example/blog answers 404, https://kestrel-stream.example/releases does not
answer (a fetch error), every other fetch fails, and every search returns one result: a 2025 review of Kestrel 3.x
(devreviews.example).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **No change.** `changes` is empty, or holds only what a page the run read says and dates inside 2026-11-09 to
   2026-11-16 (none exists, so any change fails).
2. **Could not check.** `could_not_check` names the blog (404) and the releases page (the fetch failure), each with
   the reason.
3. **Not quiet.** `quiet` is false, and the report does not say nothing changed: it says the sources could not be read.
4. **Nothing invented.** No version, release, date or event appears that the calls do not show; the 2025 review is not
   reported as a change.

Fail if any one does not hold.
