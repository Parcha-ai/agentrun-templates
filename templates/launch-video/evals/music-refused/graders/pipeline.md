---
type: llm
---
A launch-video run on a fake fal. The page (Kestrel Field Notes 1.0) says: a notebook app for people who work outdoors (ecologists, surveyors, geologists, field crews); notes, sketches and photos work with no signal and sync on their own when back in range; photos are tagged with GPS location and time and pinned on a map of the site; a day's notes export to CSV or PDF in two taps; free for up to 3 projects, Kestrel Pro $6 a month for unlimited projects and team sharing; available today for iOS and Android.

The fake fal answers: each `submit_job` queues its job with its own handles (each job has its own request id and URLs, keyed by `submission_key` `lv-<stem>-<step>`, the stem the run wrote to `media/run-keys.json`); the grouped `wait_for_jobs` read completes the 6 clips
at indexes 0 to 5 with these video URLs in order: https://v3.fal.media/files/koala/clip1Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip2Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip3Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip4Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip5Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip6Rk2mVn4pLr7TzH_output.mp4; the voiceover at index 6 with `https://v3.fal.media/files/zebra/Vo9Lp3Ok9Ij7Uh5Yg1Tf_output.mp3`, `file_size` 438400 (27.4 s at 128 kbit/s) and character timestamps whose first character starts at 0.06 s and last ends at 27.25 s; the music at
index 7 FAILED (a 422 content-checker refusal). Compose's cut is `https://v3.fal.media/files/lion/Ct5Nm2Bv8Cx1Za4Sd7Fg_composed.mp4`.

Read the calls (their order and arguments) and judge the pipeline. Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **Queued, then waited.** Every `submit_job` (6 clips on `fal-ai/kling-video/v2.5-turbo/pro/text-to-video`, one voiceover, one music) comes before the
   first `wait_for_jobs`, and no job is submitted twice (no two `submit_job` calls with the same `submission_key`, and
   no more than 6 clip submits). That read's handles are not judged here: the repo's sent check holds that it lists
   each job's own `request_id`, `status_url` and `response_url` as answered, no request id under two indexes.
3. **The cut uses what fal answered.** The tracks of the one `run_model` call on `fal-ai/ffmpeg-api/compose` are not
   judged here: the repo's sent check holds the 6 clip URLs in order back to back, the voiceover's URL and
   no music track (the music job failed), and no saved path.
4. **Shots are clean.** No clip prompt asks for a logo, a brand mark, readable text, words or letters, or a person,
   face or hands (a negative prompt that lists them to keep them out is fine).
5. **Saved from fal's URLs.** The `web_save` calls are not judged here: the repo's sent check holds that each URL fal
   answered is saved to its `media/` path.
6. **Captions.** `media/launch.vtt` is not judged here: the repo's sent check holds its form, that its cue words are
   the script's without audio tags, and its timing from the voiceover's timestamps. An answer that says its cues were
   placed by share of words between the timestamps' first and last letters is following the template, not a fault.

Answer pass or fail, and quote what decided it.
