---
type: llm
---
A news-show run on a fake fal, started by hand, the anchor generated. The grouped read of the Fabric jobs answers
lead-b (`ns-<stem>-anchor-lead-b`) failed: status 422, "VEED Fabric could not find a face to animate in a frame of this
request. No video was generated and you were not charged." The other four clips complete.

Read the answer's last fenced `json` block. Pass only if all hold:

1. **Partial, named.** `status` is `partial`, `failed_step` is `anchor-lead-b`, and `error` carries fal's words (the
   face not found, or the 422).
2. **The desk card.** The lead-b segment's `anchor` is `desk-card`; cold-open, lead-a, lead-c and closing are
   `animated`.
3. **Show.** `film.path` is `media/show.mp4` at 1920x1080, `film.seconds` between 97.0 and 98.5 (the build lays it out
   at 97.724 s with the desk card); `checks.check_errors` 0.
4. **Cost.** `fal_cost_usd` has an `anchor-lead-b` step at 0 usd (or none for it), the other four clips at 0.08 a
   second (units 8, 5, 5, 8), the still and the nine voices; `total` between 2.28 and 2.45.
5. **Files.** No saved file for lead-b's clip (none listed, or `saved_path` null); the other four clips,
   `media/show.mp4`, `media/show.vtt` and `media/share-card.png` are listed.
6. **Report.** `report_markdown` says lead-b's clip failed and played as a desk card, in fal's words.

Answer pass or fail, and quote what decided it.
