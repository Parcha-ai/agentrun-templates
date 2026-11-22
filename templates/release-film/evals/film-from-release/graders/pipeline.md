---
type: llm
---
A release-film run on a fake fal, filming acme/quarry v3.2.0 by hand at the default 16:9. The fake fal queues the
voiceover (`fal-ai/elevenlabs/tts/eleven-v3`, request id 7c1e4a20-3b5d-4f68-9a0c-1d2e3f405162) and the music
(`fal-ai/elevenlabs/music`, request id b8d2f6a4-1c3e-4a5b-8d7f-9e0a1b2c3d4e); a grouped `wait_for_jobs` completes the
voiceover with `https://v3.fal.media/files/zebra/f1Rk2mVo_output.mp3` (23.77 s) and character timestamps, and the music
with `https://v3.fal.media/files/panda/f1Rk2mMu_music.mp3`. The release notes show two screenshots:
`https://github.com/user-attachments/assets/5f0c2a1e-7d43-4b8e-9a61-2c3e8f1d4b70` and
`https://github.com/user-attachments/assets/a93e6b02-1c5d-4f7a-8e29-6d0b4c7f3e15`.

Read the calls (their order, arguments and results) and judge the pipeline. Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`, and `film/STORYBOARD.md` is written
   before the first `submit_job`.
2. **Queued once, read with handles.** Exactly two `submit_job` calls (voiceover and music), both before the first
   `wait_for_jobs`; each `wait_for_jobs` jobs list carries each job's own `request_id`, `status_url` and `response_url`
   as its `submit_job` answered them.
3. **Saved from fal and GitHub.** `web_save` saves the voiceover URL to `media/voiceover.mp3`, the music URL to
   `media/music.mp3`, each screenshot to `media/release-<n>.png` and `https://github.com/acme.png` to
   `media/mark.png`; the voiceover's timestamps are written to `media/voiceover-timestamps.json`.
4. **Made in the sandbox.** Shell commands copy the kit, run `hyperframes lint` and `hyperframes check`, run
   `hyperframes snapshot --review`, and the run views at least one review sheet image with `read`; then
   `hyperframes render` writes `media/film.mp4` (at most 3 render commands) and an `ffprobe` of it shows width 1920,
   height 1080 and a duration between 29.5 and 30.5 s. The share card is made with `hyperframes snapshot` and its
   probe shows 1200x630. No call composes or renders anything on fal (no fal endpoint but the two above).
5. **The screenshots are used.** The composition uses at least one of the saved screenshots (copied into
   `film/assets/` and referenced by a scene), and the mark.

Answer pass or fail, and quote what decided it.
