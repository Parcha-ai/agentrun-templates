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
- each clip starts from its shot's still as the fake fal made it. The check reads fal's answers from the case's own
  fake in this repo (`templates/music-video/evals/<case>/fixtures/fal-mcp.json`, never the run's copy), whole. The
  report's `mcp_calls` carry each call's result too, but as the run's timeline holds it (through the run's redaction,
  each string cut at serve's call-result limit), so the check doesn't read answers there. A still key's `submit_job`
  answer gives its request, and `wait_for_jobs`' completed answer for that request gives its `images[0].url`. Shot n's
  still is its remake's output when the run saved `media/still-<n>-2.png`, else its first take's. A clip given another
  shot's still, or the first take when the remake was saved, is a `SENT FAIL` naming the shot; a shot the fake made no
  still for may start from another shot's (a borrowed still);
- the reads list each job's own handles. A pipeline grader reads the fake's calls cut to fit its prompt, and a
  `submit_job`'s answer is the part a cut takes, so this check holds them, with the answers from the case's own fake as
  above. The first `wait_for_jobs` that reads a still lists every still the run sent (shot 1 to the case's count, first
  takes) with its own `request_id`, `status_url` and `response_url` exactly as its `submit_job` answered them: a still
  it leaves out, or a field that differs, is a `SENT FAIL` naming the shot and the field. Every other job a
  `wait_for_jobs` lists under a request the fake answered one of the run's `submit_job`s with (a clip still pending,
  read again alone) carries that answer's `status_url` and `response_url`. A run with no read of a still has nothing to
  check here;
- `film/price.json` is there and is the price the run built on: its `plan_sha256` is the sha256 of the run's
  `film/plan.json` and `fits` is true. Its lines are the run's to write, so none is trusted: the check prices the plan
  again with the repo's kit (`priceOf`) from `film/plan.json` and the file's `rates`, which must be in their bands
  (`offBand`). The file's `lines` and `plan_usd` must be that price, and that price at or under `max_fal_usd`. Each paid
  call sent under the run's stem is priced from those lines (a remake at its shot's still, from the reserve, as
  `beats.mjs cost` bills it): a call the plan has no line for is a `SENT FAIL` naming it, and the calls sent come to at
  most `max_fal_usd`;
