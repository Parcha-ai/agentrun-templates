---
type: llm
---
The source video (https://media.tidepool.example/videos/tidepool-explainer.mp4) is a 30 s AI-narrated explainer for Tidepool, a shared notebook for small research teams. fal's speech-to-text takes audio only: the fake answers speech-to-text on any mp4 (the source or a dub) with fal's 422 `separate_keyed_conversion_required` refusal, as real fal does. So the run takes the voice first: `run_model` on fal-ai/elevenlabs/audio-isolation with `{"video_url": <video>}` answers a voice track (an mp3: the source's is `https://v3.fal.media/files/seal/Vs4Ku9Hb2Nq7Lx3Pe8Wd_isolated.mp3`), and speech-to-text runs on that. Before any paid call the run saves the source with `web_save`, which answers its `duration_s` 30 (read from the file's header), so the run prices S = 30 s, M = 0.5 minutes. The source transcript is in English (`language_code` `eng`). Rates from get_pricing: fal-ai/elevenlabs/audio-isolation 0.1, fal-ai/elevenlabs/speech-to-text 0.03, fal-ai/elevenlabs/dubbing 0.6, each per minute. At M = 0.5: voice 0.05, transcript 0.015, each dub 0.3, each dub's voice 0.05 and its captions transcript 0.015. Every paid call (`run_model`, `submit_job`) carries a `submission_key` beside `endpoint_id` and `input`, `lz-<stem>-<step>` with one random stem of 8 lowercase letters and digits per run; the fake answers a paid call only under its step's key.
Five languages with captions and no lipsync at M = 0.5: 0.065 + 5 × (0.3 + 0.05 + 0.015) = 1.89, within the default
max_fal_usd of 2.

Read the answer's last fenced `json` block. Pass only if all hold:

1. `status` is `saved`; `source_language` is `en`; `duration_s` is 30; `failed_step` and `error` are null; `cheaper_plan` is null.
2. `plan` has languages `es`, `fr`, `de`, `it`, `pt` in that order, `captions` true, `lipsync` false, and
   `estimated_usd` between 1.885 and 1.895: the plan's price is stated.
3. `languages` has five entries, `es`, `fr`, `de`, `it`, `pt` in that order, each `saved`, with `video_path`
   `media/<lang>.mp4`, `captions_path` `media/<lang>.vtt` and `lipsync_path` null.
4. `fal_cost_usd.steps` lists twelve paid steps (voice, transcript, then dub-, voice- and captions- for each language),
   each 0.5 minutes at its rate; `total` is between 1.885 and 1.895 and is the sum of the steps' usd.
5. `report_markdown` embeds each of `media/es.mp4`, `media/fr.mp4`, `media/de.mp4`, `media/it.mp4` and `media/pt.mp4`.

Answer pass or fail, and quote what decided it.
