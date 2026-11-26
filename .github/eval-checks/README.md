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
- each file is what the kit builds: the check rebuilds both records with the kit's own functions (imported from this
  repo, never the copy in the run's folder) from the run's `film/plan.json`, `storyboard.md` and the key stem in
  `media/run-keys.json`, the remakes by the kit's rules, the clips with the still URLs the record holds, and the first
  field that differs is a `SENT FAIL` naming the shot. A record in the kit's shape that the kit would not have built
  (a picture not in the storyboard, a duplicate shot, another key stem, a remake of no first take, a clip length not
  the plan's) fails even when its calls were sent to match;
- each file has the shape the kit writes: only the kit's top-level fields, `each_prompt` the kit's exact
  `<style>. <picture>. No text, no lettering, no logos.`, the shared fields (`every_still`, `every_clip`) holding only the
  fields the kit puts there, so none can stand in for a field built per still or clip, and whose list items hold
  exactly the kit's fields. A file of another shape is a `SENT FAIL` naming what is wrong, and its calls aren't
  compared.
- each clip starts from its shot's still as the fake fal made it. The fake log holds each call's arguments only, never
  fal's answers, so the check reads the answers from the case's own fake in this repo
  (`templates/music-video/evals/<case>/fixtures/fal-mcp.json`, never the run's copy): a still key's `submit_job` answer
  gives its request, and `wait_for_jobs`' completed answer for that request gives its `images[0].url`. Shot n's still is
  its remake's output when the run saved `media/still-<n>-2.png`, else its first take's. A clip given another shot's
  still, or the first take when the remake was saved, is a `SENT FAIL` naming the shot; a shot the fake made no still
  for may start from another shot's (a borrowed still);
- `film/price.json` is there and is the price the run built on: its `plan_sha256` is the sha256 of the run's
  `film/plan.json` and `fits` is true. Its lines are the run's to write, so none is trusted: the check prices the plan
  again with the repo's kit (`priceOf`) from `film/plan.json` and the file's `rates`, which must be in their bands
  (`offBand`). The file's `lines` and `plan_usd` must be that price, and that price at or under `max_fal_usd`. Each paid
  call sent under the run's stem is priced from those lines (a remake at its shot's still, from the reserve, as
  `beats.mjs cost` bills it): a call the plan has no line for is a `SENT FAIL` naming it, and the calls sent come to at
  most `max_fal_usd`.

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
| 1 | `SENT FAIL <the first reason> [(and N more)] (repo check; ...)` | a call differs from its file, is missing, was sent twice, a clip starts from another still than its shot's, `film/price.json` is missing or doesn't hold, or a file is missing, of the wrong shape or wrong |
| 2 | `SENT VOID <why>` | no verdict, never a failure: bad arguments, or the report, the run's folder, the fake log, the case's fake fal or the case's shot count can't be found or read (a report that isn't a serve eval report, a log item that isn't a call) |

Node built-ins only, and the repo's own kit (`templates/music-video/skills/music-video/kit/beats.mjs`). The repo's music-video kit tests (`.github/music-video-kit.test.mjs`) cover it.
