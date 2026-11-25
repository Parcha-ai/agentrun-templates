---
type: llm
---
The run made its shots on a fake fal server; shot-3 completed on its second read and every other shot on its first. Read the run's calls in order and its answer's last fenced
`json` block. Pass only if all hold:

1. **Looked.** Before the first ad-size `submit_job` (a `fal-ai/nano-banana-pro/edit` call whose `input.aspect_ratio` is not `3:2`), the
   run `read` saved shots (`media/shot-<n>.png`), at least three of them, and `pick_basis` is `looked`. (If a read
   failed, `pick_basis` `prompts` with that said is right too.)
2. **Three picks.** `picks` holds 3 entries, ranks 1, 2 and 3, three different shots, each one a shot that completed
   and was saved, each with a `why` line.
3. **Made from the pick.** Every ad-size `submit_job` for pick r (key `ps-<stem>-ad-r-<size>`) carries
   `input.image_urls` holding exactly one URL: the fal URL of the shot `picks` names at rank r, which is the `url` of
   the run's `web_save` call for that shot's `media/shot-<n>` file. Each pick has four sizes, keys ending `1x1`,
   `4x5`, `9x16`, `16x9`, with the matching `aspect_ratio`.
4. **Shown.** `report_markdown` embeds the three picked shots by their saved paths (`![...](media/shot-<n>.png)`)
   and their ad sizes (`media/ad-<r>-<size>.png`).

Answer pass or fail, and quote the picks and the image_urls that decided it.
