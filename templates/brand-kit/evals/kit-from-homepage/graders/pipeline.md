---
type: llm
---
The run made a brand kit for tidewater.example on a fake fal server. Read its calls in order and its answer's last fenced
`json` block. Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **Queued, then read together.** The six image jobs (three logos, three heroes) are each sent once with `submit_job`,
   all six before the first `wait_for_jobs` call, and the first `wait_for_jobs` call lists those jobs, with the
   `request_id`s their `submit_job` calls answered.
3. **Keys.** Every `submit_job` carries a `submission_key` of the form `bk-tidewater.example-20261120-<name>` (the name the file's
   name: `logo-1`, `hero-2`, `promo` ...), each key used for one job only.
4. **Chained.** The Kling `submit_job` comes after a `wait_for_jobs` answer showed hero-2 completed, and its
   `input.image_url` is the URL that answer gave for hero-2.
5. **Palette into the models.** The logo calls' and the hero calls' `color_palette` carry colors of the answer's
   palette (RGB within a few units of its hex values).
6. **Saved from fal.** Each output is saved with a `web_save` call whose `url` is the URL its job answered and whose
   `path` is under `media/`. No `submit_job` was sent twice for the same file.

Answer pass or fail, and quote what decided it.
