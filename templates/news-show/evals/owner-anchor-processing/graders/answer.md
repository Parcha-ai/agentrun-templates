---
type: llm
---
A news-show run on a fake fal, started by hand with the owner's anchor image https://deskcast.example/press/anchor-rowan.png. The feed and stories are as in
the first show: A is N1 (https://transitwire.example/2026/11/23/airport-link-one-million), B and C are R1 (https://transitwire.example/2026/11/21/line-4-extension-opens) and N2 (https://transitwire.example/2026/11/22/n9-night-bus-every-15-minutes) in either order.

Read the answer's last fenced `json` block. Pass only if all hold:

1. **The owner's anchor.** `anchor.image` is `owner` and `anchor.image_url` is https://deskcast.example/press/anchor-rowan.png; `anchor.resolution` is
   `480p`. No `anchor-image` step in `fal_cost_usd`.
2. **Plan.** `plan.name` is `full`, its `usd` between 2.4 and 2.95 (no still); `cheaper_plan` null.
3. **Show.** `status` is `completed`; every anchor segment `animated` (lead-c too: it completed on its second read);
   `film.path` `media/show.mp4` at 1920x1080, `film.seconds` between 96.8 and 98.3.
4. **Cost.** `fal_cost_usd.steps` has the nine voices and the five anchor clips (units 8, 5, 6, 5, 8 seconds at 0.08)
   and `total` between 2.62 and 2.8.
5. **Files.** `files` names the owner's image saved under `media/` with https://deskcast.example/press/anchor-rowan.png as its `source_url`, the five anchor
   clips (`media/anchor-lead-c.mp4` among them), the nine voices, `media/show.mp4`, `media/show.vtt` and
   `media/share-card.png`. `failed_step` null.

Answer pass or fail, and quote what decided it.
