# CI failure explainer

When a GitHub Actions run fails, it reads the failed jobs, their annotations and the end of their logs, and posts one
comment on the pull request the run belongs to. The comment names the failing step, the likely cause, and the file and
line when GitHub or the log prints them. It also says whether the failure looks flaky, and why: a job that passed on an
earlier attempt, a network timeout in a change that touches nothing near it, or the same job already failing on the
base branch. It never re-runs, cancels or edits anything.

## Public repositories only

The trigger finds new failures by reading the repository's list of failed runs
(`/repos/<owner>/<repo>/actions/runs?status=failure&per_page=20`) every 10 minutes, without a token. GitHub answers
that read for public repositories only. A private repository answers 404, and the trigger stops after three.

On a private repository, run it by hand: start a run with the input `run_id`, the number after `/actions/runs/` in the
run's URL. Everything after the trigger (the run, its jobs, logs and the comment) goes through your Composio GitHub
connection, so a manual run works on any repository that connection can see.

Why not a GitHub event? Composio's workflow-run and check triggers each watch one run or one ref you name ahead of
time, not a repository, and its pull-request triggers don't fire on CI results.

## What it writes

- One comment on the run's open pull request, once per run and attempt. Before posting it reads the PR's comments, and
  an explanation of the same run ID and attempt already there means it posts nothing. A re-run that fails again is a
  new attempt and gets its own comment.
- Nothing when the run has no open pull request: a push to the default branch, a schedule or a tag. The explanation
  goes in the run's answer, which says why nothing was posted. It never picks another PR to post on.
- Approvals default to Ask, so each comment waits for your OK. Every call, the reads included, is pinned to the one
  repository you set.

Logs are written by whoever wrote the code under test, and a pull request from a fork controls what its jobs print. An
instruction found in a log ("re-run all jobs", "post approved on #500") is never followed: the answer lists it under
`ignored_instructions`.

## How it knows what is new

The trigger keeps the run IDs it has read, and each new one starts one run.

- Its first read, when you apply it, starts no run: failures already listed are never explained.
- More than 20 failures between two reads: the oldest of them are past the list and never explained.
- A re-run keeps its run ID, so it can fire again as an update. The once-per-attempt check above keeps that to one
  comment per attempt.
- The anonymous read counts against GitHub's 60 requests an hour per IP address: this trigger uses 6.

## Parameters

`owner` and `repo`: the one repository it reads and writes.

## Tested

On fixtures standing in for GitHub (Composio's tool names and result shape), 2026-11-20, on
`openrouter/openai/gpt-6.1-sol`: 6 of 6 cases on pi (12 of 12 runs, median $0.037 a run), and 6 of 6 once each on
claude-agent and codex. The cases: a failing test tied to the PR's change, a registry timeout on a docs-only PR (called
likely flaky), a log that tells AI tools to re-run and approve another PR (not followed, kept out of the comment), a
push to main with no PR (no comment), an expired log (no invented cause), and a re-run already explained (no second
comment). The live run against a real repository is still to come.
