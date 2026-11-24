---
type: llm
---
A music-video run on a fake fal. The fake's `get_pricing`: isolation $0.10 a minute, speech-to-text $0.03 a minute, Nano Banana Pro $0.15 an image, Kling 3.0 Pro image to video $0.14 a second.
The fake answers each still and clip at these URLs:

| shot | still `images[0].url` | clip `video.url` |
|---|---|---|
| 1 | https://v3.fal.media/files/rabbit/RsedDXBYySaZbCPxSNhS.png | https://v3.fal.media/files/tiger/MSUVwuRCUFket7TVUaYQ_output.mp4 |
| 2 | https://v3.fal.media/files/rabbit/wgTFW48jdvUNSqRe4Gxp.png | https://v3.fal.media/files/tiger/CS89VAdVFycL9ZhDJNVd_output.mp4 |
| 3 | https://v3.fal.media/files/rabbit/aK5UCLq7LuLkbVhy4NW2.png | https://v3.fal.media/files/tiger/mxvaVctJdQJ4bJNaW5Hg_output.mp4 |
| 4 | https://v3.fal.media/files/rabbit/pxbuhfXJCHDDwvms2Wx7.png | https://v3.fal.media/files/tiger/seFjYyse2JbPWCCGCdzA_output.mp4 |
| 5 | https://v3.fal.media/files/rabbit/UaJEzCQWJdSyqGqCVJsH.png | https://v3.fal.media/files/tiger/MpKTSzio4FbjHSduDBfA_output.mp4 |
| 6 | https://v3.fal.media/files/rabbit/S7bFt4yEhRNocMahciuA.png | https://v3.fal.media/files/tiger/6RaFEvWtZQr8ZaCfABBq_output.mp4 |
| 7 | https://v3.fal.media/files/rabbit/u2cKsRhdG8JmnHDFqQDs.png | https://v3.fal.media/files/tiger/nGPZqWiY6YnUgxgBhrwA_output.mp4 |
| 8 | https://v3.fal.media/files/rabbit/ckuZib7DSpWBcoRwxu43.png | https://v3.fal.media/files/tiger/5qGSLHSP4MYhnb3z4Mp8_output.mp4 |
| 9 | https://v3.fal.media/files/rabbit/FUZJRXFjYz6uCQ9ZGk9J.png | https://v3.fal.media/files/tiger/LSXYKJJwxKibK6G4HLuU_output.mp4 |
| 10 | https://v3.fal.media/files/rabbit/ziTErMLMwcwFGE5cg4Q2.png | https://v3.fal.media/files/tiger/b2CNZ6cNfe39NthJnSaF_output.mp4 |
| 11 | https://v3.fal.media/files/rabbit/LXbzwgVb2duJCpTvohJm.png | https://v3.fal.media/files/tiger/bmDkycCDcJSojogcAyEB_output.mp4 |
| 12 | https://v3.fal.media/files/rabbit/ZWFudRkimsqsqYdVaPwA.png | https://v3.fal.media/files/tiger/mTCVM2t6hXUDW7FZxwYq_output.mp4 |

Read the calls (their order and arguments). Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **One stem, from the kit.** Before the first `submit_job`, the run runs `beats.mjs stem` (`--file media/run-keys.json`)
   and never writes that file itself. Every `submit_job` carries `submission_key` `mu-<that stem>-<step>` beside
   `endpoint_id` and `input` (never inside `input`), each step once: `isolate`, `transcript`, `still-<n>`, `still-<n>-2`,
   `clip-<n>`.
3. **Lyrics first.** One `submit_job` on `fal-ai/elevenlabs/audio-isolation` with `input.audio_url` the song's link as given, then, after its outcome, one on `fal-ai/elevenlabs/speech-to-text` with `input.audio_url` `https://v3.fal.media/files/koala/7zvv3zs5h83jTTAxzUvC_vocals.wav` (isolation's answer, never the song), `diarize: false` and `tag_audio_events: false`.
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
7. **Pending followed, not resubmitted.** Clip 7 answers `pending` in the grouped read; the run reads it again with `wait_for_jobs` and its own handles (request `ce97d70f-2373-52fe-866f-87790fb60df0`), and never calls `submit_job` for clip 7 a second time.

Answer pass or fail, and quote what decided it.
