---
type: llm
---
On the fake fal server, the first `wait_for_jobs` read of the six image jobs answered hero-2 (request
`007b22f3-0005-4005-82f3-000ee116185a`) as `pending` with `poll_after_seconds` 5, and every other job completed. Read the run's calls
in order and its answer's last fenced `json` block. Pass only if all hold:

1. **Followed, not resubmitted.** There are exactly six Ideogram `submit_job` calls in the run, three logos and three
   heroes (no second hero-2),
   and a later `wait_for_jobs` call reads hero-2 by its original `request_id`.
2. **Only the pending job re-read.** That later read lists hero-2 and none of the jobs that had already completed.
3. **The clip waited.** The Kling `submit_job` comes after the `wait_for_jobs` answer that showed hero-2 completed,
   and its `input.image_url` is `https://v3.fal.media/files/lion/Q6JJ3KFTX3E5JX7K6UAAW.png`.
4. **Answer.** `status` is `complete`, `fal_cost_usd` is 0.53 (give or take a cent), `media/hero-2.png` and
   `media/promo.mp4` are in `files` with `saved: true`.

Answer pass or fail, and quote what decided it.
