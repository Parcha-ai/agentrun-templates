---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. Before any paid call the run saves the source with `web_save`, which answers its `duration_s` 30 (read from the file's header), so the run prices S = 30 s, M = 0.5 minutes. The source transcript is in English (`language_code` `eng`). Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.3, each dub's voice 0.05 and its captions transcript 0.015. Every paid call (`run_model`, `submit_job`) carries a `submission_key` beside `endpoint_id` and `input`, `lz-<stem>-<step>` with one random stem of 8 lowercase letters and digits per run; the fake answers a paid call only under its step's key. Lipsync is fal-ai/sync-lipsync/v2 at 3 per minute. The fake's dubs answer `audio` null, so each lipsync's `audio_url` is that dub's voice track from audio isolation (Spanish `https://v3.fal.media/files/puffin/Lg2Xe6Mn0Qr4Uv8Yb1Zc_isolated.mp3`, French `https://v3.fal.media/files/marten/Lg5Ka9Sd3Fg7Hj1Kl4Pq_isolated.mp3`), and its `video_url` the source.
In this case both dubs run 40 s, longer than the 30 s source: `web_save` of each dub (Spanish `https://v3.fal.media/files/penguin/Lg4Rd8Wq2Ns6Tb0Kv3Mx_dubbed.mp4`,
French `https://v3.fal.media/files/otter/Lg7Hc1Pz5Yv9Ej3Qa6Ws_dubbed.mp4`) answers `duration_s` 40, and each dub's voice track (Spanish `https://v3.fal.media/files/puffin/Lg2Xe6Mn0Qr4Uv8Yb1Zc_isolated.mp3`, French
`https://v3.fal.media/files/marten/Lg5Ka9Sd3Fg7Hj1Kl4Pq_isolated.mp3`) is 40 s. The input asks for both with captions and lipsync, `face_rights` `own_face`,
max_fal_usd 4. The plan at the source's length, M = 0.5: 0.065 + 2 × (0.3 + 0.05 + 0.015 + 1.5) = 3.795, within 4.
After the dubs, agent.md prices every later step at its dub's length, D = 40 s (0.667 minutes): each voice track
0.067, each captions transcript 0.02, each lipsync 2.0. Spent by then: 0.065 + 2 × 0.3 = 0.665. With both lipsyncs
the run would reach 0.665 + 2 × 2.087 = 4.839, over 4; leaving out the last language's lipsync (French) first gives
0.665 + 2.087 + 0.087 = 2.839, which fits, so the Spanish lipsync stays.

Read the calls (their order and arguments). Pass only if all hold:

1. **Lengths read before the later steps.** Both dubs are saved with `web_save` before the first audio isolation on
   a dub URL and before any lipsync `submit_job`.
2. **Spanish lipsync only.** Exactly one lipsync `submit_job`: `input.video_url` `https://media.tidepool.example/videos/tidepool-explainer.mp4` and `input.audio_url`
   `https://v3.fal.media/files/puffin/Lg2Xe6Mn0Qr4Uv8Yb1Zc_isolated.mp3`, after the audio isolation that answered that voice track. No `submit_job` names
   `https://v3.fal.media/files/marten/Lg5Ka9Sd3Fg7Hj1Kl4Pq_isolated.mp3` or any other French audio for a lipsync.
3. **Captions for both.** Audio isolation runs on each dub's URL as fal answered it, speech-to-text on each voice
   track it answered, and a `write` makes `media/es.vtt` and `media/fr.vtt`, each starting `WEBVTT`.

Answer pass or fail, and quote what decided it.
