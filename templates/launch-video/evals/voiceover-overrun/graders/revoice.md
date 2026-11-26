---
type: llm
---
A 30 s launch-video run on a fake fal. The page (Kestrel Field Notes 1.0) says: a notebook app for people who work outdoors (ecologists, surveyors, geologists, field crews); notes, sketches and photos work with no signal and sync on their own when back in range; photos are tagged with GPS location and time and pinned on a map of the site; a day's notes export to CSV or PDF in two taps; free for up to 3 projects, Kestrel Pro $6 a month for unlimited projects and team sharing; available today for iOS and Android.

The fake fal answers: each `submit_job` queues its job with its own handles (each job has its own request id and URLs,
keyed by `submission_key` `lv-<stem>-<step>`, the stem the run wrote to `media/run-keys.json`). The grouped `wait_for_jobs` read completes the 6
clips at indexes 0 to 5 with these video URLs in order: https://v3.fal.media/files/koala/clip1Rk2mVn4pLr7TzH_output.mp4
through https://v3.fal.media/files/koala/clip6Rk2mVn4pLr7TzH_output.mp4 (the digit after `clip` is the clip's number);
the FIRST voiceover at index 6 with `https://v3.fal.media/files/zebra/Vo9Lp3Ok9Ij7Uh5Yg1Tf_output.mp3` and `file_size`
505600 (31.6 s at 128 kbit/s: over the 29 s a 30 s cut holds); the music at index 7 with
`https://v3.fal.media/files/panda/Mb4Qw8Er1Ty4Ui6Hc7Vb_music.mp3`. The re-voice (key
`lv-<stem>-voiceover-2`, request id `6b8d0f2a-4c5e-4a7b-9d1f-3e5a7c9b1d2f`) completes with
`https://v3.fal.media/files/zebra/Vt2Xc6Bn8Mq4Wr1Ez5Ka_output.mp3`, `file_size` 409600 (25.6 s) and character
timestamps whose first character starts at 0.06 s and last ends at 25.45 s. Compose's cut is
`https://v3.fal.media/files/lion/Ct5Nm2Bv8Cx1Za4Sd7Fg_composed.mp4`.

Read the calls (their order and arguments). Let W1 be the words of the first `submit_job` on
`fal-ai/elevenlabs/tts/eleven-v3` (its `input.text`, audio tags not counted) and W2 those of the second. Pass only if all hold:

1. **Priced, queued, waited.** `get_pricing` comes before the first `submit_job`; the 6 clips, the first voiceover and
   the music are all submitted before the first `wait_for_jobs`. That read's handles are not judged here: the repo's
   sent check holds that it lists each job's own `request_id`, `status_url` and `response_url` as answered, no request
   id under two indexes.
2. **One re-voice, shorter, after the overrun was seen.** The second voiceover `submit_job` has a different
   `submission_key` from the first (the `-voiceover-2` key). It adds no claim the page doesn't make. There is no third
   voiceover and no second submit of any clip or the music. That it comes after the `wait_for_jobs` that answered the
   first voiceover's `file_size`, with the same `voice` and `stability`, and that W2 is less than W1 and at most
   0.87 × W1, is not judged here: the repo's sent check holds it.
3. **The cut uses the second voiceover.** The one `run_model` call on `fal-ai/ffmpeg-api/compose` comes after the
   second voiceover completed. Its tracks are not judged here: the repo's sent check holds the 6 clip URLs in clip
   order back to back, the second voiceover's URL, the music's, and the first voiceover's URL in no track.
4. **Saved.** The `web_save` calls are not judged here: the repo's sent check holds that each URL fal answered (both
   voiceovers included) is saved to its `media/` path.
5. **Captions end within the narration.** `media/launch.vtt` is not judged here: the repo's sent check holds its form,
   that its cue words are the second script's without audio tags, and that the first cue starts between 0.5 and 0.7 s
   and the last ends between 24.5 and 26.1 s. An answer that says its cues were placed by share of words between the
   timestamps' first and last letters is following the template, not a fault.

Then read the answer's last fenced `json` block. Rates: Kling 0.07/s, ElevenLabs v3 0.10 per 1000 characters, music
0.60/min, compose 0.0002/s. Also pass only if all hold:

6. **Status.** `status` is `saved`, `failed_step` and `error` null.
7. **Length and source.** `voiceover_seconds` is 25.6 (25.55 to 25.65), `voiceover_seconds_source` is `file_size`, and
   `voiceover_takes` lists two takes in order: step `voiceover` with `file_size` 505600 and 31.6 s (31.55 to 31.65),
   then step `voiceover-2` with `file_size` 409600 and 25.6 s.
8. **The script in the cut.** `script` is the second voiceover's text and `word_count` matches W2 within 5 words.
9. **Cost.** `fal_cost_usd.steps` lists the 6 clips, `voiceover` and `voiceover-2` (each its own text's characters
   ÷ 1000 × 0.10, within a cent), the music and the cut; `total` is their sum and between 2.42 and 2.60. The Kling plan
   in `plans` has a `revoice_reserve_usd` between 0.02 and 0.09, counted in its `estimated_usd`.
10. **Report.** `report_markdown` embeds `![Launch video](media/launch.mp4)` and states both voiceover lengths (31.6 s
   and 25.6 s) and that the first was too long for the cut.

Answer pass or fail, and quote what decided it.
