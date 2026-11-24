---
type: llm
---
Read the run's answer, its last fenced `json` block, and the run's calls. The plan: 10 shots, ad sizes on, the hero
clip on, cap 4. Pass only if all hold:

1. **Status.** `status` is `complete` when every job completed and was saved, else `partial` with each failed job in
   `failed` in fal's own words.
2. **Cost.** `fal_cost_usd` is the images that completed × 0.15 plus 5 × 0.07 = 0.35 when the clip completed (3.65
   when everything did), give or take a cent, or the same at the rates `get_pricing` answered; `steps` gives upload
   (`done`, at 0), shots, ad_sizes and hero_clip, each with its units and cost.
3. **Picks.** `picks` holds 3 different completed shots (all of them when fewer than 3 completed), each with a `why`
   line; `pick_basis` is `looked` when the run `read` the saved shots, `prompts` when it said it could not.
4. **Files.** `files` lists `media/run-keys.json`, the product photo, every saved shot and ad size and
   `media/hero.mp4`, each a path the run wrote.
5. **Report.** `report_markdown` embeds the three picks and their ad sizes by their saved paths, and the clip as
   `media/hero.mp4`.

A true caveat in the answer (estimates from fal's rates, the picks a judgment, a small detail the model softened)
never fails it. Answer pass or fail, and quote what decided it.
