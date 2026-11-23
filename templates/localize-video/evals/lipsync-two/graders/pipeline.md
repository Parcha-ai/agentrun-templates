---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. Before any paid call the run saves the source with `web_save`, which answers its `duration_s` 30 (read from the file's header), so the run prices S = 30 s, M = 0.5 minutes. The source transcript is in English (`language_code` `eng`). Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.3, each dub's voice 0.05 and its captions transcript 0.015. Every paid call (`run_model`, `submit_job`) carries a `submission_key` beside `endpoint_id` and `input`, `lz-<stem>-<step>` with one random stem of 8 lowercase letters and digits per run; the fake answers a paid call only under its step's key. Lipsync is fal-ai/sync-lipsync/v2 at 3 per minute: 1.5 a language at M = 0.5. The fake's dubs answer `audio` null, so each lipsync's `audio_url` is that dub's voice track from audio isolation (Spanish `https://v3.fal.media/files/puffin/Ew6Rt1Yu5Io9Pa3Sd7Fg_isolated.mp3`, French `https://v3.fal.media/files/marten/Hj2Kl6Zx0Cv4Bn8Mq1We_isolated.mp3`), and its `video_url` the source.
The fake fal answers: the dubs' grouped `wait_for_jobs` read completes Spanish (index 0, video `https://v3.fal.media/files/penguin/Hq7Tz2Lm9Wx4Rb8Kc1Ns_dubbed.mp4`) and
French (index 1, video `https://v3.fal.media/files/otter/Fp3Vn8Qy5Jd2Ga6Ue0Mr_dubbed.mp4`), each with `audio` null. `submit_job` on fal-ai/sync-lipsync/v2 queues the Spanish lipsync
(request `f2a30415-d6e7-48f9-b0a1-2b3c4d5e6f70`) and the French one (request `03b41526-e7f8-490a-81b2-3c4d5e6f7081`); their grouped read completes Spanish at
index 0 with video `https://v3.fal.media/files/koala/Ls2Dk6Fj0Gh4Jk8Lz1Xc_output.mp4` and French at index 1 with `https://v3.fal.media/files/dingo/Zm5Xn9Cb3Vm7Bq1Wn4Er_output.mp4`.

Read the calls (their order and arguments). Pass only if all hold:

1. **Dubs first.** Both dub `submit_job` calls come before every lipsync `submit_job`, and each lipsync comes after
   the dubs' `wait_for_jobs` read that completed its dub and after the audio isolation that answered its voice track.
2. **The dub's voice on the source's face.** The Spanish lipsync's `input` has `video_url` `https://media.tidepool.example/videos/tidepool-explainer.mp4` and `audio_url`
   `https://v3.fal.media/files/puffin/Ew6Rt1Yu5Io9Pa3Sd7Fg_isolated.mp3`; the French one's `video_url` `https://media.tidepool.example/videos/tidepool-explainer.mp4` and `audio_url` `https://v3.fal.media/files/marten/Hj2Kl6Zx0Cv4Bn8Mq1We_isolated.mp3` (never a dubbed mp4,
   never a `media/...` path); each `input.sync_mode` is `cut_off` or absent and `input.model` is `lipsync-2` or absent.
3. **Queued together, read together.** The two lipsync `submit_job` calls come one after the other with no other call
   between them; the next `wait_for_jobs` names both lipsync jobs in one `jobs` list (by the request ids above); no
   lipsync is submitted twice.
4. **Saved.** `web_save` saves `https://v3.fal.media/files/koala/Ls2Dk6Fj0Gh4Jk8Lz1Xc_output.mp4` to `media/lipsync-es.mp4` and `https://v3.fal.media/files/dingo/Zm5Xn9Cb3Vm7Bq1Wn4Er_output.mp4` to
   `media/lipsync-fr.mp4`, and the dubs to `media/es.mp4` and `media/fr.mp4`.

Answer pass or fail, and quote what decided it.
