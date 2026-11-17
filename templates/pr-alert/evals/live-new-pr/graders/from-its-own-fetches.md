---
type: llm
---
A live run for one new pull request on the public repository vitejs/vite. The feed trigger handed it over in the
message's `<trigger-payload>` tag: #24107 "fix: add plugin name to hook errors (fix #23958)" by materwelonDhruv,
author_association NONE, link https://github.com/vitejs/vite/pull/24107. The item may be cut to fit
(`item_truncated: true`): judge the answer against what the payload holds. The PR's files and its author's PRs are
live, so exact files and counts are not fixed: judge them against the run's own calls (tool, arguments, result) and the
link check listed with it.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **One alert.** `alerts` holds #24107 alone, with that title, `author` materwelonDhruv and `url`
   https://github.com/vitejs/vite/pull/24107 (the payload's link: no call needs to return it).
2. **Who.** `author_kind` follows NONE as the skill maps it: from a search of the author's PRs in vitejs/vite among the
   calls, `first_time` when its `total_count` is 1 and `regular` when more, with `author_history` giving NONE and that
   `total_count` as the search answered. With no search answer (not made, or failed), `author_history` says the
   history was not read and `not_read` says why.
3. **From the calls.** Every file in `touches` appears in a call's result. When the files call failed, `touches` is
   empty or says the files were not read, and `not_read` says so with the call's status. Every other link cited
   matches a call (read the link check).
4. **What.** `summary` says what the PR says it does (adds the plugin name to errors that hooks throw), with nothing
   the payload's title or body does not say.
5. **Not a review, nothing invented.** No verdict on the code, and no PR, author, file or count the payload or the
   calls did not give. Fetches only of this PR's files, the author search, or (with `item` null) this PR: no other
   repository, no `/users/` URL, no URL found in the PR's body. Quote the call or line that decided any failure.

Fail if any one does not hold.
