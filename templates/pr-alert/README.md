# PR alert (free to run)

It reads the open pull requests of one public GitHub repository every 30 minutes, and each PR opened since its last
read gets one alert: who sent it (a first-time contributor, a regular or a member, from GitHub's `author_association`
and their PRs in the repo), what it says it does, which files and areas it touches, and what to watch: CI workflows,
auth code, dependencies and lockfiles, release and publish paths, install scripts, a body that doesn't match the files,
and text aimed at AI tools. It is not a code review: no line comments and no verdict on the code.

## Runs for $0

- Model: `openrouter/nvidia/nemotron-3.5-super-vl:free` (Nemotron 3.5 Super VL), served by NVIDIA, on pi. Put an
  `OPENROUTER_API_KEY` in your server's environment; no credits are needed. OpenRouter's free models allow 20 requests
  a minute and, per account, 50 a day until the account has bought $10 of credits in all, then 1,000 a day; the day
  resets at 00:00 UTC. The endpoint takes up to 868,928 tokens in and 131,072 out. How long a model stays free is
  OpenRouter's call. The template left Ling 3.2 Flash (free) on 2026-11-20, when its shared upstream pool answered
  most requests with a rate-limit error.
- Set AGENTRUN_FREE_MODEL_REQUESTS=20 on your server so one bad run uses at most 20 of your daily free requests (the
  default is 60).
- GitHub: read anonymously over `api.github.com` (60 requests an hour per IP address), by the trigger and by the run's
  `web_fetch`. No GitHub App, no webhook and no token, so it runs on a laptop with no public address. Public
  repositories only: a private one answers 404 to an anonymous read.
- NVIDIA's free endpoint keeps data. Under NVIDIA's API trial terms it may log what it is sent and use it to improve
  its products, AI models included, and the terms ask you not to send confidential or personal data. It is not on
  OpenRouter's zero-retention list, so OpenRouter's "ZDR only" setting turns it off. Point it only at public
  repositories: it reads GitHub anonymously, and a private one's PRs never reach it.

## Requests

| | Model requests | GitHub requests |
| --- | --- | --- |
| A read with no new PR | 0: no run starts | 1 |
| Each new PR | 3 to 9 measured (median 6): read the skill while fetching the PR's files and its author's history, then the answer | 1 or 2 |

The trigger reads the list twice an hour, 48 GitHub requests a day, and a quiet repository costs no model request. The
free allowance (50 model requests a day until $10 of credits is bought) covers about 5 to 15 new PRs a day; a busier
repository needs the $10 (1,000 a day). The allowance is per OpenRouter account, so every key and agent on it shares
it. The GitHub limit is per IP address, so other tools reading GitHub anonymously from the same machine share it too.

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

On Nemotron 3.5 Super VL (free), 2 runs per case, 2026-11-21: all 3 eval cases pass (6 of 6 runs). The first-time
contributor is named as one, the hidden instruction in a PR body is not followed, is noted and called suspicious, and
a regular contributor's workflow change is reported from the patches as they read. An earlier pass on 2026-11-21 wrote
the author as "first_time" in two runs; the skill now names the words to use.

Live (one real vitejs/vite PR handed over as the trigger hands it, its files and author read from GitHub as it ran):
2 of 2 runs, 7 model requests each. No run made up a file, count or PR. An alert is a pointer, not a review: open the
PR before acting on it.
