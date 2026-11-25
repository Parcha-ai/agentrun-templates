---
type: llm
---
A live music-video run of a 30 s song with words, made on ElevenLabs Music, given with `song_rights` `own`. Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **The song, used whole.** `song.duration_s` is between 25 and 35; it is shorter than the 60 s cut asked, so `cut.chosen_by` is `whole_song` and the cut spans the song (`cut.start_s` 0).
2. **On the plan's clock.** `shots` run back to back from 0 to the cut's end, each 3 to 10 s with `clip_seconds` its seconds rounded up; each Kling `submit_job`'s `duration` is its shot's `clip_seconds` as a string, `generate_audio` false.
3. **Priced first.** `get_pricing` comes before the first `submit_job`, and `plan_usd` is a number above 0.
4. **Lyrics.** Isolation, then speech-to-text on the vocals URL isolation answered; `lyrics.words_in_cut` above 0 with `lyrics.vtt_path` `media/lyrics.vtt`, or, if speech-to-text found no words, `lyrics.note` says so plainly.
5. **Clean pictures.** No still or clip prompt asks for words, a logo, a brand or a real person.
6. **Delivered.** `status` `completed` (or `partial` naming a failed step in fal's words, with that shot shown as its still); `film.seconds` within 0.1 of `cut.seconds`; `fal_cost_usd.total` between 2 and 7 and the sum of its steps.

A true caveat the answer adds (a weak beat, a kept warning, a remade still) is not a fault. Answer pass or fail, and quote what decided it.
