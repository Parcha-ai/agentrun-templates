---
type: llm
---
A music-video run on a fake fal. The fake's `get_pricing`: isolation $0.10 a minute, speech-to-text $0.03 a minute, Nano Banana Pro $0.15 an image, Kling 3.0 Pro image to video $0.14 a second.
The fake answers each still and clip at these URLs:

| shot | still `images[0].url` | clip `video.url` |
|---|---|---|
| 1 | https://v3.fal.media/files/rabbit/GM32NwPxgLqfqwHdKHZR.png | https://v3.fal.media/files/tiger/RGXD8NUDPTj7xsbqNiYA_output.mp4 |
| 2 | https://v3.fal.media/files/rabbit/W7gzWMJ8jexsGGKvc855.png | https://v3.fal.media/files/tiger/yBmRhDxkENLJEs4CM4A2_output.mp4 |
| 3 | https://v3.fal.media/files/rabbit/JbBv8PSgJW2hGTRsTQEe.png | https://v3.fal.media/files/tiger/CMSBUTqZhjT3HxQfuFFk_output.mp4 |
| 4 | https://v3.fal.media/files/rabbit/tQrw4SZ3vkyYx2MzsH3K.png | https://v3.fal.media/files/tiger/6uR9rCZu6mLYiGrD4JFX_output.mp4 |
| 5 | https://v3.fal.media/files/rabbit/XDKV64psYWZUSEm76aEn.png | https://v3.fal.media/files/tiger/hkzeHXJ3LUtFM6SKgwZy_output.mp4 |
| 6 | https://v3.fal.media/files/rabbit/2CM9JEAnjZW4WWU824YR.png | https://v3.fal.media/files/tiger/3A5jWHtmGhJkTrEeqxLe_output.mp4 |
| 7 | https://v3.fal.media/files/rabbit/4Yi68ZhMXUPyKgc7biUr.png | https://v3.fal.media/files/tiger/btiFN2N5kjfXAdTFju9B_output.mp4 |
| 8 | https://v3.fal.media/files/rabbit/4ksTSpxDWnqN7gXYgQx2.png | https://v3.fal.media/files/tiger/byrEu79UbJoTchaRU5LZ_output.mp4 |
| 9 | https://v3.fal.media/files/rabbit/XiQ6646HykwCiaxPoGA3.png | https://v3.fal.media/files/tiger/K95KjeD6VSHZ2x6sPPLH_output.mp4 |
| 10 | https://v3.fal.media/files/rabbit/MRS33ZqyChCrsXNca5y4.png | https://v3.fal.media/files/tiger/p4UvWPGobumJXMXS3YCA_output.mp4 |
| 11 | https://v3.fal.media/files/rabbit/JHvsVFWdmFjyjKMhWtq4.png | https://v3.fal.media/files/tiger/tRnK47RX5dPLbYGK63UA_output.mp4 |
| 12 | https://v3.fal.media/files/rabbit/ADHuuraCX9WvbiYrJd6u.png | https://v3.fal.media/files/tiger/hN7sp2mRZeRcjYXdZ2kq_output.mp4 |

Read the calls (their order and arguments). Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **One stem, from the kit.** Before the first `submit_job`, the run runs `beats.mjs stem` (`--file media/run-keys.json`)
   and never writes that file itself. Every `submit_job` carries `submission_key` `mu-<that stem>-<step>` beside
   `endpoint_id` and `input` (never inside `input`), each step once: `isolate`, `transcript`, `still-<n>`, `still-<n>-2`,
   `clip-<n>`.
3. **Lyrics first.** One `submit_job` on `fal-ai/elevenlabs/audio-isolation` with `input.audio_url` the song's link as given, then, after its outcome, one on `fal-ai/elevenlabs/speech-to-text` with `input.audio_url` `https://v3.fal.media/files/koala/pViFNYJgMyGrRQcngxVN_vocals.wav` (isolation's answer, never the song), `diarize: false` and `tag_audio_events: false`.
4. **Stills, then one grouped read.** 12 `submit_job` calls on `fal-ai/nano-banana-pro`, one per shot in shot order, each with
   `num_images` 1, `aspect_ratio` `"9:16"`, `resolution` `"1K"`, `output_format` `"png"` and `enable_web_search` false,
   all before the first `wait_for_jobs` that reads a still. At most two more still submits in all, each a remake
   keyed `still-<n>-2` (none is needed: every still completes). That read's handles are not judged here: the repo's
   sent check holds that it lists every still's own `request_id`, `status_url` and `response_url` as answered.
5. **Clips from the stills.** 12 `submit_job` calls on `fal-ai/kling-video/v3/pro/image-to-video`, one per shot in shot order, each after every still has
   its outcome, with `start_image_url` exactly shot n's still URL above (or its remake's URL when shot n was remade),
   `duration` the plan's `clip_seconds` for that shot as a string, `generate_audio` false and no `aspect_ratio`. No clip is
   submitted twice.
6. **Saved from fal's URLs.** `web_save` saves the song to `media/song.<ext>` and each still and clip URL above that
   completed to `media/still-<n>.png` and `media/clip-<n>.mp4`.

Answer pass or fail, and quote what decided it.
