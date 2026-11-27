---
type: llm
---
A news-show run on a fake fal, started by hand, the anchor generated.
The fake fal answers each job by its key ns-<stem>-<step>, any stem of 8 lowercase letters and digits (the run's
own, written to `media/run-keys.json`). The voices, each completed on the grouped read with character timestamps of a
stand-in take (their letters don't spell the run's script, so the build reports `anchored`):

| segment | key | audio URL | seconds (web_save's duration_s) |
|---|---|---|---|
| cold-open | `ns-<stem>-voice-cold-open` | https://v3.fal.media/files/zebra/U8a6x7C6Zogw4QXuqQnF_output.mp3 | 7.776 |
| headlines | `ns-<stem>-voice-headlines` | https://v3.fal.media/files/zebra/BNBD4orq4amBnDqB3yYm_output.mp3 | 11.376 |
| lead-a | `ns-<stem>-voice-lead-a` | https://v3.fal.media/files/zebra/aZSQpVNJHc7cR9URCzWF_output.mp3 | 4.968 |
| story-a | `ns-<stem>-voice-story-a` | https://v3.fal.media/files/zebra/FeTEJhx8Uw3tM7tXa8oU_output.mp3 | 16.56 |
| lead-b | `ns-<stem>-voice-lead-b` | https://v3.fal.media/files/zebra/QSdhGV7fFTvQQvystYRE_output.mp3 | 5.4 |
| story-b | `ns-<stem>-voice-story-b` | https://v3.fal.media/files/zebra/3U7JfbnKGNuJ2QLcVmdi_output.mp3 | 17.352 |
| lead-c | `ns-<stem>-voice-lead-c` | https://v3.fal.media/files/zebra/qm9W5oXcQJVihn7PnauD_output.mp3 | 4.608 |
| story-c | `ns-<stem>-voice-story-c` | https://v3.fal.media/files/zebra/sUpWhQPQR3tsSC4nirNW_output.mp3 | 15.984 |
| closing | `ns-<stem>-voice-closing` | https://v3.fal.media/files/zebra/RG5h9JnkvNgLRbcDuiY6_output.mp3 | 7.2 |

The still (`ns-<stem>-anchor-image`, `fal-ai/nano-banana-pro`): https://v3.fal.media/files/koala/VqRSLd7cDHMxUGhjPcju.png. The Fabric clips (`veed/fabric-1.0`):

| segment | key | video URL |
|---|---|---|
| cold-open | `ns-<stem>-anchor-cold-open` | https://v3.fal.media/files/lion/CmBzLDFeKswvQXwoAK6a_output.mp4 |
| lead-a | `ns-<stem>-anchor-lead-a` | https://v3.fal.media/files/lion/KRMXNqqH5FUfBP6GsTYR_output.mp4 |
| lead-b | `ns-<stem>-anchor-lead-b` | https://v3.fal.media/files/lion/Kx9WsCraGTF9PnC4bZQ3_output.mp4 |
| lead-c | `ns-<stem>-anchor-lead-c` | https://v3.fal.media/files/lion/utJ69vvh2GsVPu8QaRT8_output.mp4 |
| closing | `ns-<stem>-anchor-closing` | https://v3.fal.media/files/lion/d5CWRNqYH6R2PYpFyr5c_output.mp4 |

The handles each `wait_for_jobs` item carries, and the nine voices and the still sent and read as one group of ten, are
not judged here: the repo's sent check (`news-show-sent.mjs`) holds them.

Read the calls in order (every argument the fake fal received is in `<mcp-calls>`, whole), the run's file names and
the answer's last fenced `json` block, and judge the pipeline. Pass only if all hold:

1. **Research.** The feed https://transitwire.example/feed.xml is read with one `web_fetch`, and each of the three chosen stories' pages with one
   `web_fetch` (at most 6 story pages in all). No `web_search` (the feed gives three new stories).
2. **Priced first.** `film/STORYBOARD.md` is written before the first `get_pricing`, and a `get_pricing` naming the
   three endpoints comes before the first `submit_job`.
3. **Saved.** `web_save` saves each voice's URL to `media/voice-<segment>.mp3` and the still to `media/anchor.png`;
   where the voices' timestamps come from is captions-from-fal's to judge.
4. **The anchor.** Five `submit_job` calls on `veed/fabric-1.0` after the wait that reads the voices and the still, in
   the order cold-open, lead-a, lead-b, lead-c, closing, each `input` with `image_url` https://v3.fal.media/files/koala/VqRSLd7cDHMxUGhjPcju.png, `audio_url` that segment's voice URL above and
   `resolution` "480p"; then one `wait_for_jobs` holding all five at 0-4; each video saved to
   `media/anchor-<segment>.mp4`.
5. **Made in the sandbox.** The kit is copied to `film/` (`film/build-show.mjs` is among the run's files) and built
   there: `film/captions-source.json` and `film/timeline.json` are among the run's files (the build writes them only
   when it succeeds). Shell commands run `hyperframes lint` and `hyperframes check` and the review (`node review.mjs`
   or `hyperframes snapshot --review`), and the run views at least one review sheet with `read`; then `hyperframes
   render`, started with `bash` or `bash_background`, writes `media/show.mp4` (at most 3 render commands, counting
   both tools), and the share card is made with `hyperframes snapshot`. The answer's `film` is 1920x1080: the kit's
   `answer.mjs final` sets it from its own probe of the show, and refuses a show that is not 1920x1080 or a card that
   is not 1200x630.
6. **Paid once.** No job is submitted twice and no fal endpoint but these three is called.
7. **One stem.** Before the first `submit_job` the run `write`s `media/run-keys.json` as `{"stem": "<stem>"}`, the
   stem 8 lowercase letters and digits, and every `submit_job` key is `ns-<that stem>-<step>`, with no date in it.

Answer pass or fail, and quote what decided it.
