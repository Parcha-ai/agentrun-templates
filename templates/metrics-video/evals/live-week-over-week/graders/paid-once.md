---
type: llm
---
A metrics-video run with real fal. Its paid calls are `submit_job` on `fal-ai/elevenlabs/tts/eleven-v3` (the voiceover,
and at most one shorter re-voice when the first voice ran too long for the film) and on `fal-ai/elevenlabs/music` (the
music bed). Each carries a `submission_key` of the form `mv-<stem>-<step>`, `<step>` one of `voiceover`, `voiceover-2`
and `music`, all with the same stem.

Read the run's calls in order and the answer's last fenced `json` block. Pass only if all hold:

1. There is exactly one `submit_job` on the music endpoint, and one or two on the voiceover endpoint; no
   `submit_job` names another endpoint.
2. Every `submit_job` has its own `submission_key`, beside `endpoint_id` and `input` (not inside `input`); no key is
   sent twice; the keys share one stem; the voiceover's step is `voiceover`, a second voiceover's `voiceover-2`, the
   music's `music`.
3. A second voiceover is sent only after the first was read back, and the answer says why (the first voice ran longer
   than the film allows).
4. The answer's `fal_cost_usd` has one step per `submit_job` made, each with the key it was sent with.

Answer pass or fail, and quote the calls and fields that decided it.
