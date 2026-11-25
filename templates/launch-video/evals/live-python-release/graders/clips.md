---
type: llm
---
A live launch-video run on the real fal. Read every `submit_job` call on `fal-ai/kling-video/v2.5-turbo/pro/text-to-video`
and what it answered.

A call fal accepted answered with a job: `status` `submitted` and a `request_id`. A call the server refused before
sending (its answer says it "was not sent" and "Nothing was sent") never reached fal: it is not a job and is not counted,
and sending that clip again under the same `submission_key` is not a second job.

Pass only if all hold:

1. Exactly six Kling jobs were accepted, each with `input.duration` `"5"` and `input.aspect_ratio` `"16:9"`.
2. No `submission_key` was accepted twice.

Answer pass or fail, and quote each accepted clip's key and request id.
