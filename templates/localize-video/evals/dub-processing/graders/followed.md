---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. The source transcript is in English (`language_code` `eng`), its last word ending at 28.6 s, so the run prices S = 30 s, M = 0.5 minutes. Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.3, each dub's voice 0.05 and its captions transcript 0.015.
The fake fal answers: `submit_job` queues the Spanish dub (request `6f1a2b3c-4d5e-4f60-8a71-b2c3d4e5f601`) and the German dub (request
`8b3c4d5e-6f70-4182-ac93-d4e5f6071823`). The grouped `wait_for_jobs` read completes Spanish (index 0, video `https://v3.fal.media/files/penguin/Hq7Tz2Lm9Wx4Rb8Kc1Ns_dubbed.mp4`) and answers German
(index 1) `pending` with `poll_after_seconds` 10. A `wait_for_jobs` read naming only the German job completes it with
video `https://v3.fal.media/files/heron/Dk5Ws1Ex7Cr3Tv9By4Lp_dubbed.mp4`. Captions are off. Expected cost: voice 0.05, transcript 0.015, dub-es 0.3, dub-de 0.3; total 0.665.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **Followed, not resubmitted.** After the read that answered German pending, a later `wait_for_jobs` reads the
   German job (request `8b3c4d5e-6f70-4182-ac93-d4e5f6071823`) with its handles; there is no `submit_job` after the first `wait_for_jobs`, and
   exactly one `submit_job` has `target_lang` `de`.
2. **Saved.** `web_save` saves `https://v3.fal.media/files/penguin/Hq7Tz2Lm9Wx4Rb8Kc1Ns_dubbed.mp4` to `media/es.mp4` and `https://v3.fal.media/files/heron/Dk5Ws1Ex7Cr3Tv9By4Lp_dubbed.mp4` to `media/de.mp4`.
3. **No captions.** No `.vtt` file is written, no audio isolation or speech-to-text runs on a dub, and each
   language's `captions_path` is null.
4. **Answer.** `status` is `saved`; both languages `saved` with their `video_path` and `fal_url`; `fal_cost_usd.steps`
   are voice, transcript, dub-es and dub-de (no captions steps), `total` between 0.66 and 0.67 and the sum of the
   steps; `report_markdown` embeds `![Spanish](media/es.mp4)` and `![German](media/de.mp4)`.

Answer pass or fail, and quote what decided it.
