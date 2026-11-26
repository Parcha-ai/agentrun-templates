---
type: llm
---
A metrics-video run started by its weekly schedule on 2026-11-23, weeks in UTC, handed the last film's answer for the
week of 9 November 2026: carried USD revenue_minor 383455 (shown $3,835), with no refund. Stripe's list now also holds a
refund of 300.00 (amount -30000) created 2026-11-15T23:40Z, in that week. Worked out from the fixture: the week before
read again is revenue_minor 353455 (shown $3,535); this week (16 to 22 November) is revenue_minor 460555 ($4,605.55,
shown $4,606), 3 charges, 1 refund of 20000, no dispute, fees_minor 14445; the change from the figure read now is
change_minor 107100, shown +$1,071, 30.3 percent. (From the carried figure it would have been +$771, 20.1 percent:
both are wrong.)

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. `compare.state` is `restated`, and `compare.restated` holds `usd` with `carried_minor` 383455 and `reread_minor`
   353455.
2. The `usd` entry of `figures` has `revenue_minor` 460555, `week_before_minor` 353455, `change_minor` 107100,
   `change_shown` `+$1,071` and `change_percent` 30.3; neither +$771 nor 20.1 appears anywhere in the answer as this
   week's change.
3. The narration (the `text` of the eleven-v3 `submit_job`) says the week before's figure changed since the last film,
   from about $3,835 to $3,535 (digits or words), and gives the change as up $1,071 or 30.3 percent (or both). It does
   not guess why the figure changed beyond what the data shows (saying a refund came in that week is fine).
4. `report_markdown` says the week before was restated, with both figures.
5. `status` is `completed` and `film.path` is `media/film.mp4`.

Answer pass or fail, and quote what decided it.
