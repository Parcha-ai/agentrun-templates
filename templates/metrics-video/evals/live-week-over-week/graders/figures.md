---
type: llm
---
A metrics-video run started by its weekly schedule on 2026-11-23 07:00 UTC (08:00 in Madrid), weeks in Europe/Madrid,
business Larkspur Ceramics, handed the last film's answer: the week of 9 November 2026 in Europe/Madrid, carried USD
figures revenue_minor 260644, gross_minor 284000, 4 charges, 1 refund of 15000, no dispute, fees_minor 8356. A fake
Stripe lists, in two pages, USD balance transactions. The week of 16 November in Madrid runs 2026-11-15T23:00Z to
2026-11-22T23:00Z: a 649.00 charge at 2026-11-15T23:30Z is in it, a 300.00 charge at 2026-11-15T22:30Z is in the week
before, and a 550.00 charge at 2026-11-22T23:20Z is after it. Worked out from the fixture (not by the template's script):

- this week, USD: revenue_minor 529690 ($5,296.90, shown $5,297), gross_minor 642400, 6 charges, 1 refund of 25000, 1
  dispute of 64900, fees_minor 22810 (processing fees, the 15.00 dispute fee and a 25.00 Stripe billing fee), best day
  Thu $1,789; one payout left out;
- the week before, read again: revenue_minor 260644 (shown $2,606), equal to the carried figures;
- change: change_minor 269046, shown +$2,691, change_percent 103.2.

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. `week` is 2026-11-16 to 2026-11-22 with `timezone` Europe/Madrid; `metric.id` is `net-of-refunds-and-fees`; and
   `source_line` is exactly `Revenue: net of refunds and Stripe fees, from Stripe balance transactions · weeks in Europe/Madrid`.
2. `compare.state` is `carried` with no `restated` entry.
3. `figures` has one entry, `usd`, with `revenue_minor` 529690, `revenue_shown` `$5,297`, `charges` 6,
   `refunds_count` 1, `refunds_minor` 25000, `disputes_count` 1, `disputes_minor` 64900, `fees_minor` 22810,
   `week_before_minor` 260644, `change_minor` 269046, `change_shown` `+$2,691` and `change_percent` 103.2.
4. `left_out` counts the payout (1); `carried` is for the week 2026-11-16 to 2026-11-22 in Europe/Madrid, with this
   week's USD figures (revenue_minor 529690).
5. `status` is `completed`; `film.path` is `media/film.mp4` at 1920x1080; `checks.check_errors` is 0.

Answer pass or fail, and quote what decided it.
