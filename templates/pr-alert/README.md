# PR alert (free to run)

Every two hours, it checks one public GitHub repository for pull requests opened since the last check. For each new
PR you get who sent it (a first-time contributor, a regular or a member, from GitHub's `author_association` and their
PRs in the repo), what it says it does, which files and areas it touches, and what to watch: CI workflows, auth code,
dependencies and lockfiles, release and publish paths, install scripts, a body that doesn't match the files, and text
aimed at AI tools. It is not a code review: no line comments and no verdict on the code.

## Runs for $0

- Model: `openrouter/inclusionai/ling-3.2-flash:free` on pi. Put an `OPENROUTER_API_KEY` in your server's
  environment; no credits are needed. Free OpenRouter models allow 50 requests a day with no credits (1,000 a day after
  a one-time $10) and 20 a minute. Ling 3.2 Flash went free on OpenRouter on 2026-11-13; how long it stays free is
  OpenRouter's call. We also tested NVIDIA's Nemotron 3 Ultra free model: it passed 0 of 5 cases, so it isn't offered.
- GitHub: read anonymously with `web_fetch` over `api.github.com` (60 requests an hour per IP address). No GitHub App,
  no webhook and no token, so it runs on a laptop with no public address. Public repositories only: a private one
  answers 404 to an anonymous read.
- Free model endpoints may log prompts. PRs on a public repository are public already. Ling's endpoint (Ant Digital)
  is on OpenRouter's zero-retention list; turn on Settings → Privacy → "ZDR only" in OpenRouter to keep it that way.

## Model requests per check

| Check | Model requests | GitHub requests |
| --- | --- | --- |
| Nothing new | 2: read the skill and the PR list, then answer | 1 |
| New PRs | about 4: that, then the new-PR method, then each new PR's files and its author's history in one turn, then the answer | 1, plus 1 or 2 per new PR |

A day on the free allowance (50 model requests without credits): the default every 2 hours is 12 checks. Twelve
quiet checks use 12 × 2 = 24 requests, which leaves 26 for the checks that find new PRs, about 2 more requests each.
Even if every check found new PRs it would be 12 × 4 = 48. The allowance is per OpenRouter key, so other agents on the
same key share it; add the one-time $10 (1,000 a day) if they do, or set `cron` to every 4 hours (`0 */4 * * *`).

Measured on pi with Ling (2026-11-16, 10 eval runs): 2 to 4 requests with nothing new, 3 to 6 with new PRs.

## Tested

4 of 5 eval cases pass on Ling (8 of 10 runs, 2026-11-16). One grader was narrowed to its stated intent before that
run: in the "nothing new" case the model may fetch the open PR list (a real check always does), but no PR's files and
no author's history. Under the original grader, which allowed no fetch at all, it is 3 of 5 (6 of 10 runs). The case
that still fails, "a regular touches the workflows", fails on detail: the model guesses what a shared CI action it
can't see contains.

## How it remembers

The mark is the highest PR number it has seen, its answer's `mark_now`. AgentRun hands each run its schedule starts
the result of that trigger's last completed run, so the next check starts from that `mark_now` and never alerts a PR
twice. It keeps no learned notes, which saves the extra request a learning step costs every run. The first check sets
the mark and alerts only PRs from the last 24 hours. Edges:

- A failed or stopped run is skipped: the next check starts from the last completed one, so nothing is missed.
- A run that completes with an answer the schema rejects hands over nothing, and the next check starts over as a first
  check (at most 3 PRs from the last 24 hours, which may repeat one).
- A run you start by hand outside the trigger is handed nothing. Use the trigger's "Run now".

## Parameters

`owner` and `repo` (the one repository it reads; it never reads another), `cron` (default every 2 hours) and
`timezone` (default UTC).

## Later

An instant version, alerting within minutes of a PR opening, waits on a feed (RSS/Atom) trigger in AgentRun, which
fires only when a new item appears, so a quiet repository costs no model requests at all. Until that trigger ships,
the schedule is the trigger. A GitHub webhook would be instant too, but it needs a public address and a GitHub App,
which this template avoids.
