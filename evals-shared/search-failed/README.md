# search-failed: the shared case for every web template

Every template with `web_search` or `web_fetch` carries `evals/search-failed/`, built from this folder:

- `graders/not-nothing.md`: copied as is. Never edit a template's copy; change it here and copy it again.
- `case.yaml`: `web: unavailable` (eval-template answers every search and fetch with the real failure), plus the
  parameters of the template's quiet or thin case.
- `prompt.md`: the input that template's scheduled run gets, with no pages or search results in it.

A failed search must never read as "nothing happened".
