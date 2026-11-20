---
type: llm
---
The window is 2026-11-16 to 2026-11-23. Last week's snapshot, handed to the run, reported fernpack's 3.0.0 release
(2026-11-12) as an event. This week only 3.0.1 shipped (2026-11-20, a regression fix). The owner's correction says
fernpack's downloads come from npm `@fernpack/core` (1,488,305 last week; last snapshot 1,402,660), not the `fernpack`
wrapper (402,118).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **No repeat.** No event in `events` is the 3.0.0 release, and the report does not present 3.0.0 as this week's news.
   `dropped_repeats` names it, or it is simply absent. A `release` event for 3.0.1 dated 2026-11-20 is fine.
2. **The corrected package.** `metrics.downloads.value` is 1488305 with a source on `@fernpack/core` (or its encoded
   form), `previous` 1402660 when given, and `downloads_trend` (if not null) describes a rise of about 6% between those
   two weeks. The wrapper's 402,118 is not reported as fernpack's downloads.
3. **Deltas from the last snapshot.** `stars_delta` is 260 (13210 against 12950), or null with a reason.
4. **Status.** `rising` or `stalling`, with a `status_reason` naming at least two signals.

Answer pass or fail, and quote what decided it.
