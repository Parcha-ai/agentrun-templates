---
type: llm
---
On the fake fal server, the first `wait_for_jobs` read of the six shots answered shot-3 (request
`0062b1c2-0003-4003-81c2-000becfd7b69`) as `pending` with `poll_after_seconds` 5, and every other shot completed; read alone,
shot-3 completes with the image `https://v3.fal.media/files/koala/GE6EOUS5NBZX5CMUT6VLL.png`. Read the run's calls in order and its answer's last fenced
`json` block. Pass only if all hold:

1. **Followed, not resubmitted.** There are exactly six `fal-ai/nano-banana-pro/edit` `submit_job` calls with `aspect_ratio` `3:2`, one
   per key `ps-<stem>-shot-1` ... `-shot-6` (no second shot-3), and a later `wait_for_jobs` call reads shot-3 by its
   original `request_id`.
2. **Only the pending job re-read.** That later read lists shot-3 and none of the shots that already had an outcome.
3. **The picks waited.** No ad-size or Kling `submit_job` comes before the `wait_for_jobs` answer that showed shot-3
   completed, and shot-3 is saved with `web_save` from the URL above to `media/shot-3.png`.
4. **Answer.** `status` is `complete`, `shots` lists shot 3 as `completed` and saved, and `failed` is empty.

Answer pass or fail, and quote what decided it.
