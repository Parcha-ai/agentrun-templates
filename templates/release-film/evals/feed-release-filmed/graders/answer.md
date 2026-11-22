---
type: llm
---
A release-film run started by the release feed trigger on acme/quarry (include_prereleases off, the defaults: tone
confident, voice Aria, 16:9), on a fake fal. The feed item is v3.3.0, a stable release (`prerelease: false`), with no
image. Its notes say: an interrupted restore (a dropped connection, a reboot or Ctrl-C) used to start over from the
first table; `quarry restore --resume` now picks up at the table it was on, checking the restored tables against the
snapshot's checksums and skipping them; their example shows `quarry restore prod-snap-1121 --resume` finding 287 of
412 tables already restored, restoring 125 tables with 8 workers, and ending "restored prod-snap-1121 in 1m 48s";
other changes: `quarry snapshot --compress zstd` (#846), `quarry diff --json` (#852), a progress line per worker
(#848); upgrade with `brew upgrade quarry`. The fake voiceover is 23.77 s with stand-in timestamps (the caption script
reports `anchored`).

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. **The feed's release, filmed with no one asking.** `status` is `completed`; `release.tag` is `v3.3.0` and
   `release.prerelease` false; the run did not stop to ask anything.
2. **One headline from the notes.** `story.headline` is one change (the resumed restore), never "a new release" or a
   list; `story.beats` has 5 or 6 beats in order inside 0 to 30 s.
3. **Only the release's claims.** The script and every beat's `on_screen` say only what the notes say; a number keeps
   its case ("1m 48s" is that example's resumed restore, never every restore); no derived ratio, no praise or ranking,
   none of the words "today", "now available", "just shipped", "not anymore", "no longer", "finally" or "at last",
   even where the notes use one (they date the film; other words that set the change against the old way, like "used
   to" or "instead", are fine), and no count of commands or steps the notes don't give ("one command", "a single
   step", "two steps"; naming the line, like "the install line", is fine).
4. **Film.** `film.path` is `media/film.mp4`, 1920x1080, `film.seconds` between 29.5 and 30.5; `checks.check_errors`
   is 0 and `checks.renders` between 1 and 3. With no image in the release, the film is made from its text (the
   command, the example's lines, the version); the owner's avatar is saved to `media/mark.png` and used on the end
   card; no interface, dashboard or logo is drawn.
5. **Cost and files.** `fal_cost_usd.steps` holds `voiceover` and `music` and `total` is their sum, between 0.32 and
   0.40; `files` names `media/film.mp4`, `media/voiceover.mp3`, `media/music.mp3`, `media/film.vtt` and
   `media/share-card.png`; `failed_step` null.

Answer pass or fail, and quote what decided it.
