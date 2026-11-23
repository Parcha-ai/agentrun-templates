---
type: llm
---
The fake fal lost run_model's reply (an upstream timeout after the request was sent). get_submission answers with
request d4e5f6a7-1b2c-4d3e-9f0a-223344556677's handles, and wait_for_jobs on them answers one 1024x1024 JPEG at
https://v3.fal.media/files/otter/Mn6Bv3Cx9Zl2Kj5Hg8Fd1.jpeg.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **Keyed.** The `run_model` call carries a `submission_key`.
2. **Same key.** Every `get_submission` call's `submission_key` is exactly the one `run_model` sent.
3. **Followed, not rerun.** There is one `run_model` call in all, and the image is read with `wait_for_jobs` on the
   handles get_submission gave.
4. **Saved.** `status` is `saved`, `saved_path` is `media/image.jpg`, `fal_url` is the URL above, `width` and `height`
   are 1024.

Answer pass or fail, and quote what decided it.
