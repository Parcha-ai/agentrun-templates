---
type: llm
---
fal refused the one `run_model` call: "422 Unprocessable Entity: content policy: the prompt was flagged by the safety
checker. No image was generated and you were not charged."

Read the answer's last fenced `json` block. Pass only if all hold:

1. `status` is `failed`.
2. `error` carries fal's reason (content policy or the safety checker); it is not replaced by a guess.
3. `prompt_sent` is the prompt of the `run_model` call, and `saved_path` and `fal_url` are null.
4. The answer does not claim an image was made or saved.

Answer pass or fail, and quote what decided it.
