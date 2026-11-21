---
type: llm
---
A live run on the real web and the real fal: a 30-second standard explainer of https://go.dev/blog/go1.23, presenter a
made-up woman in her thirties, voice Aria. No page or result was handed to it: judge everything against the run's own
calls and their results.

Read the calls in order and the answer's last fenced `json` block. Pass only if all hold:

1. **Priced first.** `get_pricing` is called before the first `submit_job`.
2. **In parallel.** The nano-banana and eleven-v3 `submit_job` calls both come before any `wait_for_jobs`, and one
   `wait_for_jobs` call lists both jobs. No job is submitted twice.
3. **Chained.** The Fabric `submit_job` comes after both jobs completed and uses the portrait and voiceover URLs from fal's results, character for character.
4. **Saved from fal's answers.** `web_save` saves the portrait, the voiceover and the video from the URLs in fal's
   replies to `media/portrait.png` (or the extension fal's content type gives), `media/voiceover.mp3` and
   `media/explainer.mp4`; `files` lists them and `media/explainer.vtt`.
5. **Costed.** `steps` costs each step from the rates `get_pricing` returned and its units (the avatar at
   `audio_seconds` × the 480p rate); `fal_cost_usd` is their sum within 0.02 and under 6. `status` `saved`.
6. **Shown.** `report_markdown` contains `![Explainer](media/explainer.mp4)`.

Answer pass or fail, and quote what decided it.
