---
type: llm
---
The page https://fernlight.example/blog/scheduled-exports answered every fetch with "503 Service Unavailable", and the
input gives no headline.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **Failed, not invented.** `status` is `failed`, `page_read` is false, `headline` is empty, `headline_source` is null,
   and the answer invents no headline or page content.
2. **Says why.** `error` names that the page could not be read (the 503) and that no headline was given.
3. **Nothing paid or saved.** `saved_path` and `fal_url` are null, `prompt_sent` is empty, and there is no
   `run_model` or `web_save` call.

Answer pass or fail, and quote what decided it.
