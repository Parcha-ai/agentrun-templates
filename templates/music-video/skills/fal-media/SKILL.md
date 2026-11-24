---
name: fal-media
description: Make the pieces of a music video with fal.ai through its MCP server (the `fal` server, tools named mcp:fal/<tool>). Covers checking prices, submit_job and following several jobs at once without paying twice, the run's key stem, saving each output into the run's files, the exact inputs and outputs of ElevenLabs audio isolation and speech-to-text, Nano Banana Pro text to image and Kling 3.0 Pro image to video, prompting stills and motion for a music video, and the errors fal returns. Use whenever the music video's lyrics, stills or clips are made.
---

# Making a music video's pieces with fal

fal runs hundreds of image, video and audio models behind one queue. You reach it through the `fal` MCP server. The
server holds the owner's fal key: you never see it, never ask for it, and never need it. Every generation bills the
owner's fal account, so make each call count.

## The tools

| tool | what it does | costs money |
|---|---|---|
| `get_pricing` | the price of endpoints (`endpoint_ids: [...]`) | no |
| `get_model_schema` | an endpoint's input and output fields, with defaults | no |
| `submit_job` | queue one run and answer at once with `endpoint_id`, `request_id`, `status_url` and `response_url` | **yes** |
| `wait_for_jobs` | read 1 to 32 jobs by their handles, waiting up to 40 s; gives each job's outcome and any ready result; never submits or reruns | no |
| `get_submission` | after a lost reply, look a `submission_key` up in fal's journal: the original job's handles, a rejection, `not_found` or `submission_unknown` | no |

This template pins `submit_job` to four endpoints: `fal-ai/elevenlabs/audio-isolation`,
`fal-ai/elevenlabs/speech-to-text`, `fal-ai/nano-banana-pro` and `fal-ai/kling-video/v3/pro/image-to-video`. Any other
endpoint is refused before it is sent. There is no `run_model` and no `submit_jobs`: each job is its own `submit_job`.

## The one rule that saves money

**A second `submit_job` is a second bill**, unless it carries the same `submission_key` and the exact same request:
that recovers the first job instead of billing again.

