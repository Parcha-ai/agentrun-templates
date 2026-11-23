---
type: llm
---
A localize-video run on the real fal, dubbing one AI-narrated explainer clip (about 28 s) into Spanish with captions.
Judge it against the run's own calls and answers (nothing here is known in advance).

Read the calls (their order, arguments and results) and the answer's last fenced `json` block. Pass only if all hold:

1. **Measured, then voice, transcript and price first.** A `web_save` of the input `video_url` comes before every
   `run_model` and `submit_job`, and the answer's `duration_s` is the `duration_s` it answered rounded up to a multiple
   of 10 seconds (a whole multiple stays as it is), at most 120. A `get_pricing` call, one `run_model` on `fal-ai/elevenlabs/audio-isolation` with
   `input.video_url` the input `video_url`, and one `run_model` on `fal-ai/elevenlabs/speech-to-text` whose `input.audio_url` is the `audio.url`
   that audio isolation answered (not the video) come before the `submit_job`.
2. **One dub, followed.** One `submit_job` on `fal-ai/elevenlabs/dubbing` with `target_lang` `es` and the input `video_url`, its
   `submission_key` a top-level argument (not inside `input`); it is followed with `wait_for_jobs` using the handles
   that `submit_job` answered, and never submitted again.
3. **Saved and captioned from fal's URLs.** `web_save` saves the dub's `video.url`, as the wait answered it, to
   `media/es.mp4`; a second audio isolation runs on that same URL (not a `media/...` path), a second speech-to-text on
   the `audio.url` it answered; a `write` makes `media/es.vtt` starting `WEBVTT` with cues in
   `HH:MM:SS.mmm --> HH:MM:SS.mmm` form, in Spanish.
4. **Answer.** `status` is `saved`; `languages` is one entry, `es`, `saved`, with `video_path` `media/es.mp4`,
   `captions_path` `media/es.vtt` and `fal_url` the dub URL; `fal_cost_usd` lists voice, transcript, dub-es, voice-es
   and captions-es at the rates `get_pricing` answered, each `usd` its units × rate, `total` their sum;
   `report_markdown` embeds `![Spanish](media/es.mp4)`.

Answer pass or fail, and quote what decided it.
