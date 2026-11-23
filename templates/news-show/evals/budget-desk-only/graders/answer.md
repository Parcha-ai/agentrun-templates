---
type: llm
---
A news-show run on a fake fal with plan `short` and max_fal_usd 1.75. get_pricing answers Nano Banana Pro 0.15 an
image, eleven-v3 0.10 per 1000 characters, Fabric 0.08 a second. At the caps the short plan (the still, nine voices
of about 900 to 1,800 characters, and 17 s of Fabric) is 1.60 to 1.69, so the still and the voices are paid. The cold
open's voice is a long take of 20.952 s (21 whole seconds) and the closing's 7.2 s (8): with what is spent (0.15 + the
voices), the cold open and closing (29 s, 2.32) are over 1.75, and the cold open alone (21 s, 1.68) is still over, so
both are dropped and the show is desk-only.

Read the answer's last fenced `json` block. Pass only if all hold:

1. **Desk-only.** `segments` lists the nine in order; cold-open and closing have `anchor` `desk-card`; lead-a, lead-b
   and lead-c have `anchor` `not-planned` or `desk-card`; no segment is `animated`. `anchor.resolution` is null.
2. **Named as the budget.** `status` is `partial`, `failed_step` is `anchor-budget`, and `error` gives the numbers: at
   least max_fal_usd 1.75 and a cost over it for the cold open with the closing or for the cold open alone (or the
   seconds 21 and 8, or 29), so a reader sees why each was dropped.
3. **Still built and saved.** `film.path` is `media/show.mp4` with `film.width` 1920 and `film.height` 1080, and
   `files` names `media/show.mp4`, `media/show.vtt`, `media/share-card.png`, `media/anchor.png`, the nine voices and
   `film/STORYBOARD.md`, and no anchor clip.
4. **Cost.** `fal_cost_usd.steps` has `anchor-image` (1 image at 0.15) and the nine `voice-<segment>` steps (each its
   script's characters ÷ 1000 at 0.10), and no `anchor-<segment>` step above 0; `total` is their sum, between 0.22 and
   0.35. `plan.name` is `short`.
5. **Report.** `report_markdown` says the anchor was not animated because the real lengths put even the cold open over
   max_fal_usd, and that the show plays every anchor segment as a desk card.

Answer pass or fail, and quote what decided it.
