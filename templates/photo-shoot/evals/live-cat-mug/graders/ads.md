---
type: llm
---
The run made a photo shoot on the live fal server with ad sizes on. Read its `submit_job` calls on
`fal-ai/nano-banana-pro/edit` and its answer's last fenced `json` block. A shot job is one at `aspect_ratio` `3:2`;
an ad-size job is one at `1:1`, `4:5`, `9:16` or `16:9`. The timeline cuts long tool answers: when a `wait_for_jobs`
answer ends (in "...") before a job's URL, the `url` of the run's `web_save` for that job's file is the one to match.
Pass only if all hold:

1. **Picks.** The number of `picks` is the smaller of 3 and the number of shots that completed (a shot fal refused
   or failed is not a pick).
2. **One job per pick and size.** For each pick there is exactly one ad-size job at each of `1:1`, `4:5`, `9:16` and
   `16:9`, every one with `num_images` 1 and `resolution` `1K`, so the ad-size jobs number 4 × the picks.
3. **Only the picks.** Each ad-size job's `input.image_urls` holds exactly one URL, the fal URL of one of the picked
   shots; no ad-size job starts from a shot that is not a pick, or from the product photo.

A refusal leaves fewer than 3 picks only when fewer than 3 shots completed; an answer that names such a refusal is
right. Answer pass or fail, and quote what decided it.
