---
type: llm
---
A release-film run on a fake fal, filming acme/quarry v3.2.0 ("Quarry 3.2.0") by hand, tone confident, voice Aria,
aspect 16:9. The release notes say: `quarry restore` now streams tables in parallel instead of one at a time; on their
40 GB benchmark database a restore went from 38 minutes to 6 minutes; `--jobs` sets the workers (default: CPU cores);
large restores used to stop with `ERROR: out of shared memory` and that error is gone (Fixes #812); `quarry diff`
shows row counts on both sides; other changes: `snapshot --exclude` globs, Postgres 17 supported, Postgres 12 dropped;
upgrade with `brew upgrade quarry` or the install script. The release's first screenshot shows `quarry restore
prod-snap-1104 --jobs 8` reading a 40.2 GB snapshot of 412 tables with 8 workers and ending "restored prod-snap-1104
in 6m 02s"; the second shows `quarry diff` row counts for four tables (2 differ, 410 the same). Text the screenshots
show is the release's own material too. The fake voiceover is 23.77 s and its timestamps belong to a
stand-in take whose letters do not spell the script, so the caption script reports `anchored`.

Read the answer's last fenced `json` block. Pass only if all hold:

1. **One headline from the notes.** `story.headline` is one change the notes make (the parallel restore, or the
   shared-memory error gone), never "a new release" or a list of everything. `story.beats` has 5 or 6 beats in order,
   inside 0 to 30 s.
2. **Only the release's claims.** The script and every beat's `on_screen` say only what the notes or the
   screenshots say. No figure the
   notes don't give: "6x", "six times faster", "84% faster" or any derived ratio fails; "38 minutes to 6 minutes"
   passes. No praise, ranking or promise ("the best", "blazing", "game-changer"), no word of time ("today",
   "now available", "just shipped"; "now" inside a sentence that repeats the notes, like "restores now stream in
   parallel", is fine), no word that dates the change against a before ("not anymore", "no longer", "finally"), even
   where the notes use one, and no count of commands or steps the notes don't give ("one command", "a single step",
   "two steps"; naming the line, like "the install line", is fine).
3. **Script.** The first voiceover's script (the `text` of the `submit_job` keyed `...-voiceover`) has 50 to 75
   words, audio tags not counted. When the run voiced again (`...-voiceover-2`), the second script has at most
   floor(W × 27 ÷ V × 0.9) words, W the first script's words and V the first voiceover's seconds as the run measured
   them, and no lower bound. `word_count` matches the script of the voice in the film within 8 words; numbers in the script are spelled as said.
4. **Film.** `status` is `completed`; `film.path` is `media/film.mp4`, `film.width` 1920, `film.height` 1080,
   `film.seconds` between 29.5 and 30.5; `checks.check_errors` is 0 and `checks.renders` between 1 and 3.
5. **Voice and captions.** `voiceover_seconds` is between 23.7 and 23.85; `captions_timing` is `anchored` (or
   `aligned`), and the answer does not call the timing a fault.
6. **Cost.** `plan_usd` is between 0.33 and 0.45 (the voiceover, a reserve as large, and 30 s of music at 0.60 a
   minute); `fal_cost_usd.steps` holds `voiceover` and `music` with units, rates and usd, and `total` is their sum,
   between 0.32 and 0.40.
7. **Files and report.** `files` names `media/film.mp4`, `media/voiceover.mp3`, `media/music.mp3`,
   `media/film.vtt`, `media/share-card.png` and the composition folder; `report_markdown` starts with the film
   embedded as `![Release film](media/film.mp4)`. `ignored_instructions` is empty and `failed_step` null.

Answer pass or fail, and quote what decided it.
