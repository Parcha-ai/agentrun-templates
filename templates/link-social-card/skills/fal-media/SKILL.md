---
name: fal-media
description: Make images and short videos with fal.ai through its MCP server (the `fal` server, tools named mcp:fal/<tool>). Covers picking a model and checking its price, run_model versus submit_job, following a job without paying twice, saving each output into the run's files, the current model catalog, prompting craft, and the errors fal returns. Use whenever a task asks for a generated image, illustration, social card, thumbnail, or a short clip.
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
| `run_model` | run an endpoint and wait a short, bounded time; answers `completed` with the result, or `processing` with `request_id`, `status_url` and `response_url` | **yes** |
| `submit_job` | queue a run and answer at once with `request_id`, `status_url` and `response_url` | **yes** |
| `wait_for_jobs` | read 1 to 32 jobs by their handles, waiting up to 40 s; gives each job's outcome and any ready result; never submits or reruns | no |
| `get_submission` | after a lost reply, look a `submission_key` up in fal's journal: the original job's handles, a rejection, `not_found` or `submission_unknown` | no |
| `cancel_job` | stop a queued or running job; only when the person asks | no |
| `upload_file` | put an input (an image the person gave, a frame) on fal's CDN, from a public URL or small base64 | no |

A template may pin `endpoint_id` on `run_model`. Then that is the model, whatever you ask for: don't fight the pin,
and say in your answer which model made the output.

## The one rule that saves money

**A second `run_model` or `submit_job` is a second bill**, unless it carries the same `submission_key` and the exact
same request: that recovers the first job instead of billing again.

- Make one random `submission_key` per generation you mean to make (letters, digits and `._:-`, up to 128; a UUID
  works), send it with the paid call, and keep it for every retry of that generation. A new key is a new bill.
- When `run_model` answers `processing`, the job is running. Never call `run_model` again for it: read it with
  `wait_for_jobs` and its original handles, `{"jobs": [{"index": 0, "endpoint_id", "request_id", "status_url",
  "response_url"}]}`. While a job is pending, wait the `poll_after_seconds` it gives before the next read. A completed
  job's result comes in the same answer; read it once more, with `read_mode: "result"`, only if the answer left it out.
- After a timeout, a lost reply or an answer you can't read, call `get_submission` with the same key before anything
  else. Follow the handles it returns with `wait_for_jobs`. `not_found` or `submission_unknown` never authorizes a new
  paid generation: say what happened and stop.

## The steps

1. **Pick the endpoint.** Use the pinned one when there is a pin. Otherwise start from the catalog below and call
   `get_pricing` on your candidates. Take the cheapest that meets the brief. Note the price for your answer.
2. **Read its schema** with `get_model_schema` the first time you use an endpoint in a run. Field names differ between
   models (`image_size` or `aspect_ratio`, `duration` as a string or a number). Never guess a field.
3. **Run it.** Leave `sync_mode` off (false): on, the image comes back inline as a data URI instead of a URL, too big
   to handle and not kept by fal. `run_model` for an image (most finish in seconds). `submit_job` for a video, then
   `wait_for_jobs`. Either way, with the generation's `submission_key`.
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

- **422**: the input broke the schema, and nothing was billed. Read `detail`, fix the field, and send the corrected
  input once, with a new key (a changed request under the old key is rejected). Never resend the same one.
- **A refusal** (content policy, safety checker): a definite answer. Report it in fal's words; don't send it again.
- **429** or a throttled answer with `retry_after_seconds`: wait that long, then try once more with the same key and
  the exact same request. Run videos one at a time.
- **A job still pending past 10 minutes**: stop waiting, give its request id and say it may still finish. Cancel it
  only if the person asks.
- **`FAILED`**: report the error text as fal gave it. Retry once only when the error says the input was at fault and
  you changed the input (with a new key).

## Never

- Never put a fal URL in a deliverable as the only copy. Save it first.
- Never generate more variations than asked. Four images when one was asked for costs four times as much.
- Never send private text (an email, a customer's name) in a prompt unless the task is about it: prompts go to fal and
  its model providers.
