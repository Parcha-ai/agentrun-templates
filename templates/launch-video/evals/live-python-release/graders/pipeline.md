---
type: llm
---
A live launch-video run on the real fal for Python 3.13.0's release page.

Read the calls (their order, arguments and results) and judge the pipeline against the run's own calls. Pass only if all
hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **Queued, then waited.** The six clip submits on `fal-ai/kling-video/v2.5-turbo/pro/text-to-video`, the voiceover and the music are all submitted before the
   first `wait_for_jobs`; no job is submitted twice (no repeated `submission_key`, no seventh clip). Pending jobs are
   read again with `wait_for_jobs`, never resubmitted.
3. **The cut uses what fal answered.** The one `run_model` call on `fal-ai/ffmpeg-api/compose` has one video track whose six keyframes
   are the six clips' `video.url` values from the `wait_for_jobs` results, in index order, back to back (timestamps
   0, 5000, 10000, 15000, 20000, 25000, each 5000 ms); an audio track with the voiceover's `audio.url` starting at
   about 500 ms; and an audio track with the music's `audio.url` at 0 for 30000 ms. No URL is a saved path or one fal
   didn't answer.
4. **Shots are clean.** No clip prompt asks for a logo, readable text, a screen with words, or a person, face or hands.
5. **Saved.** `web_save` saves every clip, the voiceover, the music and the cut (the `video_url` compose answered,
   followed with `wait_for_jobs` if it answered processing) under `media/`, and a `write` call writes
   `media/launch.vtt` starting with `WEBVTT`.

Answer pass or fail, and quote what decided it.
