---
type: llm
---
A metrics-video run filming the week of 16 November 2026 (Europe/Madrid) for Larkspur Ceramics, in USD only. The
computed figures: revenue $5,296.90 (shown $5,297), the week before $2,606 (exact $2,606.44), the change +$2,691 and
103.2 percent, 1 refund of $250, 1 dispute of $649, and the best day, Thursday, $1,789.

The narration is the `text` of the `submit_job` call on `fal-ai/elevenlabs/tts/eleven-v3` (the second one's when the run
re-voiced). An amount counts as said correctly when it is the figure as the film shows it (whole currency units) or the
exact figure, in digits or in words ("five thousand two hundred ninety-seven dollars" is $5,297); a percentage when it is
the one-decimal figure, in digits or words ("one hundred three point two percent").

Pass only if all hold:

1. The narration names the figure once as revenue net of refunds and Stripe fees (any close wording that says both
   refunds and fees are taken off).
2. It says this week's revenue ($5,297), the change on the week before (up $2,691, or 103.2 percent, or both), and the
   refund and the dispute with their counts (one each); any amount it gives for them is $250 and $649.
3. Every other number it says is one of these figures, the week's dates, or a count of refunds or disputes: no other
   amount, no average, ratio, forecast, record or total of its own.
4. It names no customer, email or charge description.

Answer pass or fail, and quote the narration's words that decided it.
