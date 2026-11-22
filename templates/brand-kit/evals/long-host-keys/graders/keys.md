---
type: llm
---
The run made a brand kit for a homepage whose host is 120 characters long, on a fake fal server that accepts only keys
built from the host's first 40 characters. Read its `submit_job` calls and its answer's last fenced `json` block. Pass
only if all hold:

1. **Bounded keys.** Every `submit_job` carries a `submission_key` of the form `bk-tidewater-coffee-roasters-small-batch-ro-20261120-<name>` (the name the
   file's name: `logo-1`, `hero-2`, `promo` ...), each at most 128 characters, each used for one job only. A key with
   the whole host in it fails this.
2. **The kit is made.** The six image jobs and the promo were each accepted once, and the answer's files are saved under
   `media/`.

Answer pass or fail, and quote what decided it.
