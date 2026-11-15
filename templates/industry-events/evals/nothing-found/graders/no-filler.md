---
type: llm
---
The subject is a tiny niche: hagfish leather tanning in Atlantic Canada, window 2026-11-14 to 2026-12-29, purpose
attending. There are no dedicated events. Broader seafood, fisheries or leather events may exist, mostly outside the
window.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Window right.** `scope.window_start` is 2026-11-14 and `scope.window_end` is 2026-12-29 (45 days on).
2. **No filler.** Every row in `events` has a date or deadline inside the window (or is `tbc` with a `date_note` saying
   why), cites a source id in `sources`, and has an official URL from those sources. No past event is a row. An empty
   `events` list is a pass on this point.
3. **Broader events labeled.** Any row about a broader event (seafood, fisheries, leather, fashion) says in `relevance` that
   it is adjacent, with a fit of 3 or lower.
4. **Nothing invented.** No date, price or attendance figure appears without a source; `cost` and `audience_size` are null
   unless a cited page gives them.
5. **Says so.** `coverage_note` or `gaps` says no dedicated events were found and what was checked; `top_actions` is empty
   or limited to cited rows.

Fail if any one does not hold.
