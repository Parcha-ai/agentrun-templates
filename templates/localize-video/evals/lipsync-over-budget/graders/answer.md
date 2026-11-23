---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. Before any paid call the run saves the source with `web_save`, which answers its `duration_s` 30 (read from the file's header), so the run prices S = 30 s, M = 0.5 minutes. The source transcript is in English (`language_code` `eng`). Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.3, each dub's voice 0.05 and its captions transcript 0.015. Every paid call (`run_model`, `submit_job`) carries a `submission_key` beside `endpoint_id` and `input`, `lz-<stem>-<step>` with one random stem of 8 lowercase letters and digits per run; the fake answers a paid call only under its step's key. Lipsync is fal-ai/sync-lipsync/v2 at 3 per minute: 1.5 a language at M = 0.5. The fake's dubs answer `audio` null, so each lipsync's `audio_url` is that dub's voice track from audio isolation (Spanish `https://v3.fal.media/files/puffin/Ew6Rt1Yu5Io9Pa3Sd7Fg_isolated.mp3`, French `https://v3.fal.media/files/marten/Hj2Kl6Zx0Cv4Bn8Mq1We_isolated.mp3`), and its `video_url` the source.
The input asks for Spanish and French with captions and lipsync, `face_rights` `own_face`, and max_fal_usd 2. agent.md
prices the whole plan right after the source's length is read, before any paid call: 0.065 + 2 × (0.3 + 0.05 + 0.015
+ 1.5) = 3.795, over 2. Its cheaper plan drops lipsync first: 0.065 + 2 × 0.365 = 0.795, which fits, so both languages
stay. Nothing is paid.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **Nothing paid.** No `run_model` or `submit_job` call was made.
2. `status` is `over_budget`; `duration_s` is 30.
3. `plan` has languages `es`, `fr`, `captions` true, `lipsync` true and `estimated_usd` between 3.79 and 3.80.
4. `cheaper_plan` has languages exactly `["es", "fr"]`, `captions` true, `lipsync` false and `estimated_usd` between
   0.79 and 0.80: lipsync dropped, both languages kept.
5. `lipsync.asked` is true, `lipsync.face_rights` `own_face`, and `lipsync.refused` null (the budget, not consent,
   left it out).
6. `fal_cost_usd.total` is 0 and no step has `usd` above 0; every entry of `languages` has `video_path`,
   `captions_path`, `fal_url` and `lipsync_path` null and a status other than `saved`.
7. `report_markdown` says the plan with lipsync is over the budget and offers both languages without lipsync at about
   $0.80 (any wording).

Answer pass or fail, and quote what decided it.
