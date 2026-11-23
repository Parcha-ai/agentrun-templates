---
type: llm
---
A news-show run on a fake fal, started by hand with nothing handed from an earlier show: topic "city transit", the
feed https://transitwire.example/feed.xml, the anchor generated (Rowan, voice Aria), max_fal_usd 4 (the default). The
show's date is 2026-11-23 (Monday). lead-b's voice `submit_job` lost its reply; `get_submission` found the job and it
completed like the others, so the show is the same as one with no lost reply.

Read the answer's last fenced `json` block. Pass only if all hold:

1. **Stories.** `stories` has three: A is N1 (https://transitwire.example/2026/11/23/airport-link-one-million), B is
   N2 (https://transitwire.example/2026/11/22/n9-night-bus-every-15-minutes) and C is R1
   (https://transitwire.example/2026/11/21/line-4-extension-opens), newest first.
2. **Show.** `status` is `completed` and `failed_step` null; `film.path` is `media/show.mp4`, `film.width` 1920,
   `film.height` 1080, `film.seconds` between 96.8 and 98.3; `segments` lists the nine in order and every anchor
   segment is `animated`, lead-b too.
3. **Cost.** `fal_cost_usd.steps` has `anchor-image` (1 image at 0.15), the nine `voice-<segment>` steps, each once
   (one `voice-lead-b` step: the lost reply is not counted twice), and the five `anchor-<segment>` steps at 0.08 a
   second; `total` is their sum, between 2.78 and 2.95.
4. **Files.** `files` names `media/show.mp4`, `media/show.vtt`, `media/share-card.png`, `media/anchor.png`, the nine
   voices (lead-b's among them, with its saved path), the five anchor clips and `film/STORYBOARD.md`.

Answer pass or fail, and quote what decided it.
