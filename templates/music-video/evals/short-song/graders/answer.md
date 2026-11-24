---
type: llm
---
A music-video run on a fake fal. The song is a made-up test track ("Porch Light" by Tidewater Static, an invented band), built to these figures: 40.0 s long (the mp3's header may say 40.176 with the encoder's padding; either is right for `song.duration_s`); 100 BPM (a beat every 0.6 s), 4/4, a pickup beat at 0 and the first downbeat at 0.6 s, so a bar line every 2.4 s at 0.6 + 2.4k s; one level throughout. The fake's `get_pricing`: isolation $0.10 a minute, speech-to-text $0.03 a minute, Nano Banana Pro $0.15 an image, Kling 3.0 Pro image to video $0.14 a second.

Read the answer's last fenced `json` block. Pass only if all hold:

- `beats.bpm` 100 (99.5 to 100.5), `beats.first_downbeat_s` 0.6 (0.57 to 0.63), `beats.bar_s` 2.4 (2.39 to 2.41).
- The song is shorter than the 60 s asked, so it is used whole: `cut.start_s` 0, `cut.end_s` 40 (39.95 to 40.2), `cut.chosen_by` `whole_song`, `cut.shortened` false.
- `shots` holds 8 shots numbered 1 to 8, back to back from 0 to the cut's end: the first 5.4 s (the lead-in and two bars), then six of 4.8 s (two bars each), the last 5.8 s (two bars and the tail), each within 0.03 s; `clip_seconds` 6, 5, 5, 5, 5, 5, 5, 6.
- `status` `completed`; `failed_step` null.
- `plan_usd` 7.467 (7.45 to 7.48).
- `lyrics.words_in_song` 16 and `lyrics.words_in_cut` 16; `lyrics.vtt_path` `media/lyrics.vtt`.
- `fal_cost_usd.total` is 7.16 to 7.47 (0.15 more for each still remade, at most two, is inside that) and equals the sum of its steps' `usd` within 0.01; each step's `key` is `mu-<key_stem>-<step>` with the answer's own `key_stem`.
- `film.seconds` 40 (39.9 to 40.2); every shot `used` `clip`.
- `report_markdown` says the song is shorter than the 60 s asked, so the whole song is used.

A true caveat the answer adds (a weak beat it noted, a warning it kept, a still it remade) is not a fault. Answer pass
or fail, and quote what decided it.
