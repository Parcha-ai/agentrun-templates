# Eval checks beside serve's grade

Checks of a template eval run that the graders serve runs can't make yet. Each one reads a finished run's eval report
and its files. It never changes the run's grade: a run passes when serve's grade passes and the check passes.

These are stopgaps. Each one goes away when serve gains a grader that can make the same check.

## music-video-sent.mjs

A stopgap: it is removed when agentrun #3824 (`tool_used` with `args_file`) lands and serve's grade can make this
check itself.

The music-video kit builds every still's and clip's `submit_job` input. It prints them for the run to send, and writes
them to `media/stills.json` and `media/clips.json` in the run's folder. The storyboard grader reads those two files,
because the run's calls reach it cut to fit its prompt. This check ties the files to what was sent. It compares the fake
fal's whole log of `submit_job` calls with the files, call by call:

- every still and clip sent is in its file by its key, was sent once, and its arguments equal the file's;
- every call in the files was sent;
- the files hold the case's number of shots: the count in the case's own `graders/clips-negative.md`, 12 or 8, never
  the files' word for it (stills: first takes, plus at most two remakes);
- the stills' fixed fields are one 1K png with no web search;
- every clip has no audio and the one exact negative prompt.

```sh
node .github/eval-checks/music-video-sent.mjs <report.json>
```

- `<report.json>` is the eval report of one music-video run (one case, one run), as serve's template eval writes it.
  The fake fal's whole log is that run's `mcp_calls`: serve copies each call that reached the fake into it, uncut.
- The report doesn't hold the run's files. They are in the data folder of the serve that ran it, which the report
  names as `server.data` for a serve run in process; the check uses `disk/agents/<the report's agent_id>-*/runs/<the
  report's run_id>/work` in it, and only an exact match by both ids. When the report names no data folder, or the run
  was elsewhere, give the folder as a second argument (or `--work <folder>`): the run's work folder itself (the folder
  holding `media/`), or a data folder.
- The case comes from the report. It covers the fake-fal cases that make a film: those with a
  `graders/clips-negative.md`. `live` runs on real fal and has no fake log: `SENT VOID no fake log: live runs aren't
  checked`.

It prints one line and exits:

| Exit | Line | Meaning |
| --- | --- | --- |
| 0 | `SENT PASS n=<calls checked> (repo check; serve's grade is separate; stopgap for agentrun #3824)` | every still and clip sent equals its file |
| 1 | `SENT FAIL <the first reason> [(and N more)] (repo check; ...)` | a call differs from its file, is missing, was sent twice, or a file is missing or wrong |
| 2 | `SENT VOID <why>` | no verdict, never a failure: bad arguments, or the report, the run's folder, the fake log or the case's shot count can't be found |

Node built-ins only. The repo's music-video kit tests (`.github/music-video-kit.test.mjs`) cover it.