- `max_fal_usd` is the user's: the case's own `prompt.md` input in this repo (never the run's copy or its record), or
  null when it sets none. `film/price.json`'s `max_fal_usd`, and `film/ceiling.json`'s when it is there, must be it;
- `film/cost.json` is there: every step it bills was sent under its key, and every call sent under the run's stem is
  one of its steps. A step it lists as never sent (`unsent`, each a step's name) is neither billed nor sent under its
  key;
- the storyboard is the plan's, read from the run's `storyboard.md` and `film/plan.json` whole, with the kit's own
  storyboard parser (`boardLines`, `isStyleLine`, `fieldsOf`). On a run this size a grader's prompt cuts the run's files
  too (the storyboard's middle and the plan's shots), so the storyboard grader judges only that it was written before
  the first still, and this check holds the rest: the style line first; one line per shot of the case (the count
  above), in order; each line's times and seconds the plan's (shot n's film times are its `start_s` and `end_s` less
  `cut.start_s`, as `plan` prints them); and where `film/lyrics.json` has no words under a shot, a lyric that is empty,
  `none` or `(no words)`. A line too many, a line missing, a line out of order or a time that differs is a `SENT FAIL`
  naming the shot and the field. A run with no `storyboard.md` or no `film/plan.json` is a `SENT FAIL`, as a missing
  record is.

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
| 1 | `SENT FAIL <the first reason> [(and N more)] (repo check; ...)` | a call differs from its file, is missing, was sent twice, a clip starts from another still than its shot's, `film/price.json` or `film/cost.json` is missing or doesn't hold, or a file is missing, of the wrong shape or wrong |
| 2 | `SENT VOID <why>` | no verdict, never a failure: bad arguments, or the report, the run's folder, the fake log, the case's fake fal, shot count or `prompt.md` ceiling can't be found or read (a report that isn't a serve eval report, a log item that isn't a call) |

Node built-ins only, and the repo's own kit (`templates/music-video/skills/music-video/kit/beats.mjs`). The repo's music-video kit tests (`.github/music-video-kit.test.mjs`) cover it.

## launch-video-sent.mjs

A stopgap: it is removed when agentrun #3824 lands and serve's grade can compare a call to what fal answered it.

A launch-video run on a fake fal reads each job with the handles fal answered, cuts the URLs fal answered, saves them,
and times its captions from the voiceover's timestamps. The pipeline graders compared those calls to fal's answers. On a
big run, serve cuts what a grader reads to fit its prompt: fal's answers go first, and the run's files can go too. A
condition that only cut content could show then fails. This check holds those exact parts, with fal's answers read whole
from the case's own fake in this repo (`templates/launch-video/evals/<case>/fixtures/fal-mcp.json`, never the run's
copy and never the answers in the report's calls):

- **read:** every `submission_key` is sent once. Every job a `wait_for_jobs` lists is one the fake answered the run (a
  `submit_job`, a `get_submission` or the compose `run_model`), named by its own `request_id`, `status_url` and
  `response_url` exactly as answered, and listed after that answer. No request is listed twice in one read. The first
  `wait_for_jobs` lists every job queued before it. Every `get_submission` asks for a key a `submit_job` sent before it,
  and a `wait_for_jobs` after it reads the job it found;
- **cut:** there is one `run_model` on `fal-ai/ffmpeg-api/compose`. Its tracks are exactly one video track with each
  clip's URL as the fake made it for that clip's key, in clip order, back to back, each the plan's length (5000 ms on
  Kling, 6000 on Hailuo, the last cut to end at the video's length); one audio track with the voiceover in the cut
  (the re-voice when one was made) at 0 to 1000 ms for at most the video's length; and one with the music at 0 for the
  video's length when the fake made it, none when the fake refused it. No other track or URL. When compose answered
  `processing`, a `wait_for_jobs` after the cut reads that job;
- **save:** a `web_save` saves each URL the fake made for the run to its path: `media/clip-<n>.mp4`,
  `media/voiceover.mp3`, `media/voiceover-2.mp3`, `media/music.mp3` and `media/launch.mp4`. It counts only when the
  report records the call's status as `success` and its result doesn't say `ok: false`; a failed save tried again and
  saved passes;
- **re-voice:** a second voiceover is sent after a `wait_for_jobs` that read the first, with the first one's `voice`
  and `stability`. Where the case's rubric held it (voiceover-overrun), its script has fewer words than the first and at
  most 0.87 times as many, audio tags not counted;
- **captions:** `media/launch.vtt`, read whole from the run's folder, starts `WEBVTT`, every cue time is
  `HH:MM:SS.mmm --> HH:MM:SS.mmm` with minutes and seconds under 60, each cue ends after it starts, and the cues'
  words, in order, are the script's (the voiceover in the cut, audio tags removed). Their timing is what the case's rubric held: on hailuo-compose-processing, the template's rule from the
  voiceover's whole timestamps answer (the first cue at 0.5 s plus the first letter's start, the last at 0.5 s plus the
  last letter's end, each within 0.01 s, back to back, each cue its share of the words within 0.1 s); on the others,
  the first cue's start and the last cue's end within the rubric's bands. injection-on-page and lost-reply-same-key
  hold no captions;
- **keys:** the run left `media/run-keys.json` with its stem, which ties its keys (`lv-<stem>-<step>`) to the fake's
  answers.

What a rubric must judge stays in the rubric: the order of the calls, what the prompts and the script say, and the
answer. Each part that moved says so in one sentence ("... is not judged here: the repo's sent check holds ...").

```sh
node .github/eval-checks/launch-video-sent.mjs <report.json> <the run's work folder, or the serve's data folder>
```

- `<report.json>` is the eval report of one launch-video case, as serve's template eval writes it. A case passed twice
  holds two runs; each run is checked, and a reason names its run (`run 2: ...`). The fake fal's whole log is each
  run's `mcp_calls`; its `web_save` calls are its `calls`.
- The second argument (or `--work <folder>`) is where the run's files are: the run's work folder itself (the folder
  holding `media/`, for a report of one run), or the data folder of the serve that ran it, where each run is
  `disk/agents/<its agent_id>-*/runs/<its run_id>/work`, by exact ids. Without it, the check uses the report's
  `server.data`, and never guesses another folder.
- The case comes from the report. It covers the fake-fal cases that make a film: those with a fake and a `tool_used`
  `graders/clips.md`, whose `count` is the case's number of clips. The video's length and model come from the case's
  own `prompt.md` input. live-python-release runs on real fal and has no fake; user-ceiling makes no film: both are
  `SENT VOID`. A new fake case that makes a film needs its line in the check's `CASES` (what its captions
  condition holds); until it has one, it is `SENT VOID`.

| Exit | Line | Meaning |
| --- | --- | --- |
| 0 | `SENT PASS n=<calls checked> (repo check; serve's grade is separate; stopgap for agentrun #3824)` | every part above holds for every run |
| 1 | `SENT FAIL <the first reason> [(and N more)] (repo check; ...)` | a read, the cut, a save, the re-voice or the captions differs from what the fake answered, or `media/run-keys.json` is missing |
| 2 | `SENT VOID <why>` | no verdict, never a failure: bad arguments, or the report, a run's folder, the fake log, the case's fake, clip count or `prompt.md` input can't be found or read |

Node built-ins only. `.github/launch-video-sent.test.mjs` covers it.

## news-show-sent.mjs

A stopgap: it is removed when agentrun #3824 lands and serve's grade can compare a call to what fal answered it.

A news-show run sends nine voices, a still and up to five anchor clips, reads each job with the handles fal answered,
and builds its captions from the voices' results the run filed at `evidence/fal/<request_id>.json`. The build records
where each segment's timestamps came from in `film/captions-source.json`. On a big run, serve cuts what a grader reads
to fit its prompt: fal's answers and the contents of long writes go first. This check holds the parts a cut hides,
from the report's whole call log and the run's own files:

- **writes:** no `write` or `edit` holds fal's timestamp chunks (`character_start_times_seconds` or
  `character_end_times_seconds`), names a `*-timestamps.json`, or touches `film/captions-source.json` (only the build
  writes it);
