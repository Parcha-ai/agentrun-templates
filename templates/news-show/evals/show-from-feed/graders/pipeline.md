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

Read the calls (their order, arguments and results) and judge the pipeline. Pass only if all hold:

1. **Research.** The feed https://transitwire.example/feed.xml is read with one `web_fetch`, and each of the three chosen stories' pages with one
   `web_fetch` (at most 6 story pages in all). No `web_search` (the feed gives three new stories).
2. **Priced first.** `film/STORYBOARD.md` is written before the first `get_pricing`, and a `get_pricing` naming the
   three endpoints comes before the first `submit_job`.
3. **Still and voices at once.** Ten `submit_job` calls, the nine voices in segment order then the still, with no
   other call of the run's between them (a `get_pricing` with a single `endpoint_id` just before an endpoint's first
   `submit_job` is the server's spend meter pricing that job, not the run's call, and is not counted); then one
   `wait_for_jobs` holding all ten at indexes 0-8 (the voices in order) and 9 (the still), each item with its own
   `request_id`, `status_url` and `response_url` as its `submit_job` answered them.
4. **Saved.** `web_save` saves each voice's URL to `media/voice-<segment>.mp3` and the still to `media/anchor.png`;
   each voice's timestamps are written to `media/voice-<segment>-timestamps.json`.
5. **The anchor.** Five `submit_job` calls on `veed/fabric-1.0` after that wait, in the order cold-open, lead-a,
   lead-b, lead-c, closing, each `input` with `image_url` https://v3.fal.media/files/koala/VqRSLd7cDHMxUGhjPcju.png, `audio_url` that segment's voice URL above and
   `resolution` "480p"; then one `wait_for_jobs` holding all five at 0-4 with their own handles; each video saved to
   `media/anchor-<segment>.mp4`.
6. **Made in the sandbox.** Shell commands copy the kit to `film/`, run `node film/build-show.mjs`, `hyperframes
   lint` and `hyperframes check`, run the review (`node review.mjs` or `hyperframes snapshot --review`), and the run
   views at least one review sheet with `read`; then `hyperframes render`, started with `bash` or `bash_background`,
   writes `media/show.mp4` (at most 3 render commands, counting both tools) and an `ffprobe` of it shows 1920x1080. The share card is made with `hyperframes snapshot` and its probe
   shows 1200x630.
7. **Paid once.** No job is submitted twice and no fal endpoint but these three is called.
8. **One stem.** Before the first `submit_job` the run `write`s `media/run-keys.json` as `{"stem": "<stem>"}`, the
   stem 8 lowercase letters and digits, and every `submit_job` key is `ns-<that stem>-<step>`, with no date in it.

Answer pass or fail, and quote what decided it.
