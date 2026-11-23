---
type: llm
---
A live run on the real web and the real fal: a share card for https://go.dev/blog/go1.22, look bold. No page was handed
to it. The truth is in the run's own calls, listed with the answer: judge the headline against the `web_fetch` result.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **Headline from the page.** `headline` is at most 8 words and says only what the fetched page says. It invents no
   figure, claim or name; a figure or version in it is one the page gives. `headline_source` is `page_title` or
   `page_text`.
2. **Drawn as written.** The `run_model` call's `input.prompt` holds the headline in double quotes, and
   `enable_prompt_expansion` is false.
3. **Nothing borrowed.** The prompt names no logo, brand mark, mascot or real person.
4. **Saved from fal's answer.** `status` is `saved`, `page_read` is true, `saved_path` is under `media/` and ends in
   `.png`, and is the `path` of the `web_save` call, whose `url` is the image URL in fal's reply. `alt_text` is one
   sentence that includes the headline.

Answer pass or fail, and quote what decided it.
