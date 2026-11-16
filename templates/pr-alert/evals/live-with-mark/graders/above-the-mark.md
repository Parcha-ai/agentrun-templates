---
type: llm
---
A live later check of the public repository vitejs/vite. The last run's answer, handed at the end of the message, has
mark_now 24099 (it alerted #24099 and #24098), so the mark is 24099. The data is live, so exact PRs are not fixed: judge
the answer against the run's own calls (tool, arguments, result) and the link check listed with it. vitejs/vite has had
PRs above #24099 open since 2026-11-16 (#24100, #24103 and #24105 at 03:00Z; others open and close).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **List read.** A `web_fetch` of `https://api.github.com/repos/vitejs/vite/pulls?...` answered with PRs. If every
   such fetch failed, the answer has `alerts: []`, keeps `mark_now` at 24099, says in `not_read` that the list could not
   be read, and does not say or imply that nothing new was opened.
2. **Mark.** `mark_before` is 24099. `mark_now` is the highest PR `number` in the list the run read (never below 24099).
3. **Only new PRs.** Every alert's `number` is above 24099 and appears in a fetched list. #24099, #24098 and any PR at or
   below 24099 are not alerted or presented as new anywhere, including the report. When the fetched list shows PRs above
   24099, `alerts` is not empty, newest first.
4. **From the calls.** Each alert's `title`, `author` and `url` match that PR in a fetched list; `author_kind` follows
   its `author_association` (or the author's PRs the run fetched) as the skill maps it; a bot author (a login ending in
   `[bot]`) is not called a first-time contributor without saying it is a bot. Every PR file in `touches` appears in a
   call's result; when the files call failed, `touches` is empty or says the files were not read (the skill's
   "files not read: <why>"), and `not_read` says so. Every link cited matches a call
   (read the link check). A link with no matching call fails, unless the check says a fetched page's links were cut:
   then it passes only if the answer's alert for it quotes text (its number and title) that is in that page's result.
5. **Not a review, nothing invented.** No verdict on the code, and no PR, author, file or count the calls did not
   return. Quote the call or line that decided any failure.

Fail if any one does not hold.
