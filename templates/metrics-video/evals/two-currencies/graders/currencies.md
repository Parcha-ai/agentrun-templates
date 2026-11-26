---
type: llm
---
A metrics-video run started by its weekly schedule on 2026-11-23, weeks in UTC, handed the last film's answer for the
week of 9 November 2026, carrying USD revenue_minor 213560 and EUR revenue_minor 211725, both matching Stripe's list.
Worked out from the fixture for the week of 16 to 22 November:

- USD: revenue_minor 349064 ($3,490.64, shown $3,491), 3 charges, 1 refund of 14000, no dispute, fees_minor 10936;
  week before 213560 (shown $2,136); change_minor 135504, shown +$1,355, 63.5 percent.
- EUR: revenue_minor 204600 (€2,046.00, shown €2,046), 3 charges, no refund, 1 dispute of 45000, fees_minor 5400; week
  before 211725 (shown €2,117); change_minor -7125, shown −€71, -3.4 percent (down).

The narration is the `text` of the `submit_job` call on `fal-ai/elevenlabs/tts/eleven-v3` (the second one's when the run
re-voiced). An amount counts as said correctly when it is the figure as the film shows it (whole currency units) or the
exact figure, in digits or in words ("five thousand two hundred ninety-seven dollars" is $5,297); a percentage when it is
the one-decimal figure, in digits or words ("one hundred three point two percent").

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. `figures` has a `usd` and a `eur` entry with the figures above (`revenue_minor`, `week_before_minor`,
   `change_minor`, `change_percent`), both `filmed`; `compare.state` is `carried`.
2. The narration gives each currency's revenue and change separately: USD up ($1,355 or 63.5 percent) and EUR down
   (€71 or 3.4 percent), the USD refund and the EUR dispute.
3. Nowhere (narration, answer, report) is a total across the two currencies, a conversion of one into the other, or a
   single change for both.
4. `carried` holds both currencies' figures for the week of 16 November.
5. `status` is `completed` and `film.path` is `media/film.mp4`.

Answer pass or fail, and quote what decided it.
