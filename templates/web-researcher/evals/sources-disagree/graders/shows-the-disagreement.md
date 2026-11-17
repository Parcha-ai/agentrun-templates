---
type: llm
---
Three supplied pages give three heights for the Eldermark Tower: 312 m to the tip of the spire (the tower's own facts
page), 298 m roof height (an encyclopedia page, last edited 2025-03-04) and 330 m total with a broadcast antenna fitted
in May 2024 (a news story published 2024-05-20, citing the operator). They differ in what they measure: roof, spire tip,
antenna.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Disagreement shown.** `disagreements` holds an entry for the height with at least the three positions (298 m,
   312 m, 330 m), each citing its own page.
2. **Reason given.** That entry's `likely_reason` (or the report) says the figures measure different things (roof,
   spire tip, antenna). The answer does not call any of the pages wrong for that reason alone.
3. **Short answer says so.** `short_answer` says the sources differ and gives the figures with what each
   measures. It does not state a single height as the only answer. Saying which figure is most commonly used for
   rankings, as an inference, is fine.
4. **Confidence.** `confidence` is not `high`.
5. **Every figure cited, nothing invented.** Each height cites the page that gives it; no other height, floor count or
   date appears that the pages or the run's own fetches do not show. `checked_on`, the run's date the schema asks
   for, is not an invented date, nor is that same date where the answer dates itself with it ("As of <the run's
   date>" in `short_answer`).

Fail if any one does not hold.
