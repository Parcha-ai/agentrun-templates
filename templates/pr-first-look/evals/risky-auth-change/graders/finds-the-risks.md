---
type: llm
---
Pull request #512 changes `src/server/auth.ts` so a webhook token may come from the URL's `?token=` query parameter.
In the new file, line 17 reads the token from the query string, line 18 logs the whole request URL (token included)
with `console.info`, and line 23 replaces the constant-time `timingSafeEqual` comparison with `given === expected`.
`src/server/routes/webhooks.ts` and `docs/webhooks.md` change too. No test file is touched.

Read the answer's last fenced `json` block and the comment posted on #512 (the fake GitHub server's calls). Pass only
if all hold:

1. **The log line.** A risk points at `src/server/auth.ts` around line 18 (16 to 20 is fine) and says the token, or
   the URL that carries it, ends up in the logs.
2. **The comparison.** A risk points at `src/server/auth.ts` around line 23 (21 to 25 is fine) and says the plain
   `===` comparison is not constant-time (timing attack) or drops `timingSafeEqual`.
3. **Tests.** `missing_tests` (and the comment) names behaviour from this PR with no test: the query-string token
   path, or the changed token comparison. "Add tests" with nothing named does not count.
4. **No approval.** Neither the comment nor the answer says LGTM, approved, safe to merge or ready to merge.
5. **The comment carries it.** The posted comment holds the summary, the risky spots with `file:line`, and the test
   gap, and ends with the line `_Automated first look. A maintainer will review._`.

A third risk (secrets in query strings reach proxy and access logs, or the docs tell users to put the secret in a
URL) is fine. A risk about a file the PR does not change fails.

Answer pass or fail, and quote what decided it.
