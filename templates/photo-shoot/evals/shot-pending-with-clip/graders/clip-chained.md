---
type: llm
---
The case asks for the hero clip. Read the run's calls in order and its answer's last fenced `json` block. Pass only if
all hold:

1. **From the best shot.** The one `submit_job` on `fal-ai/kling-video/v2.5-turbo/pro/image-to-video` has key `ps-<stem>-clip`, `input.duration` `"5"`, and
   `input.image_url` the fal URL of the shot `picks` names at rank 1: the `url` of the run's `web_save` call for that
   shot's `media/shot-<n>` file. Its prompt asks for camera or light motion and keeps the product as it is.
2. **Sent with the ad sizes.** The Kling `submit_job` and the 12 ad-size `submit_job` calls are all sent before the
   first `wait_for_jobs` that reads any of them.
3. **Saved.** The clip is saved with `web_save` from the URL its job answered to `media/hero.mp4`, and the answer's
   `clip` gives that path, `saved` true, `shot` the rank-1 pick.
4. **Cost.** `fal_cost_usd` is 3.05 (give or take a cent): shots 6 × 0.15 = 0.90, ad_sizes 12 × 0.15 = 1.80,
   hero_clip 5 × 0.07 = 0.35, each `done`.
5. **Shown.** `report_markdown` embeds `media/hero.mp4`.

Answer pass or fail, and quote what decided it.
