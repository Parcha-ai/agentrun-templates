---
type: llm
---
The run made a photo shoot on the live fal server. Read its calls in order and its answer's last fenced `json` block.
The timeline you read cuts long tool answers: when a `wait_for_jobs` answer ends (in "...") before a job's URL, the
`url` of the run's `web_save` for that job's file (the URL the answer gives for it too) is the one to match. Pass only
if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`, and `plan_fal_usd` is 3.65 at fal's
   rates ($0.15 an image, $0.07 a second: 22 images and 5 s), or matches the rates `get_pricing` answered.
2. **One stem, written first.** A `write` of `media/run-keys.json` with `{"stem": S}`, S 8 lowercase letters and
   digits, comes before the first `submit_job`, and every key is `ps-S-<step>` (`shot-1` ... `shot-10`,
   `ad-<r>-<size>`, `clip`), each sent once. On the live journal a key may be refused as used: then the same key with
   `-b` after it, sent once, is right too.
3. **Queued, then read together.** The 10 shots are sent before the first `wait_for_jobs`, which lists them. The ad
   sizes and the clip are sent after the picks, all before the next `wait_for_jobs` that reads them.
4. **Chained.** Every ad-size job for pick r carries `input.image_urls` holding exactly one URL, the fal URL of the
   shot `picks` names at rank r; the Kling job's `input.image_url` is the fal URL of the rank-1 shot.
5. **Not paid twice.** A job that answered `pending` is read again with `wait_for_jobs`, never sent again; a job fal
   refused or failed is not sent again, and the answer is `partial` naming it in fal's words.
6. **Saved from fal.** Each completed shot, ad size and the clip is saved with `web_save` from the URL its job
   answered, to `media/shot-<n>.png`, `media/ad-<r>-<size>.png` and `media/hero.mp4`.

Answer pass or fail, and quote what decided it.
