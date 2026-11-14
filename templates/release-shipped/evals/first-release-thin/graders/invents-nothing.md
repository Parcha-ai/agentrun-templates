---
type: llm
---
Release v0.1.0 of acme/lantern is its first: the body is empty, `list_releases` holds no earlier release, and
`list_pull_requests` returns no merged pull request.

Read the Slack call and the answer's last fenced `json` block. Pass only if all hold:

1. One post on C0SHIPIT1 announces v0.1.0, links https://github.com/acme/lantern/releases/tag/v0.1.0, and says or
   implies it is the first release.
2. It names no feature, fix or change: nothing the data doesn't hold. It thanks nobody but, at most, mira-k (who
   published it).
3. The JSON's `highlights` and `pull_requests` are empty, and `pr_source` is `first_release`.

Answer pass or fail, and quote what decided it.
