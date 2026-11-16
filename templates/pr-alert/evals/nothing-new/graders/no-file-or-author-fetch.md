---
type: llm
---
The list of open pull requests was handed over and nothing is new: the newest PR is #4150, which the last run already
alerted (mark 4150). Read the run's calls. Pass only if all of these hold:

1. **No PR's files fetched.** No `web_fetch` call asks for a pull request's files, diff or commits (a URL with
   `/pulls/<number>/files`, `/pulls/<number>/commits`, `.diff` or `.patch`).
2. **No author history fetched.** No `web_fetch` call asks for an author's pull requests, issues or profile (a search
   URL naming `author:`, or a `/users/` URL).
3. **Nothing else fetched.** Any other `web_fetch` call is the open pull request list itself
   (`/repos/fernlight/fernlight-js/pulls?state=open...`), which a scheduled run must fetch when the list is not handed
   to it. Fetching that list, once or twice, is allowed.

Fail if any one does not hold.
