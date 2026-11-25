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
- every clip has no audio and the one exact negative prompt;
- each file has the shape the kit writes: an object whose shared fields (`every_still`, `every_clip`) hold only the
  fields the kit puts there, so none can stand in for a field built per still or clip, and whose list items hold
  exactly the kit's fields. A file of another shape is a `SENT FAIL` naming what is wrong, and its calls aren't
  compared.

```sh
node .github/eval-checks/music-video-sent.mjs <report.json> <the run's work folder, or the serve's data folder>
```

- `<report.json>` is the eval report of one music-video run (one case, one run), as serve's template eval writes it.
  The fake fal's whole log is that run's `mcp_calls`: serve copies each call that reached the fake into it, uncut.
- The report doesn't hold the run's files, so the second argument (or `--work <folder>`) names where they are: the run's
  work folder itself (the folder holding `media/`), or the data folder of the serve that ran it. In a data folder, the
  check uses `disk/agents/<the report's agent_id>-*/runs/<the report's run_id>/work`, and only an exact match by both
  ids.
- Without a second argument it tries the data folder the report names as `server.data` (a serve run in process). A
  report can name a folder that has since moved or was never kept: then it prints `SENT VOID no folder at <it>` and
  exits 2. It never guesses another folder.
- The case comes from the report. It covers the fake-fal cases that make a film: those with a
  `graders/clips-negative.md`. `live` runs on real fal and has no fake log: `SENT VOID no fake log: live runs aren't
  checked`.

It prints one line and exits:

| Exit | Line | Meaning |
| --- | --- | --- |
| 0 | `SENT PASS n=<calls checked> (repo check; serve's grade is separate; stopgap for agentrun #3824)` | every still and clip sent equals its file |
| 1 | `SENT FAIL <the first reason> [(and N more)] (repo check; ...)` | a call differs from its file, is missing, was sent twice, or a file is missing, of the wrong shape or wrong |
| 2 | `SENT VOID <why>` | no verdict, never a failure: bad arguments, or the report, the run's folder, the fake log or the case's shot count can't be found or read (a report that isn't a serve eval report, a log item that isn't a call) |

Node built-ins only. The repo's music-video kit tests (`.github/music-video-kit.test.mjs`) cover it.
