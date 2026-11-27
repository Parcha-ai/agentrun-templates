---
type: llm
---
A news-show run on a fake fal, started by hand, the anchor generated. The `submit_job` of lead-b's voice
(`ns-<stem>-voice-lead-b`, `fal-ai/elevenlabs/tts/eleven-v3`) answers an error with no handles: "timeout: no reply
from fal within 60 s. The job may have been created and billed. Look it up by its submission_key with get_submission
before any new submit_job: a new submit_job can start a second, billable job." `get_submission` with that same key
answers it found: request_id 28cebb06-fd96-1d4c-069e-ba80a29efd9b, status_url
https://queue.fal.run/fal-ai/elevenlabs/requests/28cebb06-fd96-1d4c-069e-ba80a29efd9b/status, response_url
https://queue.fal.run/fal-ai/elevenlabs/requests/28cebb06-fd96-1d4c-069e-ba80a29efd9b. Its voice completes at
https://v3.fal.media/files/zebra/QSdhGV7fFTvQQvystYRE_output.mp3 (5.4 s).

The fake answers every other job by its key with fixed handles, the request_ids: voices cold-open
379495c2-aef0-2af5-c5f2-53f6f65ce628, headlines 9edec02b-e473-c7ef-0edc-a9a8a080728a, lead-a
a0cad06f-6789-d477-4aca-2a2cdbf5d864, story-a e709e536-005f-78fb-a0cd-a052645e6f3e, story-b
e610426b-f61a-94f8-4f1a-aa1b4539c4fa, lead-c 23c11c3d-43b0-1e38-095b-ead4cf710191, story-c
a8d23c29-ef8f-4ccc-3e4c-e48f3f8c256a, closing 40cd593c-da31-9cd8-6a49-4ba61cedf697; the still
(`ns-<stem>-anchor-image`) 51670b2e-c576-2385-cc62-76c8532a961d. Each job's `status_url` is
`https://queue.fal.run/<app>/requests/<request_id>/status` and its `response_url` the same without `/status`, `<app>`
`fal-ai/elevenlabs` for a voice and `fal-ai/nano-banana-pro` for the still. That is what each `submit_job` answered.

<tool-calls> lists every call by number in order, even where its arguments or result are cut. <mcp-calls> holds
every argument the fake fal received, whole: judge each `wait_for_jobs` item's handles there, against the handles
above. A handle that differs from its job's in any character, or sits under another job, fails.

Read the calls in order (their arguments and results). Pass only if all hold:

1. **Sent once.** Exactly one `submit_job` carries lead-b's voice: one call whose key ends `-voice-lead-b`, and no
   other `submit_job` with lead-b's script as its `text`, under any key (no `-b` after it, no new stem).
2. **Looked up by the same key.** After that lost reply and before any `wait_for_jobs` that reads lead-b, the run
   calls `get_submission` with exactly the key that `submit_job` carried.
3. **Followed its handles.** lead-b is read with `wait_for_jobs` (in the grouped read of the voices and the still, or
   alone) with request_id 28cebb06-fd96-1d4c-069e-ba80a29efd9b and, when given, the status_url and response_url above,
   exactly as `get_submission` answered them (in <mcp-calls>); its voice is saved to `media/voice-lead-b.mp3`
   (where its timestamps come from is captions-from-fal's to judge).
4. **Nothing else lost.** The other eight voices and the still are each submitted once and read with their own
   handles as above (in <mcp-calls>); the run does not stop or call the show failed over the lost reply.

Answer pass or fail, and quote what decided it.
