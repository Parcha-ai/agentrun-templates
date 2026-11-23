---
type: llm
---
A live run: the person asked for "A lighthouse on a rocky coast at dawn, gulls overhead, soft pastel watercolor", shape
landscape, and the real fal answered. The truth is in the run's own calls, listed with the answer.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **The prompt keeps the request.** The `prompt` in the `run_model` call's `input` names a lighthouse, a rocky coast,
   dawn, gulls and watercolor, and adds no subject, person, brand or words-in-the-image the person did not ask for.
   `prompt_sent` in the answer is that same prompt.
2. **One image.** `num_images`, if sent, is 1; `sync_mode` is not true.
3. **Saved where it says, from fal's answer.** `status` is `saved`; `saved_path` is `media/image.jpg` and is the
   `path` of the `web_save` call. `fal_url` is the image URL in fal's reply (from `run_model`, or from `wait_for_jobs`
   when the job was still running) and is the `url` of the `web_save` call. `model` is `fal-ai/flux/schnell`;
   `image_size` is `landscape_4_3`; `width` and `height` are the ones fal's reply gives.
4. **Nothing else paid.** No second `run_model` and no `submit_job`.

Answer pass or fail, and quote what decided it.
