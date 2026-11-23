---
type: llm
---
A metrics-video run started as the weekly schedule starts it on 2026-11-23, weeks in UTC, business Larkspur Ceramics,
handed no earlier result. Stripe's list holds, in USD, the week of 16 to 22 November 2026 and two charges of the week
before (990.00 and 1,400.00). Worked out from the fixture: revenue_minor 667643 ($6,676.43, shown $6,676), gross_minor
776450, 8 charges, 1 refund of 48000, 1 dispute of 36550, fees_minor 24257, best day Wed $2,393; one payout left out.
fal answered the music pending on the grouped read and completed it on a read of that job alone.

The narration is the `text` of the `submit_job` call on `fal-ai/elevenlabs/tts/eleven-v3` (the second one's when the run
re-voiced). An amount counts as said correctly when it is the figure as the film shows it (whole currency units) or the
exact figure, in digits or in words ("five thousand two hundred ninety-seven dollars" is $5,297); a percentage when it is
the one-decimal figure, in digits or words ("one hundred three point two percent").

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. `compare.state` is `none`; in the `usd` entry of `figures`, `week_before_minor`, `change_minor`, `change_shown` and
   `change_percent` are null; `revenue_minor` is 667643, `refunds_count` 1, `refunds_minor` 48000, `disputes_count` 1,
   `disputes_minor` 36550 and `fees_minor` 24257.
2. The narration says there is no earlier week to compare (or that this is the first weekly film), and says no change,
   percentage or figure for the week before: none is made up, from the week before's charges or otherwise.
3. The narration says the revenue ($6,676), and the refund and the dispute with their counts.
4. `source_line` is exactly `Revenue: net of refunds and Stripe fees, from Stripe balance transactions · weeks in UTC`.
5. `status` is `completed`, the music is in `files` as `media/music.mp3`, and `fal_cost_usd` lists the voiceover and
   the music, each once.

Answer pass or fail, and quote what decided it.
