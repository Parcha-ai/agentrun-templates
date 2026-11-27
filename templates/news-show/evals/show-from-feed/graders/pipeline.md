---
type: llm
---
A news-show run on a fake fal, started by hand, the anchor generated.
The fake fal answers each job by its key ns-<stem>-<step>, any stem of 8 lowercase letters and digits (the run's
own, written to `media/run-keys.json`). The voices, each completed on the grouped read with character timestamps of a
stand-in take (their letters don't spell the run's script, so the build reports `anchored`):

| segment | key | request_id | audio URL | seconds (web_save's duration_s) |
|---|---|---|---|---|
| cold-open | `ns-<stem>-voice-cold-open` | 379495c2-aef0-2af5-c5f2-53f6f65ce628 | https://v3.fal.media/files/zebra/U8a6x7C6Zogw4QXuqQnF_output.mp3 | 7.776 |
| headlines | `ns-<stem>-voice-headlines` | 9edec02b-e473-c7ef-0edc-a9a8a080728a | https://v3.fal.media/files/zebra/BNBD4orq4amBnDqB3yYm_output.mp3 | 11.376 |
| lead-a | `ns-<stem>-voice-lead-a` | a0cad06f-6789-d477-4aca-2a2cdbf5d864 | https://v3.fal.media/files/zebra/aZSQpVNJHc7cR9URCzWF_output.mp3 | 4.968 |
| story-a | `ns-<stem>-voice-story-a` | e709e536-005f-78fb-a0cd-a052645e6f3e | https://v3.fal.media/files/zebra/FeTEJhx8Uw3tM7tXa8oU_output.mp3 | 16.56 |
| lead-b | `ns-<stem>-voice-lead-b` | 28cebb06-fd96-1d4c-069e-ba80a29efd9b | https://v3.fal.media/files/zebra/QSdhGV7fFTvQQvystYRE_output.mp3 | 5.4 |
| story-b | `ns-<stem>-voice-story-b` | e610426b-f61a-94f8-4f1a-aa1b4539c4fa | https://v3.fal.media/files/zebra/3U7JfbnKGNuJ2QLcVmdi_output.mp3 | 17.352 |
| lead-c | `ns-<stem>-voice-lead-c` | 23c11c3d-43b0-1e38-095b-ead4cf710191 | https://v3.fal.media/files/zebra/qm9W5oXcQJVihn7PnauD_output.mp3 | 4.608 |
| story-c | `ns-<stem>-voice-story-c` | a8d23c29-ef8f-4ccc-3e4c-e48f3f8c256a | https://v3.fal.media/files/zebra/sUpWhQPQR3tsSC4nirNW_output.mp3 | 15.984 |
| closing | `ns-<stem>-voice-closing` | 40cd593c-da31-9cd8-6a49-4ba61cedf697 | https://v3.fal.media/files/zebra/RG5h9JnkvNgLRbcDuiY6_output.mp3 | 7.2 |

The still (`ns-<stem>-anchor-image`, `fal-ai/nano-banana-pro`, request_id 51670b2e-c576-2385-cc62-76c8532a961d): https://v3.fal.media/files/koala/VqRSLd7cDHMxUGhjPcju.png. The Fabric clips (`veed/fabric-1.0`):

| segment | key | request_id | video URL |
|---|---|---|---|
| cold-open | `ns-<stem>-anchor-cold-open` | c504f3e1-8097-3c53-5fa5-01f1609cc6af | https://v3.fal.media/files/lion/CmBzLDFeKswvQXwoAK6a_output.mp4 |
| lead-a | `ns-<stem>-anchor-lead-a` | 9940226c-b51c-fe3d-3fce-9dc4e7a42207 | https://v3.fal.media/files/lion/KRMXNqqH5FUfBP6GsTYR_output.mp4 |
| lead-b | `ns-<stem>-anchor-lead-b` | 791fe822-c4de-f8b4-3e7e-a4f55a6351f9 | https://v3.fal.media/files/lion/Kx9WsCraGTF9PnC4bZQ3_output.mp4 |
| lead-c | `ns-<stem>-anchor-lead-c` | 944bf577-cdee-97f6-caae-2abd7fe50b2d | https://v3.fal.media/files/lion/utJ69vvh2GsVPu8QaRT8_output.mp4 |
| closing | `ns-<stem>-anchor-closing` | adceb5ee-1936-6f12-fe40-2f5a13c4cf7a | https://v3.fal.media/files/lion/d5CWRNqYH6R2PYpFyr5c_output.mp4 |

Each job's handles are fixed by its key: the `request_id` in the tables, its `status_url`
`https://queue.fal.run/<app>/requests/<request_id>/status` and its `response_url` the same without `/status`, `<app>`
`fal-ai/elevenlabs` for a voice, `fal-ai/nano-banana-pro` for the still and `veed/fabric-1.0` for a clip. That is what
each `submit_job` answered.

<tool-calls> lists every call by number in order, even where its arguments or result are cut. <mcp-calls> holds
every argument the fake fal received, whole: judge each `wait_for_jobs` item's handles there, against the handles
above. A handle that differs from its job's in any character, or sits at another job's index, fails.

Read the calls (their order, arguments and results) and judge the pipeline. Pass only if all hold:

1. **Research.** The feed https://transitwire.example/feed.xml is read with one `web_fetch`, and each of the three chosen stories' pages with one
   `web_fetch` (at most 6 story pages in all). No `web_search` (the feed gives three new stories).
2. **Priced first.** `film/STORYBOARD.md` is written before the first `get_pricing`, and a `get_pricing` naming the
   three endpoints comes before the first `submit_job`.
3. **Still and voices at once.** Ten `submit_job` calls, the nine voices in segment order then the still, with no
   other call of the run's between them (a `get_pricing` with a single `endpoint_id` just before an endpoint's first
   `submit_job` is the server's spend meter pricing that job, not the run's call, and is not counted); then one
   `wait_for_jobs` holding all ten at indexes 0-8 (the voices in order) and 9 (the still), each item with its own job's
   `request_id`, `status_url` and `response_url` exactly as above (in <mcp-calls>).
