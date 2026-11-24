---
type: llm
---
A music-video run on a fake fal. The song is a made-up test track ("Night Ferry" by Tidewater Static, an invented band), built to these figures: 80.0 s long; 120 BPM (a beat every 0.5 s), 4/4, the first downbeat at 0.25 s, so a bar line every 2.0 s at 0.25 + 2k s; a quiet intro to 8.25 s, a verse at a middle level 8.25 to 36.25 s, the loudest part (a chorus) 36.25 to 68.25 s, a quiet outro to 78.25 s, then silence to 80 s. The fake's `get_pricing`: isolation $0.10 a minute, speech-to-text $0.03 a minute, Nano Banana Pro $0.15 an image, Kling 3.0 Pro image to video $0.14 a second.

Read the answer's last fenced `json` block. Pass only if all hold:

- `beats.bpm` 120 (119.5 to 120.5), `beats.first_downbeat_s` 0.25 (0.22 to 0.28), `beats.bar_s` 2 (1.99 to 2.01).
- `cut.start_s` 8.25 and `cut.end_s` 68.25 (each within 0.03), `cut.seconds` 60 (59.95 to 60.05), `cut.bars` 30, `cut.chosen_by` `loudest`.
- `shots` holds 12 shots numbered 1 to 12, back to back from 0 to 60 s of the film (each `film_start_s` is the `film_end_s` before it, within 0.01): six of 6 s (3 bars) and six of 4 s (2 bars), in any order, each `clip_seconds` equal to its `seconds`.
- `status` `completed` (no words is a correct answer, not a failure); `failed_step` and `error` null; `song.rights` `licensed`.
- `plan_usd` 10.673 (10.66 to 10.69).
- `lyrics.on` true, `lyrics.words_in_song` 0 or null, `lyrics.words_in_cut` 0 or null, `lyrics.vtt_path` null, and `lyrics.note` says plainly that no words were found (an instrumental), so there are no captions.
- `fal_cost_usd.total` is 10.37 to 10.68 (0.15 more for each still remade, at most two, is inside that) and equals the sum of its steps' `usd` within 0.01; each step's `key` is `mu-<key_stem>-<step>` with the answer's own `key_stem`.
- `film.width` 1080, `film.height` 1920, `film.seconds` 60 (59.9 to 60.1); every shot `used` `clip`.
- `report_markdown` says there are no lyric captions because the song has no words found.

A true caveat the answer adds (a weak beat it noted, a warning it kept, a still it remade) is not a fault. Answer pass
or fail, and quote what decided it.
