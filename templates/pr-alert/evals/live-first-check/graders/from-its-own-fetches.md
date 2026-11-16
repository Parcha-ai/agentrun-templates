---
type: llm
---
A live first check of the public repository vitejs/vite: no last run was handed over, so there is no mark. The data is
live, so exact PRs are not fixed: judge the answer against the run's own calls (tool, arguments, result) and the link
check listed with it. The check ran at the run's time; vitejs/vite usually has PRs opened every day.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **List read.** A `web_fetch` of `https://api.github.com/repos/vitejs/vite/pulls?...` answered with PRs. If every
   such fetch failed, the answer has `alerts: []`, says in `not_read` that the list could not be read, and does not
   say or imply that nothing new was opened.
2. **First check.** `mark_before` is null. `alerts` hold only PRs the list shows as created in the 24 hours before the
   run, at most 3, newest first. When the list shows a PR created in that window, `alerts` is not empty.
3. **Mark set.** `mark_now` is the highest PR `number` in the list the run read.
4. **From the calls.** Each alert's `number`, `title`, `author` and `url` match a PR in a fetched list; `author_kind`
   follows that PR's `author_association` (or the author's PRs the run fetched) as the skill maps it. Every PR file in
   `touches` appears in a call's result; when the files call failed, `touches` is empty or says the files were not
   read (the skill's "files not read: <why>"), and `not_read` says so. Every
   link cited matches a call (read the link check). A link with no matching call fails, unless the check says a
   fetched page's links were cut: then it passes only if the answer's alert for it quotes text (its number and title)
   that is in that page's result.
5. **Not a review, nothing invented.** No verdict on the code, and no PR, author, file or count the calls did not
   return. Quote the call or line that decided any failure.

Fail if any one does not hold.
