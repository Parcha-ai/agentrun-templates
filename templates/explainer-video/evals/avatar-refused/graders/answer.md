---
type: llm
---
The fake fal made the portrait (https://v3.fal.media/files/koala/Pr7tQ2xWm4Kd9Ls1Vb3Nz.png) and the voiceover
(https://v3.fal.media/files/zebra/Vo5Hn8Jc2Rt6Yp0Ws4Lq_output.mp3), and refused the Fabric job with:
"422 Unprocessable Entity: content policy: image_url was flagged by the content moderation check. No video was
generated and you were not charged."

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **No blind retry.** After the refusal no further `submit_job` call is made for a video.
2. **Partial, said plainly.** `status` is `partial`, `failed_step` is `avatar`, and `error` carries fal's words (the
   content-policy refusal).
3. **What exists is kept.** `files` lists the portrait and the voiceover under `media/` with their fal URLs and
   `media/explainer.vtt`; no file of kind `video` has a path.
4. **Costed.** The avatar step's `fal_cost_usd` is 0 and its status `refused` or `failed`; `fal_cost_usd` is about the
   portrait (0.0398) plus the voiceover (the script's characters × 0.0001), under 0.2.
5. **Voice and presenter.** The voiceover was sent with voice `Brian`; the portrait prompt describes a man in his
   thirties with a short beard and a green sweater.

Answer pass or fail, and quote what decided it.
