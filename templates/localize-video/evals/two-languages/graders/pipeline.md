---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. Before any paid call the run saves the source with `web_save`, which answers its `duration_s` 30 (read from the file's header), so the run prices S = 30 s, M = 0.5 minutes. The source transcript is in English (`language_code` `eng`). Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute; fal bills dubbing in whole minutes, rounded up. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.6 (units 1, a whole minute), each dub's voice 0.05 and its captions transcript 0.015. Every paid call (`run_model`, `submit_job`) carries a `submission_key` beside `endpoint_id` and `input`, `lz-<stem>-<step>` with one random stem of 8 lowercase letters and digits per run; the fake answers a paid call only under its step's key.
The fake fal answers: `submit_job` queues the Spanish dub (request `6f1a2b3c-4d5e-4f60-8a71-b2c3d4e5f601`) and the French dub (request `7a2b3c4d-5e6f-4071-9b82-c3d4e5f60712`);
the grouped `wait_for_jobs` read completes Spanish at index 0 with video URL `https://v3.fal.media/files/penguin/Hq7Tz2Lm9Wx4Rb8Kc1Ns_dubbed.mp4` and French at index 1 with
`https://v3.fal.media/files/otter/Fp3Vn8Qy5Jd2Ga6Ue0Mr_dubbed.mp4`. Audio isolation on each dub URL answers its voice track (`https://v3.fal.media/files/puffin/Ew6Rt1Yu5Io9Pa3Sd7Fg_isolated.mp3`, `https://v3.fal.media/files/marten/Hj2Kl6Zx0Cv4Bn8Mq1We_isolated.mp3`), and
speech-to-text on each voice track answers that language's transcript (words from about 0.7 s to 28.8 s).

Read the calls (their order and arguments) and judge the pipeline. Pass only if all hold:

1. **Measured, then voice and transcript, priced first.** The source's `web_save` (`https://media.tidepool.example/videos/tidepool-explainer.mp4`) comes before every
   `run_model` and `submit_job`; a `get_pricing` call, the source's audio isolation and then the source's
   speech-to-text on the voice track `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3` all come before the first `submit_job`; no speech-to-text call has an mp4
   in `audio_url`.
2. **Queued, then waited.** Both dub `submit_job` calls come before the first `wait_for_jobs`; each carries its own
   `submission_key` as a top-level argument beside `endpoint_id` and `input` (not inside `input`), `lz-<stem>-dub-es`
   and `lz-<stem>-dub-fr`; `input.source_lang` is `en` or absent; no dub is submitted twice.
3. **Saved from fal's URLs.** `web_save` saves the Spanish URL to `media/es.mp4` and the French URL to `media/fr.mp4`.
4. **Captions from the dubs' voices.** Audio isolation runs on each dub URL as fal answered it (not a `media/...`
   path), speech-to-text on each voice track it answered, and `write` calls write `media/es.vtt` and `media/fr.vtt`,
   each starting with `WEBVTT`, cues in `HH:MM:SS.mmm --> HH:MM:SS.mmm` form, Spanish words in the es file and French
   words in the fr file, the first cue starting near 0.7 s and the last ending by 28.8 s.

Answer pass or fail, and quote what decided it.
