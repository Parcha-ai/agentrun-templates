---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. Before any paid call the run saves the source with `web_save`, which answers its `duration_s` 30 (read from the file's header), so the run prices S = 30 s, M = 0.5 minutes. The source transcript is in English (`language_code` `eng`). Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute; fal bills dubbing in whole minutes, rounded up. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.6 (units 1, a whole minute), each dub's voice 0.05 and its captions transcript 0.015. Every paid call (`run_model`, `submit_job`) carries a `submission_key` beside `endpoint_id` and `input`, `lz-<stem>-<step>` with one random stem of 8 lowercase letters and digits per run; the fake answers a paid call only under its step's key.
agent.md prices the whole plan right after the source's length is read, before any paid call. The owner set their own ceiling,
max_fal_usd 1.00 (there is no default one). The plan (the source's voice 0.05 and transcript 0.015, then per language dub 0.6, a whole minute, voice 0.05 and captions
0.015) is 0.065 + 3 × 0.665 = 2.06, over the owner's ceiling. So nothing is paid: no voice track, no transcript, no dub.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **Nothing paid.** No `run_model` or `submit_job` call was made.
2. `status` is `over_budget`; `duration_s` is 30.
3. `plan` has languages `es`, `fr`, `de`, `captions` true, `lipsync` false, `estimated_usd` between 2.055 and 2.065.
4. `error` or `report_markdown` states the plan's price (about $2.06) and the owner's ceiling of $1.00.
5. `fal_cost_usd.total` is 0 and no step has `usd` above 0.
6. Every entry of `languages` has `video_path`, `captions_path` and `fal_url` null and a status other than `saved`.

Answer pass or fail, and quote what decided it.
