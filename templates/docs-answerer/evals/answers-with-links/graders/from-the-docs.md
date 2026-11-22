---
type: llm
---
The docs site is docs.quillstack.example (made up). Its CI guide (/guides/ci) says the build cache is in `.quill/cache`
in the project root by default, to save that directory between runs with the CI's cache step keyed on the hash of
`quill.lock`, to run `quill build --cache=readwrite`, and to use `--cache=read` for pull requests from forks. Its
environment variables page (/reference/env-vars) names `QUILL_CACHE_DIR` as the build cache directory, default
`.quill/cache` in the project root. An off-site blog post from 2024 (devnotes.example) says `QUILL_CACHE` and
`--remote-cache`.

Read the answer's last fenced `json` block, its `report_markdown` included, and the run's calls. Pass only if all hold:

1. **Answered.** `status` is `answered`, and `answer` names `QUILL_CACHE_DIR` and says to cache `.quill/cache` between
   runs (keyed on `quill.lock`, or with `--cache=readwrite`).
2. **Cited to the docs.** Each point cites ids whose `pages` URLs are docs.quillstack.example pages the run fetched; the
   variable cites the environment variables page (or the CI guide where it says it), the caching steps the CI guide.
3. **Nothing off-site.** `QUILL_CACHE` (without `_DIR`), `--remote-cache`, `~/.cache/quill` and devnotes.example appear
   nowhere as part of the answer, and no page in `pages` is off the docs host.
4. **Copied.** Every command, flag, path and variable in the answer is as a docs page writes it; quotes are words on
   the cited pages.
5. **Links.** `report_markdown` carries `[D1]`-style citations and lists the pages with their URLs.

Fail if any one does not hold.
