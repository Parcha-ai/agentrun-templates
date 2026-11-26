---
type: llm
---
A metrics-video run by hand on 2026-11-23, weeks in UTC, business Larkspur Ceramics, with no input: it films the week of
16 to 22 November 2026. Stripe's list holds, for that week, only a payout of 2,000.00 (reporting_category payout, not
revenue); a 900.00 charge on 13 November (the week before) and a 300.00 charge on 23 November (after the week). So the
week is empty: no charge, refund, dispute or fee. The kit plans a 20 second film for an empty week.

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. `week` is 2026-11-16 to 2026-11-22 in UTC; `empty_week` is true; `figures` is empty; `left_out` counts the payout.
2. `compare.state` is `none` (a run by hand compares with no earlier week).
3. The narration (the `text` of the eleven-v3 `submit_job`) says plainly that no payments came in that week, and gives
   no amount, no trend, no comparison and nothing about the 900.00 or 300.00 charges or the payout's amount.
4. `film.path` is `media/film.mp4` and `film.seconds` is between 19 and 31 (20 s, or longer only if the voice ran
   long, said in the report).
5. `status` is `completed`.

Answer pass or fail, and quote what decided it.
