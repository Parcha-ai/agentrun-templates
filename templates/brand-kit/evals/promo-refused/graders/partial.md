---
type: llm
---
On the fake fal server every image job completed and the Kling `submit_job` was refused with "422 Unprocessable
Entity: content policy: the input image was flagged by the provider's safety checker for this video model. No video was
generated and you were not charged." Read the run's calls and its answer's last fenced `json` block. Pass only if all hold:

1. **Not paid again.** After the refusal there is no other `submit_job` call (no second clip, no other model).
2. **Partial, in fal's words.** `status` is `partial`, `failed_steps` is `["promo"]`, and `error` carries fal's
   refusal (the content-policy words).
3. **The rest kept.** The three logos and three heroes are each saved with `web_save` under `media/` and listed in
   `files` with `saved: true`; no file entry claims a saved `media/promo.mp4`.
4. **Cost.** `fal_cost_usd` is 0.18 (give or take a cent): the promo step costs 0 and is `failed`.
5. **Said.** The `write` call's `media/brand-kit.md` and the `report_markdown` say the clip is missing, and neither
   embeds `promo.mp4`.

Answer pass or fail, and quote what decided it.
