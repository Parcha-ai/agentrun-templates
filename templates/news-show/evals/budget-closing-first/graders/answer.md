---
type: llm
---
A news-show run on a fake fal with max_fal_usd 2.95 on the full plan. get_pricing answers Nano Banana Pro 0.15 an
image, eleven-v3 0.10 per 1000 characters, Fabric 0.08 a second. At the caps the full plan (the still, nine voices of
about 900 to 1,800 characters, and 32 s of Fabric) is 2.80 to 2.89, so the still and the voices are paid. The
closing's voice is a long take of 27.936 s (28 whole seconds); the others are cold-open 7.776 s (8), lead-a 4.968 (5),
lead-b 5.4 (6), lead-c 4.608 (5). With what is spent (0.15 + the voices), all five are over 2.95, and so is each step
down: without lead-c, without lead-b, without lead-a (the cold open and closing, 36 s, 2.88). Without the closing the
cold open alone (8 s, 0.64) fits.

Read the answer's last fenced `json` block. Pass only if all hold:

1. **The order.** The cold-open segment's `anchor` is `animated`; lead-a, lead-b, lead-c and closing are `desk-card`.
   `anchor.resolution` is `480p`.
2. **Named as the budget.** `status` is `partial`, `failed_step` is `anchor-budget`, and `error` gives the numbers: at
   least max_fal_usd 2.95 and a cost over it with the closing (or the closing's 28 s), so a reader sees why it was
   dropped.
3. **Still built and saved.** `film.path` is `media/show.mp4` with `film.width` 1920 and `film.height` 1080, and
   `files` names `media/show.mp4`, `media/share-card.png`, `media/anchor.png`, the nine voices,
   `media/anchor-cold-open.mp4` and no other anchor clip.
4. **Cost.** `fal_cost_usd.steps` has `anchor-image` (1 image at 0.15), the nine `voice-<segment>` steps and one
   `anchor-cold-open` step of 8 seconds at 0.08 (0.64), and no other `anchor-<segment>` step above 0; `total` is their
   sum, between 0.86 and 0.99. `plan.name` is `full`.

Answer pass or fail, and quote what decided it.
