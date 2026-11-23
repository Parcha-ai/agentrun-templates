---
type: llm
---
A news-show run on a fake fal with the owner's anchor image https://deskcast.example/press/anchor-rowan.png.
The fake fal answers each job by its key ns-20261123-<step>. The voices, each completed on the grouped read with
character timestamps of a stand-in take (their letters don't spell the run's script, so the build reports `anchored`):

| segment | key | audio URL | seconds (web_save's duration_s) |
|---|---|---|---|
| cold-open | `ns-20261123-voice-cold-open` | https://v3.fal.media/files/zebra/U8a6x7C6Zogw4QXuqQnF_output.mp3 | 7.776 |
| headlines | `ns-20261123-voice-headlines` | https://v3.fal.media/files/zebra/BNBD4orq4amBnDqB3yYm_output.mp3 | 11.376 |
| lead-a | `ns-20261123-voice-lead-a` | https://v3.fal.media/files/zebra/aZSQpVNJHc7cR9URCzWF_output.mp3 | 4.968 |
| story-a | `ns-20261123-voice-story-a` | https://v3.fal.media/files/zebra/FeTEJhx8Uw3tM7tXa8oU_output.mp3 | 16.56 |
| lead-b | `ns-20261123-voice-lead-b` | https://v3.fal.media/files/zebra/QSdhGV7fFTvQQvystYRE_output.mp3 | 5.4 |
| story-b | `ns-20261123-voice-story-b` | https://v3.fal.media/files/zebra/3U7JfbnKGNuJ2QLcVmdi_output.mp3 | 17.352 |
| lead-c | `ns-20261123-voice-lead-c` | https://v3.fal.media/files/zebra/qm9W5oXcQJVihn7PnauD_output.mp3 | 4.608 |
| story-c | `ns-20261123-voice-story-c` | https://v3.fal.media/files/zebra/sUpWhQPQR3tsSC4nirNW_output.mp3 | 15.984 |
| closing | `ns-20261123-voice-closing` | https://v3.fal.media/files/zebra/RG5h9JnkvNgLRbcDuiY6_output.mp3 | 7.2 |

The still (`ns-20261123-anchor-image`, `fal-ai/nano-banana-pro`): https://v3.fal.media/files/koala/VqRSLd7cDHMxUGhjPcju.png. The Fabric clips (`veed/fabric-1.0`):

| segment | key | video URL |
|---|---|---|
| cold-open | `ns-20261123-anchor-cold-open` | https://v3.fal.media/files/lion/CmBzLDFeKswvQXwoAK6a_output.mp4 |
| lead-a | `ns-20261123-anchor-lead-a` | https://v3.fal.media/files/lion/KRMXNqqH5FUfBP6GsTYR_output.mp4 |
| lead-b | `ns-20261123-anchor-lead-b` | https://v3.fal.media/files/lion/Kx9WsCraGTF9PnC4bZQ3_output.mp4 |
| lead-c | `ns-20261123-anchor-lead-c` | https://v3.fal.media/files/lion/utJ69vvh2GsVPu8QaRT8_output.mp4 |
| closing | `ns-20261123-anchor-closing` | https://v3.fal.media/files/lion/d5CWRNqYH6R2PYpFyr5c_output.mp4 |
In this case no still is made. The Fabric jobs' grouped read answers lead-c (`ns-20261123-anchor-lead-c`, index 3)
`pending` with `poll_after_seconds` 30 and the other four completed; a one-item read of lead-c's handles (index 3 or 0)
completes it.

Read the calls in order. Pass only if all hold:

1. **No still.** No `submit_job` on `fal-ai/nano-banana-pro`. The owner's image is saved once with `web_save`.
2. **Voices.** Nine voice `submit_job` calls in segment order, then one `wait_for_jobs` with the nine at 0-8, each
   with its own handles.
3. **Fabric.** Five `submit_job` calls on `veed/fabric-1.0`, each `input.image_url` https://deskcast.example/press/anchor-rowan.png and `resolution` "480p";
   one grouped `wait_for_jobs` with the five at 0-4.
4. **The pending clip.** After that read the run reads lead-c again alone (a one-item jobs list with its own
   `request_id`, and its `status_url` and `response_url` when given, as its `submit_job` answered them), not the four
   already done, and saves its video to `media/anchor-lead-c.mp4`. lead-c is submitted exactly once.
5. **Paid once.** No job is submitted twice.

Answer pass or fail, and quote what decided it.
