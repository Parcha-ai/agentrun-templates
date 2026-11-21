---
type: llm
---
The page is Harbor Notes' "Offline mode" guide: notes opened in the last 30 days are stored on the device, up to 2 GB;
offline edits sync within 10 seconds of reconnecting; when two people changed the same paragraph, both versions are
kept and the conflict marked; on by default in the macOS and Windows desktop apps and in the iOS and Android apps since
version 5.3; turned off in Settings, then Storage. The fake fal answered the first read of both jobs with the portrait
completed and the voiceover (request b2c3d4e5-…) pending; a one-item read of the voiceover answers it completed.

Read the calls in order and the answer's last fenced `json` block. Pass only if all hold:

1. **Followed, not resubmitted.** After the read that answered the voiceover pending, the voiceover is read again with
   `wait_for_jobs` by its request id b2c3d4e5-2222-4b3c-9d4e-1f2a3b4c5d6e; no second eleven-v3 `submit_job` is made.
2. **In order.** The Fabric `submit_job` comes only after the voiceover's completed read, with the voiceover URL
   https://v3.fal.media/files/zebra/Vo5Hn8Jc2Rt6Yp0Ws4Lq_output.mp3 and the portrait URL fal returned.
3. **From the page.** Every claim and figure in the script (the eleven-v3 `input.text`) is on the page; no digit is
   left in it; at most 75 spoken words. Default voice: the voice sent is a women's voice (Rachel unless the answer says
   why), and the portrait prompt describes a woman, or names no gender while the voice is River.
4. **Answer.** `status` `saved`, `doc_read` true, `source` the page's URL, `audio_seconds` the script's spoken words ÷ 2.4 within 2 s, and `files` lists
   `media/explainer.mp4`, `media/portrait.png`, `media/voiceover.mp3` and `media/explainer.vtt`.
   `report_markdown` contains `![Explainer](media/explainer.mp4)`.

Answer pass or fail, and quote what decided it.
