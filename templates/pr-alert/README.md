# PR alert (free to run)

Every four hours, it checks one public GitHub repository for pull requests opened since the last check. For each new
PR you get who sent it (a first-time contributor, a regular or a member, from GitHub's `author_association` and their
PRs in the repo), what it says it does, which files and areas it touches, and what to watch: CI workflows, auth code,
dependencies and lockfiles, release and publish paths, install scripts, a body that doesn't match the files, and text
aimed at AI tools. It is not a code review: no line comments and no verdict on the code.

## Runs for $0

- Model: `openrouter/nvidia/nemotron-3-ultra-550b-a55b:free` (NVIDIA Nemotron 3 Ultra) on pi. Put an
  `OPENROUTER_API_KEY` in your server's environment; no credits are needed. Free OpenRouter models allow 50 requests a
  day with no credits (1,000 a day after a one-time $10) and 20 a minute. How long a model stays free is OpenRouter's
  call. We picked it over the other free models we could run (2026-11-16, 2 runs per case): it was the only one with a
  clean live case. Ling 3.2 Flash passed one more fixture case but no live case; ERNIE 5.5 Flash Preview passed no live
  case; the free Gemma 4 endpoints were rate-limited all day.
- GitHub: read anonymously with `web_fetch` over `api.github.com` (60 requests an hour per IP address). No GitHub App,
  no webhook and no token, so it runs on a laptop with no public address. Public repositories only: a private one
  answers 404 to an anonymous read.
- Free model endpoints may log prompts. PRs on a public repository are public already. NVIDIA's free endpoint is not
  on OpenRouter's zero-retention list, so OpenRouter's "ZDR only" setting turns this model off: leave it off for this
  template, and point it only at public repositories.

## Model requests per check

| Check | Model requests | GitHub requests |
| --- | --- | --- |
| Nothing new | 4 measured: read the skill, fetch the PR list, then answer | 1 |
| New PRs | 5 to 8 measured: that, then the new-PR method, then each new PR's files, its author's history and its page in one turn, then the answer | 1, plus 1 or 2 per new PR |

A day on the free allowance (50 model requests without credits): the default every 4 hours is 6 checks, which use 24
to 48 requests. Every 2 hours would be 12 checks, and 12 quiet checks alone use about 48, so a day with new PRs would
run out; set `cron` to `0 */2 * * *` only with the one-time $10 (1,000 a day). The allowance is per OpenRouter key, so
other agents on the same key share it.

Measured on pi with Nemotron 3 Ultra (2026-11-16, 14 eval runs): 4 requests with nothing new, 5 to 8 with new PRs.

## Tested

On Nemotron 3 Ultra (free), 2 runs per case, 2026-11-16: 3 of 5 eval cases pass (7 of 10 runs). Two miss: in "no
repeats" both runs alerted again PRs an earlier check had already alerted, and in "first-time contributor" one run
wrote the author's history as not read when the search answer was in hand. In the "nothing new" case the model may
fetch the open PR list (a real check always does), but no PR's files and no author's history.

Live (scheduled checks of vitejs/vite, read from GitHub as they ran): 1 of 2 cases (3 of 4 runs), once with no mark
and once with a mark. Every run cited only links its own calls returned, and no run made up a file, count or PR. The
miss: one first check whose PR list GitHub refused (its anonymous limit, 403) said there were no new pull requests
instead of saying the list could not be read. A repeated alert or a missed one can happen on a free model: open the PR
before acting on an alert.

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

`owner` and `repo` (the one repository it reads; it never reads another), `cron` (default every 4 hours) and
`timezone` (default UTC).

## Later

An instant version, alerting within minutes of a PR opening, waits on a feed (RSS/Atom) trigger in AgentRun, which
fires only when a new item appears, so a quiet repository costs no model requests at all. Until that trigger ships,
the schedule is the trigger. A GitHub webhook would be instant too, but it needs a public address and a GitHub App,
which this template avoids.
