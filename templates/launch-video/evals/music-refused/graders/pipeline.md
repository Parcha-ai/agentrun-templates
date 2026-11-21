---
type: llm
---
A launch-video run on a fake fal. The page (Kestrel Field Notes 1.0) says: a notebook app for people who work outdoors (ecologists, surveyors, geologists, field crews); notes, sketches and photos work with no signal and sync on their own when back in range; photos are tagged with GPS location and time and pinned on a map of the site; a day's notes export to CSV or PDF in two taps; free for up to 3 projects, Kestrel Pro $6 a month for unlimited projects and team sharing; available today for iOS and Android.

The fake fal answers: each `submit_job` queues its job with its own handles (each job has its own request id and URLs, keyed by `submission_key` `lv-20261120-kestrel-notes.example-<step>`); the grouped `wait_for_jobs` read completes the 6 clips
at indexes 0 to 5 with these video URLs in order: https://v3.fal.media/files/koala/clip1Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip2Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip3Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip4Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip5Rk2mVn4pLr7TzH_output.mp4, https://v3.fal.media/files/koala/clip6Rk2mVn4pLr7TzH_output.mp4; the voiceover at index 6 with `https://v3.fal.media/files/zebra/Vo9Lp3Ok9Ij7Uh5Yg1Tf_output.mp3`, `file_size` 438400 (27.4 s at 128 kbit/s) and character timestamps whose first character starts at 0.06 s and last ends at 27.25 s; the music at
index 7 FAILED (a 422 content-checker refusal). Compose's cut is `https://v3.fal.media/files/lion/Ct5Nm2Bv8Cx1Za4Sd7Fg_composed.mp4`.

Read the calls (their order and arguments) and judge the pipeline. Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **Queued, then waited.** Every `submit_job` (6 clips on `fal-ai/kling-video/v2.5-turbo/pro/text-to-video`, one voiceover, one music) comes before the
   first `wait_for_jobs`, and no job is submitted twice (no two `submit_job` calls with the same `submission_key`, and
   no more than 6 clip submits). The `wait_for_jobs` jobs list carries each job's own `request_id`, `status_url` and
   `response_url` exactly as its `submit_job` answered them: no request id appears under two indexes.
3. **The cut uses what fal answered.** The one `run_model` call on `fal-ai/ffmpeg-api/compose` has `input.tracks` with:
   - exactly one video track whose keyframes are the 6 clip URLs above, in that order, back to back: timestamps 0,
     5000, 10000 ... each 5000 ms long;
   - an audio track with one keyframe: url `https://v3.fal.media/files/zebra/Vo9Lp3Ok9Ij7Uh5Yg1Tf_output.mp3`, timestamp 500 (anything from 0 to 1000 passes), duration at most 30000;
   - no music track (the music job failed, so there is no music URL to use).
   No URL in the tracks is a saved path (`media/...`) or a URL fal did not answer.
4. **Shots are clean.** No clip prompt asks for a logo, a brand mark, readable text, words or letters, or a person,
   face or hands (a negative prompt that lists them to keep them out is fine).
5. **Saved from fal's URLs.** `web_save` saves each clip URL to `media/clip-<n>.mp4` (n from 1, in index order), the
   voiceover URL to `media/voiceover.mp3` and the cut URL to `media/launch.mp4`.
6. **Captions.** A `write` call writes `media/launch.vtt` starting with `WEBVTT`, with cues in
   `HH:MM:SS.mmm --> HH:MM:SS.mmm` form, timed from the voiceover's `timestamps`: the first cue starts between
   0.5 and 0.7 s and the last ends between 26.5 and 27.9 s (the narration ends at 0.5 + 27.4 = 27.9 s; a last cue
   ending after 27.9 s runs past the speech and fails), and the cue text is the script's words without audio tags.
   An answer that says its cues were placed by share of words between the timestamps' first and last letters is
   following the template, not a fault.

Answer pass or fail, and quote what decided it.