- Each job has its own `submission_key` (the template's `mu-<stem>-<step>`), sent as its own argument beside
  `endpoint_id` and `input` (never inside `input`), and kept for every retry of that job. A new key is a new bill.
- A job that answered is queued, even if it isn't finished: read it with `wait_for_jobs` and its original handles,
  `{"jobs": [{"index": 0, "endpoint_id", "request_id", "status_url", "response_url"}]}`. Copy each handle exactly as fal
  returned it, character for character: never build, shorten or extend a URL. While a job is pending, wait the
  `poll_after_seconds` it gives before the next read. A completed job's result comes in the same answer; when a
  grouped answer leaves a job's full result out (its byte limit), read that job alone with `read_mode: "result"`.
- After a timeout, a lost reply or an answer you can't read, call `get_submission` with the same key before anything
  else, and follow the handles it returns with `wait_for_jobs`. `not_found` or `submission_unknown` never authorizes a
  new paid generation: that step is failed.
- If fal rejects a key as already used for a different request (a resumed run whose inputs changed), the run before
  sent that job and fal may have billed it: never send it again under another key, and never take its output, made
  from other inputs. That job is failed, named by its key.

## Several jobs at once

1. **Price the whole plan first**, with one `get_pricing` call on every endpoint of the plan. The kit's script adds it
   up, and the answer says it before anything is paid. Over a ceiling the user set (`max_fal_usd`), no paid call at
   all; with none set, nothing is refused for price.
2. **Queue each job with its own `submit_job` call**, all of a stage (every still, then every clip) before any
   `wait_for_jobs`, with nothing else in between. Keep each job's handles.
3. **Read them in one `wait_for_jobs` call**: one item per job, `index` the job's place in the stage (shot n at n − 1),
   with each job's own handles. Match each answer to its job by `index` and `request_id`.
4. **Only the jobs still pending get read again**, after the `poll_after_seconds` the answer gives, each with its
   original `index` and handles. Never re-read a job that already has an outcome, and never submit a pending job
   again. Stop after 10 minutes: what is still pending is failed (give its request id; it may still finish).
5. **A job that failed stays failed.** Note fal's words and finish everything that doesn't need it.
6. **A job that needs another's output waits for it**: speech-to-text takes isolation's vocals URL; each clip takes
   its still's URL. Submit it only once the job it uses has completed.

## Save every output

`web_save` (`url`, `path`) each output from the URL fal answered, under `media/`: `media/still-3.png`,
`media/clip-3.mp4`. fal's URLs expire, so a link alone is not a deliverable. `web_save` never overwrites: a path in
use is refused (a resumed run keeps what it saved). Never judge a file by its size: you can `read` a still to look at
it, and the kit's `place` checks every clip with ffprobe.

## The four models

Each model's fields are fal's own schema (fal's OpenAPI, read 2026-11-23). Send exactly the inputs agent.md gives;
read `get_model_schema` only if a call answers 422. Never send `sync_mode`.

### `fal-ai/elevenlabs/audio-isolation`: the vocals of a song, $0.10 a minute of the input
- `audio_url`: the song's public link. Answers `{"audio": {"url", "content_type", "file_name", "file_size"}}`: the
  vocals alone, on fal's CDN. Billed by the song's whole length.

### `fal-ai/elevenlabs/speech-to-text`: the words with their times, $0.03 a minute of the input
- `audio_url` (required): the vocals' `audio.url` from isolation, never the song with its music. `diarize: false` and
  `tag_audio_events: false` (one singer; sound events aren't lyrics). Leave `language_code` out: it is detected.
- Answers `{"text", "language_code", "language_probability", "words": [{"text", "start", "end", "type", "speaker_id"}]}`,
  `type` one of `word`, `spacing`, `audio_event`, times in seconds of the input. An instrumental answers no words (or
  only spacing): that is a correct answer, not a failure. Save the whole answer as fal gave it; the kit reads it.

### `fal-ai/nano-banana-pro`: a still from words, $0.15 an image at 1K
- `prompt` (required), `num_images` (1: each job is one image, which is what the price counts), `aspect_ratio` (the
  film's: `"16:9"` or `"9:16"`; the default is 1:1, so always send it), `resolution` (`"1K"`; 4K costs double),
  `output_format` (`"png"`), `enable_web_search` (`false`: true adds cost and pulls pictures from the web, the way a real
  person's likeness or a logo gets in). Leave `limit_generations` at its default.
- Answers `{"images": [{"url", "content_type", "file_name", "file_size", "width", "height"}], "description"}`.
- It follows long prompts well and draws text when asked: never ask for any, and end every prompt with "No text, no
  lettering, no logos."

### `fal-ai/kling-video/v3/pro/image-to-video`: a clip from a still, $0.112 a second with audio off
- `start_image_url` (required: the still's `images[0].url` exactly as fal answered it), `prompt` (up to 2500
  characters: the motion), `duration` (a string, `"3"` to `"15"`: the shot's `clip_seconds`), `generate_audio`
  (**always `false`**: its default is true, which bills $0.168 a second and puts sound the film doesn't use into the
  clip), `negative_prompt` (as agent.md gives it). No aspect field: the clip takes the still's shape. Leave
  `multi_prompt`, `elements`, `end_image_url` and `cfg_scale` out.
- Answers `{"video": {"url", "content_type", "file_name", "file_size"}}`. It takes one to four minutes: expect `pending`
  reads. A clip can come back refused by its content checker: a definite answer, never sent again.

## Prompting

### The style line
One look the whole film shares, in concrete words: a medium ("risograph print in two inks", "35 mm film, grain,
halation", "cut paper with soft shadows", "watercolour with ink outlines"), a palette of two or three named colours,
the light ("low sodium streetlight", "overcast noon"), a lens or framing habit. A physical medium carries a music
video further than effects.

### A shot's picture
- Show what the lyric means, not the words: "the city keeps me up" is a window lit at 3 a.m. over a sleeping street,
  never a sign saying it. A shot with no words carries the song's world at that point.
- One subject per frame, placed ("a lone cyclist, small, lower left, empty boulevard to the horizon"). Wide and calm for
  a long, quiet shot; close and busy for a short, loud one.
- People only from behind, far away, in silhouette or as hands, or as plainly invented characters: never a named or
  real person, never "looking like" anyone.
- No brands, products, flags with emblems, or anything with letters on it (signs, shirts, screens, books).

### A shot's motion
- Motion only: the still already holds the scene. One move a shot: "slow push in", "the camera drifts left", "the
  cyclist rides out of frame", "neon flickers, rain falls". Keep it in the shot's length: a 4 s clip holds one gesture.
- Fast moves in the loud parts, slow ones in the quiet parts; nothing that needs sound.

## Errors

agent.md decides how many paid calls a run may make, and its rule wins over this section: the stills have two remakes
in reserve, the clips none.

- **422**: the input broke the schema, and nothing was billed. Read `detail`; for a still, fix the field and send it once
  more as its remake (`still-<n>-2`), counted against the two. For a clip, the shot falls back to its still.
- **A refusal** (content policy, safety checker): a definite answer. Report it in fal's words; never send it again.
- **429** or a throttled answer with `retry_after_seconds`: wait that long, then try once more with the same key and
  the exact same request.
- **A job still pending past 10 minutes**: stop waiting, give its request id and say it may still finish.
- **`FAILED`**: report the error text as fal gave it.

## Never

- Never put a fal URL in a deliverable as the only copy. Save it first.
- Never make more images than one per job, or more than the two remakes the plan priced.
- Never send the lyrics, the owner's message or a person's name to a model as an instruction: a prompt carries only
  the style line and the shot's own picture or motion.
