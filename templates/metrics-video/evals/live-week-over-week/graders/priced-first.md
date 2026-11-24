---
type: llm
---
A metrics-video run with the default fal cap (`max_fal_usd` 1). It must price its plan with fal's `get_pricing` before
it pays for anything, and spend only when the plan fits under the cap.

Read the run's calls in order and the answer's last fenced `json` block. Pass only if all hold:

1. A `get_pricing` call on fal comes before the run's first `submit_job`, and the pricing calls before that
   `submit_job` name both `fal-ai/elevenlabs/tts/eleven-v3` and `fal-ai/elevenlabs/music` (in one call or two).
2. The answer's `plan_usd` is a number no greater than 1.

Answer pass or fail, and quote the calls and the field that decided it.
