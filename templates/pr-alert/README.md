# PR alert (free to run)

It reads the open pull requests of one public GitHub repository every 30 minutes, and each PR opened since its last
read gets one alert: who sent it (a first-time contributor, a regular or a member, from GitHub's `author_association`
and their PRs in the repo), what it says it does, which files and areas it touches, and what to watch: CI workflows,
auth code, dependencies and lockfiles, release and publish paths, install scripts, a body that doesn't match the files,
and text aimed at AI tools. It is not a code review: no line comments and no verdict on the code.

## Runs for $0

- Model: `openrouter/inclusionai/ling-3.2-flash:free` (Ling 3.2 Flash) on pi. Put an `OPENROUTER_API_KEY` in your
  server's environment; no credits are needed. Free OpenRouter models allow 50 requests a day with no credits (1,000 a
  day after a one-time $10) and 20 a minute. How long a model stays free is OpenRouter's call. Nemotron 3 Ultra
  (free) read pages beyond the skill's URL list and wrote from them, so the template moved to Ling.
- GitHub: read anonymously over `api.github.com` (60 requests an hour per IP address), by the trigger and by the run's
  `web_fetch`. No GitHub App, no webhook and no token, so it runs on a laptop with no public address. Public
  repositories only: a private one answers 404 to an anonymous read.
- Ling's free endpoint is on OpenRouter's zero-retention list, so OpenRouter's "ZDR only" setting keeps it on. Point
  it only at public repositories: it reads GitHub anonymously, and a private one's PRs never reach it.

## Requests

| | Model requests | GitHub requests |
| --- | --- | --- |
| A read with no new PR | 0: no run starts | 1 |
| Each new PR | 2 to 6 measured: read the skill while fetching the PR's files and its author's history, then the answer | 1 or 2 |

The trigger reads the list twice an hour, 48 GitHub requests a day, and a quiet repository costs no model request. The
free allowance (50 model requests a day without credits) covers about 8 to 25 new PRs a day; a busier repository needs
the one-time $10 (1,000 a day). The allowance is per OpenRouter key, so other agents on the same key share it. The
GitHub limit is per IP address, so other tools reading GitHub anonymously from the same machine share it too.

## How it knows what is new

The trigger is a feed trigger on the open PR list, newest first, 30 at a time
(`/repos/<owner>/<repo>/pulls?state=open&sort=created&direction=desc&per_page=30`). It keeps the PR numbers it has
read, and each number it has not read before starts one run with that PR, so no PR is alerted twice and the agent
keeps no notes. Edges:

- Its first read, when you apply it, starts no run: the PRs already open are never alerted.
- More than 30 PRs opened between two reads: the oldest of them are past the list and never alerted.
- A PR that is opened and closed between two reads is never seen.
- An edited PR never fires again: GitHub's list has no updated time the trigger reads. Should one arrive as an
  update, the run posts nothing.
- A large PR (a long body) reaches the run cut to fit 16 KB: its body may end in "…", and the alert says only what is
  there.
- Turning the trigger off and on again forgets what it read: the next read starts over, alerting nothing already open.

## Parameters

`owner` and `repo`: the one repository it reads; it never reads another.

## Tested

On Ling 3.2 Flash (free), 2 runs per case, 2026-11-17: 2 of 3 eval cases pass (5 of 6 runs). The first-time
contributor and the hidden instruction in a PR body (not followed, noted, called suspicious) passed both runs. The miss:
in "regular touches workflows" one run said a new setup action is used by both CI workflows when the patches showed it
in one. Every run fetched only the PR's files and its author's PRs.

Live (one real vitejs/vite PR handed over as the trigger hands it, its files and author read from GitHub as it ran):
1 of 2 runs. The miss summarized a detail from the PR's test patch as something the PR says. No run made up a file,
count or PR. An alert is a pointer, not a review: open the PR before acting on it.
