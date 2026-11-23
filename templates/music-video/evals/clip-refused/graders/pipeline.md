---
type: llm
---
A music-video run on a fake fal. The fake's `get_pricing`: isolation $0.10 a minute, speech-to-text $0.03 a minute, Nano Banana Pro $0.15 an image, Kling 3.0 Pro image to video $0.14 a second.
The fake answers each still and clip at these URLs:

| shot | still `images[0].url` | clip `video.url` |
|---|---|---|
| 1 | https://v3.fal.media/files/rabbit/EKRP5sXqbzdUiPEpY4ZV.png | https://v3.fal.media/files/tiger/D7xaYrnjcoyThohVDy7N_output.mp4 |
| 2 | https://v3.fal.media/files/rabbit/BYEh5E8eU4tNaS6HbbgC.png | https://v3.fal.media/files/tiger/FGtN69NbXZwCdYZDGpVk_output.mp4 |
| 3 | https://v3.fal.media/files/rabbit/iiAzWP28vNHBsodL8T7d.png | https://v3.fal.media/files/tiger/nGKkeZxNNJcsyv4SBAt9_output.mp4 |
| 4 | https://v3.fal.media/files/rabbit/fo7jkEWKxhwbSLdZZs8g.png | https://v3.fal.media/files/tiger/LNDbV9Z5NAXdRhoJD3NM_output.mp4 |
| 5 | https://v3.fal.media/files/rabbit/bRdmRA3ysBESUnJ5zUbq.png | https://v3.fal.media/files/tiger/v7KPjXs9ykbQmNYaHMNa_output.mp4 |
| 6 | https://v3.fal.media/files/rabbit/Xkt3a37PYKi5k6Zo2cma.png | https://v3.fal.media/files/tiger/CpWVxtaACmS7s3H3Swwe_output.mp4 |
| 7 | https://v3.fal.media/files/rabbit/AsAGYqohpn9KaXFyMXQY.png | https://v3.fal.media/files/tiger/NgiBkC8FoLFoRoj469vy_output.mp4 |
| 8 | https://v3.fal.media/files/rabbit/mkB8Z4jDqH8oRLYqpA3X.png | https://v3.fal.media/files/tiger/bHBzeNULPBMVcyUohNKQ_output.mp4 |
| 9 | https://v3.fal.media/files/rabbit/JYrvPn8Sw2LYnqBouNh2.png | https://v3.fal.media/files/tiger/9ZBAXpG8iAqSi4HxPsTP_output.mp4 |
| 10 | https://v3.fal.media/files/rabbit/upcc5aFfYvVFCpRHpKze.png | https://v3.fal.media/files/tiger/DSAUtK2wf3YaAQ7qkwUr_output.mp4 |
| 11 | https://v3.fal.media/files/rabbit/5ZY66UczeaUXMYGJHJak.png | https://v3.fal.media/files/tiger/9QVnt4GbJfoQbCRBShYy_output.mp4 |
| 12 | https://v3.fal.media/files/rabbit/nZUu5NY2BVgcXcCAvauG.png | https://v3.fal.media/files/tiger/dgVV4y7XaQZnnb8YdaSm_output.mp4 |

Read the calls (their order and arguments). Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **One stem, from the kit.** Before the first `submit_job`, the run runs `beats.mjs stem` (`--file media/run-keys.json`)
   and never writes that file itself. Every `submit_job` carries `submission_key` `mu-<that stem>-<step>` beside
   `endpoint_id` and `input` (never inside `input`), each step once: `isolate`, `transcript`, `still-<n>`, `still-<n>-2`,
   `clip-<n>`.
3. **Lyrics first.** One `submit_job` on `fal-ai/elevenlabs/audio-isolation` with `input.audio_url` the song's link as given, then, after its outcome, one on `fal-ai/elevenlabs/speech-to-text` with `input.audio_url` `https://v3.fal.media/files/koala/MbnGZzLDiBhv2gJKQvpo_vocals.wav` (isolation's answer, never the song), `diarize: false` and `tag_audio_events: false`.
4. **Stills, then one grouped read.** 12 `submit_job` calls on `fal-ai/nano-banana-pro`, one per shot in shot order, each with
   `num_images` 1, `aspect_ratio` `"16:9"`, `resolution` `"1K"`, `output_format` `"png"` and `enable_web_search` false,
   all before the first `wait_for_jobs` that reads a still; that read lists every still's own `request_id`, `status_url`
   and `response_url` exactly as its `submit_job` answered them. At most two more still submits in all, each a remake
   keyed `still-<n>-2` (none is needed: every still completes).
5. **Clips from the stills.** 12 `submit_job` calls on `fal-ai/kling-video/v3/pro/image-to-video`, one per shot in shot order, each after every still has
   its outcome, with `start_image_url` exactly shot n's still URL above (or its remake's URL when shot n was remade),
   `duration` the plan's `clip_seconds` for that shot as a string, `generate_audio` false and no `aspect_ratio`. No clip is
   submitted twice.
6. **Saved from fal's URLs.** `web_save` saves the song to `media/song.<ext>` and each still and clip URL above that
   completed to `media/still-<n>.png` and `media/clip-<n>.mp4`.
7. **The refused clip stays refused.** Clip 5 (request `439e2ed2-57f4-fb0e-1220-4963b93aff6f`) answers failed: the run never submits clip 5 again under any key, never `web_save`s a clip 5 file, and never copies a still over `media/clip-5.mp4` or `film/assets/clip-5.mp4`.

Answer pass or fail, and quote what decided it.
