---
name: fal-media
description: Make images and short videos with fal.ai through its MCP server (the `fal` server, tools named mcp:fal/<tool>). Covers picking a model and checking its price, run_model versus submit_job, polling without paying twice, saving each output into the run's files, the current model catalog, prompting craft, and the errors fal returns. Use whenever a task asks for a generated image, illustration, social card, thumbnail, or a short clip.
---

# Making media with fal

fal runs hundreds of image, video and audio models behind one queue. You reach it through the `fal` MCP server. The
server holds the owner's fal key: you never see it, never ask for it, and never need it. Every generation bills the
owner's fal account, so pick the cheapest model that does the job and make each call count.

## The tools

| tool | what it does | costs money |
|---|---|---|
| `get_pricing` | price of up to 50 endpoint ids, comma-separated | no |
| `get_model_schema` | an endpoint's input and output fields, with defaults | no |
| `search_models`, `recommend_model` | find an endpoint for a task | no |
| `run_model` | run an endpoint, waiting up to 45 s; answers `completed` with the result, or `processing` with a request id, `status_url` and `response_url` | **yes** |
| `submit_job` | queue a run and answer at once with a request id and its URLs | **yes** |
| `check_job` | a job's status, from its `status_url` | no |
| `get_job_result` | a finished job's output, from its `response_url` | no |
| `cancel_job` | stop a queued or running job | no |
| `upload_file` | put an input (an image the person gave, a frame) on fal's CDN, from a public URL or small base64 | no |

A template may pin `endpoint_id` on `run_model`. Then that is the model, whatever you ask for: don't fight the pin,
and say in your answer which model made the output.

## The one rule that saves money

**A second `run_model` or `submit_job` is a second bill.** When `run_model` answers `processing`, the job is running:
poll it with `check_job` (wait `poll_after_seconds` when it gives one, else 5 s for an image, 15 s for a video), and
when its status is `COMPLETED`, fetch it once with `get_job_result`. Never resubmit to see how it is doing. Never
resubmit after a timeout or a dropped answer either: the job may have run. Check it first.

## The steps

1. **Pick the endpoint.** Use the pinned one when there is a pin. Otherwise start from the catalog below and call
   `get_pricing` on your candidates. Take the cheapest that meets the brief. Note the price for your answer.
2. **Read its schema** with `get_model_schema` the first time you use an endpoint in a run. Field names differ between
   models (`image_size` or `aspect_ratio`, `duration` as a string or a number). Never guess a field.
3. **Run it.** Leave `sync_mode` off (false): on, the image comes back inline as a data URI instead of a URL, too big
   to handle and not kept by fal. `run_model` for an image (most finish in seconds). `submit_job` for a video, then `check_job` and
   `get_job_result`.
4. **Save every output into the run's files** with `web_save` (`url`, `path`), under `media/` with a name that says
   what it is: `media/card-1200x630.png`, `media/intro-5s.mp4`. fal's URLs expire on the owner's account default, so a
   link alone is not a deliverable. If the save fails, say so and give the URL.
5. **Answer** with the saved paths, the endpoint and its price, and the exact prompt you sent.

Results come back as `{"images": [{"url", "width", "height", "content_type"}]}` for images, `{"video": {"url"}}` for
video and `{"audio": {"url"}}` for audio. Read the actual answer; don't assume the shape.

## Model catalog (each id checked against fal's API on 2026-11-20; confirm with `get_pricing` and `search_models`, fal adds models weekly)

### Text to image
| endpoint | use it for |
|---|---|
| `fal-ai/flux/schnell` | drafts, thumbnails, anything cheap and fast (about a second) |
| `fal-ai/nano-banana-pro` | the best general image; good at following long prompts |
| `fal-ai/ideogram/v3` | text inside the image: headlines, signs, posters, social cards |
| `fal-ai/recraft/v4/pro/text-to-image` | design work: layouts, brand-style illustration, typography |
| `fal-ai/flux-pro/v1.1-ultra` | photoreal scenes, up to 2K |
| `fal-ai/flux-pro/kontext` | editing an image you already have, from words and a reference |

### Text to video and image to video
| endpoint | use it for |
|---|---|
| `fal-ai/veo3.1/fast` | the cheaper Veo 3.1; start here |
| `fal-ai/veo3.1` | the strongest general video, with sound |
| `fal-ai/veo3.1/image-to-video` | animating a still: 4, 6 or 8 s, 720p or 1080p |
| `fal-ai/kling-video/v3/pro/image-to-video` | strong motion continuity from a still |

Video costs dollars a clip, images cents. Never pick a video model when the task asks for an image.

## Prompting

### Images
- Be specific. "Brutalist concrete courthouse at dusk, sharp geometric shadows, low side light" beats "a courthouse".
- Name the style: photoreal, editorial illustration, isometric, flat vector, 35 mm film, cel animation.
- Give the composition: "wide shot, subject lower right, empty sky upper left for a headline".
- Say what you want, not what you don't: "tack-sharp" beats "not blurry".
- One subject per image. For a composite, generate the parts and edit with an edit model.
- Text in the image: put the exact words in quotes, keep it under eight words, and use a text-capable model.
- Size for the use: 1200×630 for a link card, 1080×1080 for a square post, 1024×1024 for a draft. Bigger costs more.

### Video
- Describe motion, not just the scene: "the camera dollies in; leaves drift left; she turns her head slowly".
- Give the length and the shot: "6-second close-up".
- For continuity, make a still you like first, then animate it with image to video.

## Errors

- **422**: the input broke the schema. Read `detail`, fix the field, and send a corrected input. Never resend the same
  one.
- **429** or a throttled answer with `retry_after_seconds`: wait that long, then try once more. Run videos one at a
  time.
- **A job `IN_PROGRESS` past 10 minutes**: cancel it with `cancel_job`, say so, and stop. Resubmitting is the person's
  call, since it bills again.
- **`FAILED`**: report the error text as fal gave it. Retry once only when the error says the input was at fault and
  you changed the input.

## Never

- Never put a fal URL in a deliverable as the only copy. Save it first.
- Never generate more variations than asked. Four images when one was asked for costs four times as much.
- Never send private text (an email, a customer's name) in a prompt unless the task is about it: prompts go to fal and
  its model providers.
