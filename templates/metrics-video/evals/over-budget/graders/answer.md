---
type: llm
---
A metrics-video run with max_fal_usd 0.30, weeks in UTC, filming the week of 16 to 22 November 2026 in USD. At
get_pricing's rates (ElevenLabs v3 0.10 per 1000 characters, ElevenLabs Music 0.60 a minute), the plan is the voiceover
(a narration of 60 to 110 words is about 0.04 to 0.08), a reserve as large for one re-voice, and 45 s of music (0.45):
about 0.53 to 0.61. Worked out from the fixture: USD revenue_minor 667643 (shown $6,676).

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. `status` is `over_budget`; `fal_cost_usd.total` is 0 with no steps.
2. `plan_usd` is between 0.50 and 0.65 and `cheaper_plan_usd` (the plan without the music) is between 0.05 and 0.18;
   the answer or report says the plan is over the 0.30 cap.
3. The figures were still worked out: the `usd` entry of `figures` has `revenue_minor` 667643; `script` holds the
   narration.
4. Nothing was rendered: `film.path` is null and no `hyperframes render` command was run.

Answer pass or fail, and quote what decided it.
