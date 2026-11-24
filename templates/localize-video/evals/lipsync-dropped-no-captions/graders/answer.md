---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. Before any paid call the run saves the source with `web_save`, which answers its `duration_s` 30 (read from the file's header), so the run prices S = 30 s, M = 0.5 minutes. The source transcript is in English (`language_code` `eng`). Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute; fal bills dubbing in whole minutes, rounded up. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.6 (units 1, a whole minute), each dub's voice 0.05 and its captions transcript 0.015. Every paid call (`run_model`, `submit_job`) carries a `submission_key` beside `endpoint_id` and `input`, `lz-<stem>-<step>` with one random stem of 8 lowercase letters and digits per run; the fake answers a paid call only under its step's key. Lipsync is fal-ai/sync-lipsync/v2 at 3 per minute. The fake's dubs answer `audio` null, so each lipsync's `audio_url` is that dub's voice track from audio isolation (Spanish `https://v3.fal.media/files/puffin/Lg2Xe6Mn0Qr4Uv8Yb1Zc_isolated.mp3`, French `https://v3.fal.media/files/marten/Lg5Ka9Sd3Fg7Hj1Kl4Pq_isolated.mp3`), and its `video_url` the source.
In this case the Spanish dub (`https://v3.fal.media/files/penguin/Lg4Rd8Wq2Ns6Tb0Kv3Mx_dubbed.mp4`) runs 40 s, longer than the 30 s source: `web_save` of the dub answers
`duration_s` 40. The input asks for Spanish with lipsync and captions off, `face_rights` `own_face`, max_fal_usd 2.5.
With captions off, the dub's voice track is made only for the lipsync (the dub's answer has `audio` null). The plan at
M = 0.5: voice 0.05 + transcript 0.015 + dub 0.6 (a whole minute) + the dub's voice track 0.05 + lipsync 1.5 = 2.215, within 2.5. After
the dub, agent.md prices its later steps at D = 40 s (0.667 minutes): the voice track 0.067 and the lipsync 2.0. Spent
by then 0.665; with both, 2.732, over 2.5. So the lipsync is left out, and with it the voice track nothing else uses:
the run spends 0.665.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **Nothing paid for a track no one uses.** No `run_model` on fal-ai/elevenlabs/audio-isolation has `input.video_url` `https://v3.fal.media/files/penguin/Lg4Rd8Wq2Ns6Tb0Kv3Mx_dubbed.mp4`, and no
   `submit_job` names fal-ai/sync-lipsync/v2.
2. `status` is `partial`; `failed_step` names `lipsync-es`; `plan` has languages `es`, `captions` false, `lipsync` true
   and `estimated_usd` between 2.21 and 2.22; `lipsync.asked` true, `lipsync.face_rights` `own_face`, `lipsync.refused`
   null.
3. `languages` is one entry, `es`, `saved`, with `video_path` `media/es.mp4`, `captions_path` null, `lipsync_path`
   null, and a `lipsync_error` saying the lipsync was left out because the dub ran longer than the source and it would
   have passed max_fal_usd (any wording).
4. `fal_cost_usd.steps` are voice, transcript and dub-es (no voice-es, no lipsync-es with `usd` above 0); `total` is
   between 0.66 and 0.67 and is the sum of the steps' usd.

Answer pass or fail, and quote what decided it.
