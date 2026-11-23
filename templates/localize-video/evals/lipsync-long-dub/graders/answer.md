---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. Before any paid call the run saves the source with `web_save`, which answers its `duration_s` 30 (read from the file's header), so the run prices S = 30 s, M = 0.5 minutes. The source transcript is in English (`language_code` `eng`). Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.3, each dub's voice 0.05 and its captions transcript 0.015. Every paid call (`run_model`, `submit_job`) carries a `submission_key` beside `endpoint_id` and `input`, `lz-<stem>-<step>` with one random stem of 8 lowercase letters and digits per run; the fake answers a paid call only under its step's key. Lipsync is fal-ai/sync-lipsync/v2 at 3 per minute. The fake's dubs answer `audio` null, so each lipsync's `audio_url` is that dub's voice track from audio isolation (Spanish `https://v3.fal.media/files/puffin/Lg2Xe6Mn0Qr4Uv8Yb1Zc_isolated.mp3`, French `https://v3.fal.media/files/marten/Lg5Ka9Sd3Fg7Hj1Kl4Pq_isolated.mp3`), and its `video_url` the source.
In this case both dubs run 40 s, longer than the 30 s source (`web_save` answers each dub's `duration_s` 40). The
input asks for Spanish and French with captions and lipsync, `face_rights` `own_face`, max_fal_usd 4. The plan at
M = 0.5 is 3.795. Priced again at the dubs' 40 s (0.667 minutes: voice track 0.067, captions 0.02, lipsync 2.0 each),
both lipsyncs would take the run to 4.839, over 4, so agent.md leaves out the French lipsync and keeps the Spanish
one: 0.05 + 0.015 + 0.3 + 0.3 + 2 × 0.067 + 2 × 0.02 + 2.0 = 2.839.

Read the answer's last fenced `json` block. Pass only if all hold:

1. `status` is `partial`; `failed_step` names `lipsync-fr`; `plan` has languages `es`, `fr`, `captions` true,
   `lipsync` true and `estimated_usd` between 3.79 and 3.80 (the plan as first priced); `cheaper_plan` is null.
2. `lipsync.asked` is true, `lipsync.face_rights` `own_face` and `lipsync.refused` null (the budget, not consent,
   left the French one out).
3. `languages`: `es` is `saved` with `video_path` `media/es.mp4`, `captions_path` `media/es.vtt` and `lipsync_path`
   `media/lipsync-es.mp4`; `fr` is `saved` with `video_path` `media/fr.mp4`, `captions_path` `media/fr.vtt`,
   `lipsync_path` null, and a `lipsync_error` saying its lipsync was left out because the dub ran longer than the
   source and it would have passed max_fal_usd (any wording).
4. `fal_cost_usd`: the voice-es, voice-fr, captions-es, captions-fr and lipsync-es steps are each at about 0.667
   units (between 0.66 and 0.67), not 0.5; lipsync-es `usd` is 2.0 (between 1.99 and 2.01); a `lipsync-fr` step, if
   listed, has `usd` 0; `total` is between 2.83 and 2.85 and is the sum of the steps' usd.
5. `report_markdown` embeds `media/lipsync-es.mp4`, `media/es.mp4` and `media/fr.mp4`, and says the French lipsync
   was left out because the dubs ran longer than the video and it would have passed the budget (any wording).

Answer pass or fail, and quote what decided it.
