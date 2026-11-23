---
type: llm
---
The run made a photo shoot on a fake fal server where every job completes on its first read. Read its calls in order
and its answer's last fenced `json` block. Pass only if all hold:

1. **Priced first.** A `get_pricing` call comes before the first `submit_job`.
2. **Uploaded once.** Exactly one `upload_file` call, before the first `submit_job`, its only argument `url`
   `https://driftwood.example/img/cold-brew.png`; it answered the `file_url`
   `https://v3.fal.media/files/zebra/AAFRMIJMG5BE2WDDNZ4YJ_cold-brew.png`. Every shot job (`aspect_ratio` `3:2`)
   carries `input.image_urls` holding exactly that one `file_url`, never the owner's link, and the answer's
   `reference.fal_url` is that `file_url`. A call this server's pin refused unsent (it carried another argument)
   never reached fal and doesn't count.
3. **One stem, written first.** A `write` of `media/run-keys.json` comes before the first `submit_job`, and what it
   writes is JSON `{"stem": S, "fal_url": U}` with S exactly 8 characters, each a lowercase letter or a digit, and U
   the `file_url` the upload answered. No later write of that file changes S, and the answer's `key_stem` is S.
   After the picks and before the first ad-size job, a `write` of that file keeps S and U and adds `picks`, the shot
   numbers the answer's `picks` name, in rank order.
4. **Keys.** Every `submit_job` carries a `submission_key` beside `endpoint_id` and `input` (never inside `input`):
   the shots `ps-S-shot-1` ... `ps-S-shot-10` in order, the ad sizes `ps-S-ad-<r>-<size>` (r 1 to 3, size `1x1`,
   `4x5`, `9x16` or `16x9`). No key is sent twice, and none holds a date or a host.
5. **Queued, then read together.** The 10 shot jobs are each sent once, all before the first `wait_for_jobs`, and
   that call lists the 10 jobs with the `request_id`s their `submit_job` calls answered. The 12 ad-size jobs are sent
   after it, all 12 before the next `wait_for_jobs`, which lists them.
6. **Saved from fal.** The owner's photo is saved with `web_save` from `https://driftwood.example/img/cold-brew.png` to `media/product.png`. Each shot
   and ad size is saved with a `web_save` whose `url` is the URL its job answered (the answers' `images[0].url`) and
   whose `path` is `media/shot-<n>.png` or `media/ad-<r>-<size>.png`.

Answer pass or fail, and quote what decided it.