- **reads** (show-from-feed, owner-anchor-processing, lost-reply-same-key): every job a `wait_for_jobs` lists is one fal
  answered the run with handles (a `submit_job` or a `get_submission`), listed after that answer, with its own
  `request_id`, and its `status_url` and `response_url`, when given, exactly as answered. No `submission_key` is sent
  again once fal holds its job: an earlier send was answered with handles, or fal's `get_submission` finds it (after a
  lost reply, too);
- **grouped read** (show-from-feed): the first ten `submit_job`s are the nine voices in segment order and then the
  still, with no other call of the run's between them. A `get_pricing` with a single `endpoint_id` just before an
  endpoint's first `submit_job` is the server's spend meter and is not counted. Then one `wait_for_jobs`, the only one
  that reads any of the ten, lists the ten at indexes 0-9 in that order, each with its own `request_id`, `status_url`
  and `response_url`;
- **captions** (the four cases above and live-language-releases): `film/captions-source.json`, read whole from the
  run's folder, has one entry per voice the run sent, and each entry's `request_id` is the request fal answered that
  segment's eleven-v3 voice with (its `submit_job`, or `get_submission` after a lost reply), a request that completed.

fal's answers come from the case's own fake in this repo (`templates/news-show/evals/<case>/fixtures/fal-mcp.json`,
never the run's copy), whole, and the calls the fake got are the report's `mcp_calls`. live-language-releases has no
fake: its fal calls are the report's `calls`, fal's answers their results (a `submit_job`'s answer is short and reaches
the report whole), and a request completed when the run filed it at `evidence/fal/<request_id>.json`. The eval runner
calls the check on fixture runs; a live report can be checked by hand.

What a rubric must judge stays in the rubric: the order of the other calls, the inputs sent, the saves, the film and
the answer. Each part that moved says so in one sentence.

```sh
node .github/eval-checks/news-show-sent.mjs <report.json> <the run's work folder, or the serve's data folder>
```

The arguments, the run's folder and the exits are as for launch-video-sent.mjs above. A case the check holds nothing
for is `SENT VOID`.

Node built-ins only. `.github/news-show-sent.test.mjs` covers it.
