---
type: llm
---
A music-video run on a fake fal. The fake's `get_pricing`: isolation $0.10 a minute, speech-to-text $0.03 a minute, Nano Banana Pro $0.15 an image, Kling 3.0 Pro image to video $0.14 a second.
The fake answers each still and clip at these URLs:

| shot | still `images[0].url` | clip `video.url` |
|---|---|---|
| 1 | https://v3.fal.media/files/rabbit/GkgWYmDQYoyxtY24Bs9v.png | https://v3.fal.media/files/tiger/D3qZ642azkMaderQMMSD_output.mp4 |
| 2 | https://v3.fal.media/files/rabbit/YwAC9i7Db6PXW3GEVE2y.png | https://v3.fal.media/files/tiger/VSB7ZiwtqQaPAQf3cKEe_output.mp4 |
| 3 | https://v3.fal.media/files/rabbit/zby3sZdkDWFBybAuTkMg.png | https://v3.fal.media/files/tiger/WUjKYEBCDrfdgGJTXz8Y_output.mp4 |
| 4 | https://v3.fal.media/files/rabbit/SSDjwaNSwqb49N26opaG.png | https://v3.fal.media/files/tiger/ShZSTgpGhCSn9HymEHEj_output.mp4 |
| 5 | https://v3.fal.media/files/rabbit/WP5xWruvXeKA9w7RUDq9.png | https://v3.fal.media/files/tiger/5QQLkiFfTbZREmaEBqqD_output.mp4 |
| 6 | https://v3.fal.media/files/rabbit/KGSzJtnkFtMGdEP3YQdb.png | https://v3.fal.media/files/tiger/W5KrMKye7fVpBXKFqV8o_output.mp4 |
| 7 | https://v3.fal.media/files/rabbit/XFpyZgC8rFoKbJaeV7sf.png | https://v3.fal.media/files/tiger/jLFy9PZqZDSH8NdBYQX9_output.mp4 |
| 8 | https://v3.fal.media/files/rabbit/Q5XBaNDPvMEgaX79XS3f.png | https://v3.fal.media/files/tiger/CD4ZwLpznwUHYHnyCzVu_output.mp4 |

Read the calls (their order and arguments). Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **One stem, from the kit.** Before the first `submit_job`, the run runs `beats.mjs stem` (`--file media/run-keys.json`)
   and never writes that file itself. Every `submit_job` carries `submission_key` `mu-<that stem>-<step>` beside
   `endpoint_id` and `input` (never inside `input`), each step once: `isolate`, `transcript`, `still-<n>`, `still-<n>-2`,
   `clip-<n>`.
3. **Lyrics first.** One `submit_job` on `fal-ai/elevenlabs/audio-isolation` with `input.audio_url` the song's link as given, then, after its outcome, one on `fal-ai/elevenlabs/speech-to-text` with `input.audio_url` `https://v3.fal.media/files/koala/FTE96APwWBCEtNRPEyZ7_vocals.mp3` (isolation's answer, never the song), `diarize: false` and `tag_audio_events: false`.
4. **Stills, then one grouped read.** 8 `submit_job` calls on `fal-ai/nano-banana-pro`, one per shot in shot order, each with
   `num_images` 1, `aspect_ratio` `"16:9"`, `resolution` `"1K"`, `output_format` `"png"` and `enable_web_search` false,
   all before the first `wait_for_jobs` that reads a still. At most two more still submits in all, each a remake
   keyed `still-<n>-2` (none is needed: every still completes). That read's handles are not judged here: the repo's
   sent check holds that it lists every still's own `request_id`, `status_url` and `response_url` as answered.
5. **Clips from the stills.** 8 `submit_job` calls on `fal-ai/kling-video/v3/pro/image-to-video`, one per shot in shot order, each after every still has
   its outcome, with `start_image_url` exactly shot n's still URL above (or its remake's URL when shot n was remade),
   `generate_audio` false and no `aspect_ratio`. No clip is submitted twice. Each clip's `duration` is not judged here:
   the repo's sent check holds it to its shot's `clip_seconds` in the run's `film/plan.json`.
6. **Saved from fal's URLs.** `web_save` saves the song to `media/song.<ext>` and each still and clip URL above that
   completed to `media/still-<n>.png` and `media/clip-<n>.mp4`.

Answer pass or fail, and quote what decided it.
