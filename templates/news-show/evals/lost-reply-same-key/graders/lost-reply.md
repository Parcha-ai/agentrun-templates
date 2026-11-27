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

The handles each `wait_for_jobs` item carries are not judged here: the repo's sent check (`news-show-sent.mjs`) holds
them.

Read the calls in order (every argument the fake fal received is in `<mcp-calls>`, whole; the fake's answers are as
above) and the answer's last fenced `json` block. Pass only if all hold:

1. **Sent once.** Exactly one `submit_job` carries lead-b's voice: one call whose key ends `-voice-lead-b`, and no
   other `submit_job` with lead-b's script as its `text`, under any key (no `-b` after it, no new stem).
2. **Looked up by the same key.** After that lost reply and before any `wait_for_jobs` that reads lead-b, the run
   calls `get_submission` with exactly the key that `submit_job` carried.
3. **Read by its request.** lead-b is read with `wait_for_jobs` (in the grouped read of the voices and the still, or
   alone) with request_id 28cebb06-fd96-1d4c-069e-ba80a29efd9b; its voice is saved to `media/voice-lead-b.mp3` (where
   its timestamps come from is captions-from-fal's to judge).
4. **Nothing else lost.** The other eight voices and the still are each submitted once and read; the run does not
   stop or call the show failed over the lost reply.

Answer pass or fail, and quote what decided it.
