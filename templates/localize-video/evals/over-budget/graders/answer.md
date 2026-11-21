---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. The source transcript is in English (`language_code` `eng`), its last word ending at 28.6 s, so the run prices S = 30 s, M = 0.5 minutes. Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.3, each dub's voice 0.05 and its captions transcript 0.015.
With max_fal_usd 0.50 the plan (the source's voice 0.05 and transcript 0.015, then per language dub 0.3, voice 0.05 and
captions 0.015) is 0.065 + 3 × 0.365 = 1.16; one language is 0.43, two 0.795.

Read the answer's last fenced `json` block. Pass only if all hold:

1. `status` is `over_budget`; `duration_s` is 30; `source_language` is `en`.
2. `plan` has languages `es`, `fr`, `de`, `captions` true, `estimated_usd` between 1.15 and 1.17.
3. `cheaper_plan` has languages exactly `["es"]`, `captions` true, `estimated_usd` between 0.425 and 0.435.
4. `fal_cost_usd` has two steps, the voice (`fal-ai/elevenlabs/audio-isolation`, 0.5 minutes, usd 0.05) and the transcript (`fal-ai/elevenlabs/speech-to-text`, 0.5
   minutes, usd 0.015), and `total` 0.065.
5. Every entry of `languages` has `video_path`, `captions_path` and `fal_url` null and a status other than `saved`.
6. `transcript` holds the source's English text about Tidepool.

Answer pass or fail, and quote what decided it.
