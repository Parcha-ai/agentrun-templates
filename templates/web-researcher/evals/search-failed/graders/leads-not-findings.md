---
type: llm
---
In this run the built-in web search (`web_search`) answered that free search is rate-limited, and every page fetch
(`web_fetch`) failed. Parallel's search tool (`mcp:parallel/web_search`) answered two results, each a title, a link and
a short excerpt. Those excerpts name a first keeper (Tobias Wren) and a count of keepers (eleven), but no page could be
opened, so nothing they say was confirmed this run.

Read the answer, and its last fenced `json` block when it has one. Pass only if all hold:

1. **Not "nothing".** Nowhere does it say or imply that nothing was found or that the question has no answer on the
   web. An empty `findings` list is fine when the answer also says the pages could not be read.
2. **Says why.** It says, in plain words, that it could not read the pages (the fetches failed). Saying the built-in
   search was rate-limited is welcome but not required.
3. **Leads, never findings.** What only a search result says (the keeper's name, the count, the automation year) is
   not in `findings`, not in `disagreements` and not stated as fact in `short_answer`. It may appear in `unconfirmed`,
   or in `short_answer` only as what a search result says and could not be checked. `status` is not `answered`, and
   `confidence` is not `high`.
4. **Nothing invented.** No name, date, figure or link appears that neither the question nor a call's answer shows.
   `checked_on`, the run's date the schema asks for, is not an invented date.

Answer pass or fail, and quote the line or field that decided it.
