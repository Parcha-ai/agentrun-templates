---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. Before any paid call the run saves the source with `web_save`, which answers its `duration_s` 30 (read from the file's header), so the run prices S = 30 s, M = 0.5 minutes. The source transcript is in English (`language_code` `eng`). Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute; fal bills dubbing in whole minutes, rounded up. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.6 (units 1, a whole minute), each dub's voice 0.05 and its captions transcript 0.015. Every paid call (`run_model`, `submit_job`) carries a `submission_key` beside `endpoint_id` and `input`, `lz-<stem>-<step>` with one random stem of 8 lowercase letters and digits per run; the fake answers a paid call only under its step's key.
The fake fal answers: `submit_job` queues one dub per language, and one grouped `wait_for_jobs` read completes all five:
   Spanish at index 0: request `6f1a2b3c-4d5e-4f60-8a71-b2c3d4e5f601`, video `https://v3.fal.media/files/penguin/Hq7Tz2Lm9Wx4Rb8Kc1Ns_dubbed.mp4`
   French at index 1: request `7a2b3c4d-5e6f-4071-9b82-c3d4e5f60712`, video `https://v3.fal.media/files/otter/Fp3Vn8Qy5Jd2Ga6Ue0Mr_dubbed.mp4`
   German at index 2: request `8b3c4d5e-6f70-4182-ac93-d4e5f6071823`, video `https://v3.fal.media/files/heron/Dk5Ws1Ex7Cr3Tv9By4Lp_dubbed.mp4`
   Italian at index 3: request `ad5e6f70-8192-43a4-8b5c-6d7e8f901a2b`, video `https://v3.fal.media/files/ibis/Mt4Qw8Er2Ty6Ui0Op5As_dubbed.mp4`
   Portuguese at index 4: request `be6f7081-92a3-44b5-9c6d-7e8f901a2b3c`, video `https://v3.fal.media/files/wren/Gb7Hn1Jm5Kl9Zx3Cv8Bn_dubbed.mp4`.
Audio isolation on each dub URL answers that dub's voice track, and speech-to-text on each voice track that language's
transcript (words from about 0.7 s to 28.8 s).

Read the calls (their order and arguments). Pass only if all hold:

1. **Priced before paying.** The source's `web_save` and a `get_pricing` call come before the first `run_model` and
   the first `submit_job`.
2. **Queued together.** The five dub `submit_job` calls come one after another, in the order es, fr, de, it, pt, with
   no other tool call between them, each `input.target_lang` its language, each with its own `submission_key`
   `lz-<stem>-dub-<lang>`; no dub is submitted twice.
3. **Read together.** The first `wait_for_jobs` after them names all five dubs in one `jobs` list, each by the
   `request_id` its `submit_job` answered (Spanish at index 0 ... Portuguese at index 4).
4. **Captions from each dub's voice.** For each language, audio isolation runs on that dub's URL as fal answered it,
   speech-to-text on the voice track it answered, and a `write` makes `media/<lang>.vtt` starting `WEBVTT`, in that
   language. No speech-to-text call gets a dub's video URL (any of the five above) as its `audio_url`.

Answer pass or fail, and quote what decided it.