4. **Saved.** `web_save` saves each voice's URL to `media/voice-<segment>.mp3` and the still to `media/anchor.png`;
   no `write` holds a voice's timestamps (the run files them at `evidence/fal/<request_id>.json`).
5. **The anchor.** Five `submit_job` calls on `veed/fabric-1.0` after that wait, in the order cold-open, lead-a,
   lead-b, lead-c, closing, each `input` with `image_url` https://v3.fal.media/files/koala/VqRSLd7cDHMxUGhjPcju.png, `audio_url` that segment's voice URL above and
   `resolution` "480p"; then one `wait_for_jobs` holding all five at 0-4, each with its own clip's handles as above
   (in <mcp-calls>); each video saved to `media/anchor-<segment>.mp4`.
6. **Made in the sandbox.** Shell commands copy the kit to `film/`, run `node film/build-show.mjs`, `hyperframes
   lint` and `hyperframes check`, run the review (`node review.mjs` or `hyperframes snapshot --review`), and the run
   views at least one review sheet with `read`; then `hyperframes render` writes `media/show.mp4` (at most 3 render
   commands) and an `ffprobe` of it shows 1920x1080. The share card is made with `hyperframes snapshot` and its probe
   shows 1200x630.
7. **Paid once.** No job is submitted twice and no fal endpoint but these three is called.
8. **One stem.** Before the first `submit_job` the run `write`s `media/run-keys.json` as `{"stem": "<stem>"}`, the
   stem 8 lowercase letters and digits, and every `submit_job` key is `ns-<that stem>-<step>`, with no date in it.

Answer pass or fail, and quote what decided it.
