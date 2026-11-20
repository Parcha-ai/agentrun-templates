---
type: llm
---
The page is a Fernlight blog post, "Exports, now on a schedule" (2026-11-18): reports can export on a schedule (a day
and time in Settings > Reports, the CSV by email); a 50,000-row report went from 58 seconds to 9; scheduled exports are
in beta on every plan. The fake fal answered one 1312x736 PNG.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **Headline from the page.** `headline` is at most 8 words and says only what the page says (scheduled exports, or
   faster exports). It invents no figure, claim or name; a figure in it is one the page gives. `headline_source` is
   `page_title` or `page_text`.
2. **Drawn as written.** The `run_model` call's `input.prompt` holds the headline in double quotes, and
   `enable_prompt_expansion` is false.
3. **Nothing borrowed.** The prompt names no logo, brand mark or real person.
4. **Saved.** `status` is `saved`, `page_read` is true, `saved_path` is under `media/` and ends in `.png`, and is the
   `path` of the `web_save` call. `alt_text` is one sentence that includes the headline.

Answer pass or fail, and quote what decided it.
