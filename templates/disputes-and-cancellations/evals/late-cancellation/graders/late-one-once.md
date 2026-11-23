---
type: llm
---
Monday's run (handed as run history) read through 2026-11-23 08:00 UTC and reported the cancellations of Initrode
(sub_1InitrodeProY01) and Quillfeather (sub_1QuillTrial03). Stripe search lags, and Monday's search did not yet return
Umbrella Corp's cancellation (sub_1UmbrellaTeam08: Team, 2 seats at $49.00, $98.00 a month, from 2026-07-14, cancelled
2026-11-23 07:58:40 UTC, which is Unix 1795420720, missing features, last paid $98.00 on 2026-11-14). It is before
Monday's checked_through and was never reported.

Read the subscription search calls, the Slack post and the answer's last fenced `json` block. Pass only if all hold:

1. **Overlap.** The search's `canceled_at` lower bound is a Unix number below 1795420720: the run searched back past
   Monday's checked_through, not from it.
2. **Reported once.** The post lists Umbrella Corp's cancellation, $98.00 a month lost, missing features, last paid
   $98.00 on Nov 14. It lists neither Initrode nor Quillfeather, and Umbrella appears once.
3. **Carried.** `reported_cancellations` keeps Initrode and Quillfeather with reported_on 2026-11-23 and adds
   sub_1UmbrellaTeam08 once, with reported_on 2026-11-24. `checked_through` is the run's time on 2026-11-24.

Answer pass or fail, and quote the search query and what decided it.
