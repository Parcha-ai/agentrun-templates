---
type: llm
---
A music-video run whose song link answers 403 Forbidden. Read the calls and the answer's last fenced `json` block. Pass only if all hold:

- `status` `refused`, `failed_step` `song`.
- `error` gives the save's failure (a 403, forbidden, or the words `web_save` answered) and says the run needs a public link to the audio file itself.
- No `bash` call runs `beats.mjs plan` or `price`, and `fal_cost_usd.total` is 0 with no steps.
- `song.duration_s` null.

Answer pass or fail, and quote what decided it.
