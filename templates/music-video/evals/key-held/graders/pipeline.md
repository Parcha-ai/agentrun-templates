---
type: llm
---
A music-video run on a fake fal. The fake's `get_pricing`: isolation $0.10 a minute, speech-to-text $0.03 a minute, Nano Banana Pro $0.15 an image, Kling 3.0 Pro image to video $0.14 a second.
The fake answers each still and clip at these URLs:

| shot | still `images[0].url` | clip `video.url` |
|---|---|---|
| 1 | https://v3.fal.media/files/rabbit/WHDrNUFy94Mi8jVMaW9X.png | https://v3.fal.media/files/tiger/9RyocLKQa2RZznopvFos_output.mp4 |
| 2 | https://v3.fal.media/files/rabbit/pL2ZEMXSGpDCnWNaLYys.png | https://v3.fal.media/files/tiger/LzuFEc3K2HSTAkngW25H_output.mp4 |
| 3 | https://v3.fal.media/files/rabbit/HmDj58nA2EG7q2iXdEmS.png | https://v3.fal.media/files/tiger/YBjURe4VXLcGhGvm2RpU_output.mp4 |
| 4 | https://v3.fal.media/files/rabbit/SC7JwbCRQMx3fJJPng4S.png | https://v3.fal.media/files/tiger/qwVLHxwqTeLN9YCQ6ETA_output.mp4 |
| 5 | https://v3.fal.media/files/rabbit/x4QLX6RnhMYD5cXMLbV2.png | https://v3.fal.media/files/tiger/nY6weXj8i8dJ5FsZQxN5_output.mp4 |
| 6 | https://v3.fal.media/files/rabbit/Uy4DbWu2TQp9MQCoLMza.png | https://v3.fal.media/files/tiger/arFXXPHmbvjdNXDfSWyo_output.mp4 |
| 7 | https://v3.fal.media/files/rabbit/QKDioiCcvQWXaZVJRE8W.png | https://v3.fal.media/files/tiger/JJk47Kk5Y6DXybm8DSM6_output.mp4 |
| 8 | https://v3.fal.media/files/rabbit/9YACxz767ag45Ucs2j2L.png | https://v3.fal.media/files/tiger/BzsXAzEUdzSXZFEciU3b_output.mp4 |
| 9 | https://v3.fal.media/files/rabbit/Q6juxg9hd7Tm6JARYCAk.png | https://v3.fal.media/files/tiger/JWoj74Laa9MCKbT2eBPR_output.mp4 |
| 10 | https://v3.fal.media/files/rabbit/HMUP9NGYVX6ws43rqzGi.png | https://v3.fal.media/files/tiger/FY4rHNzaxevtgZWCsZg9_output.mp4 |
| 11 | https://v3.fal.media/files/rabbit/wRDTF8p2yQhGgaaQvKVo.png | https://v3.fal.media/files/tiger/AVWhUkfMthxZKAhpA8D6_output.mp4 |
| 12 | https://v3.fal.media/files/rabbit/6MjBc4FaacLuat9RicBC.png | https://v3.fal.media/files/tiger/oJE22cxE7DDLGG9TyuGb_output.mp4 |

Read the calls (their order and arguments). Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **One stem, from the kit.** Before the first `submit_job`, the run runs `beats.mjs stem` (`--file media/run-keys.json`)
   and never writes that file itself. Every `submit_job` carries `submission_key` `mu-<that stem>-<step>` beside
   `endpoint_id` and `input` (never inside `input`), each step once: `isolate`, `transcript`, `still-<n>`, `still-<n>-2`,
   `clip-<n>`.
3. **No lyrics.** `lyrics` is false: no `submit_job` on `fal-ai/elevenlabs/audio-isolation` or `fal-ai/elevenlabs/speech-to-text`.
4. **Stills, then one grouped read.** 12 `submit_job` calls on `fal-ai/nano-banana-pro`, one per shot in shot order, each with
   `num_images` 1, `aspect_ratio` `"16:9"`, `resolution` `"1K"`, `output_format` `"png"` and `enable_web_search` false,
   all before the first `wait_for_jobs` that reads a still. At most two more still submits in all, each a remake
   keyed `still-<n>-2` (none is needed: every still completes). That read's handles are not judged here: the repo's
   sent check holds that it lists every still's own `request_id`, `status_url` and `response_url` as answered.
5. **Clips from the stills.** 12 `submit_job` calls on `fal-ai/kling-video/v3/pro/image-to-video`, one per shot in shot order, each after every still has
   its outcome, with `start_image_url` exactly shot n's still URL above (or its remake's URL when shot n was remade),
   `generate_audio` false and no `aspect_ratio`. No clip is submitted twice. Each clip's `duration` is not judged here:
   the repo's sent check holds it to its shot's `clip_seconds` in the run's `film/plan.json`.
6. **Saved from fal's URLs.** `web_save` saves the song to `media/song.<ext>` and each still and clip URL above that
   completed to `media/still-<n>.png` and `media/clip-<n>.mp4`.
7. **The held key.** `submit_job` for clip 3 answers 409 (`submission_key_conflict`). The run never submits a clip for shot 3 again, under that key or any other, and never `web_save`s a clip 3 file: the held job's output, made from other inputs, is not taken. So there are exactly 12 clip submits, clip 3's included.

Answer pass or fail, and quote what decided it.
