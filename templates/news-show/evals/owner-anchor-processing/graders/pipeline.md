---
type: llm
---
A news-show run on a fake fal with the owner's anchor image https://deskcast.example/press/anchor-rowan.png.
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

The still (`ns-<stem>-anchor-image`, `fal-ai/nano-banana-pro`): https://v3.fal.media/files/koala/VqRSLd7cDHMxUGhjPcju.png. The Fabric clips (`veed/fabric-1.0`):

| segment | key | request_id | video URL |
|---|---|---|---|
| cold-open | `ns-<stem>-anchor-cold-open` | c504f3e1-8097-3c53-5fa5-01f1609cc6af | https://v3.fal.media/files/lion/CmBzLDFeKswvQXwoAK6a_output.mp4 |
| lead-a | `ns-<stem>-anchor-lead-a` | 9940226c-b51c-fe3d-3fce-9dc4e7a42207 | https://v3.fal.media/files/lion/KRMXNqqH5FUfBP6GsTYR_output.mp4 |
| lead-b | `ns-<stem>-anchor-lead-b` | 791fe822-c4de-f8b4-3e7e-a4f55a6351f9 | https://v3.fal.media/files/lion/Kx9WsCraGTF9PnC4bZQ3_output.mp4 |
| lead-c | `ns-<stem>-anchor-lead-c` | 944bf577-cdee-97f6-caae-2abd7fe50b2d | https://v3.fal.media/files/lion/utJ69vvh2GsVPu8QaRT8_output.mp4 |
| closing | `ns-<stem>-anchor-closing` | adceb5ee-1936-6f12-fe40-2f5a13c4cf7a | https://v3.fal.media/files/lion/d5CWRNqYH6R2PYpFyr5c_output.mp4 |
In this case no still is made. The Fabric jobs' grouped read answers lead-c (`ns-<stem>-anchor-lead-c`, index 3)
`pending` with `poll_after_seconds` 30 and the other four completed; a one-item read of lead-c's handles (index 3 or 0)
completes it.

Each job's handles are fixed by its key: the `request_id` in the tables, its `status_url`
`https://queue.fal.run/<app>/requests/<request_id>/status` and its `response_url` the same without `/status`, `<app>`
`fal-ai/elevenlabs` for a voice and `veed/fabric-1.0` for a clip. That is what each `submit_job` answered.

<tool-calls> lists every call by number in order, even where its arguments or result are cut. <mcp-calls> holds
every argument the fake fal received, whole: judge each `wait_for_jobs` item's handles there, against the handles
above. A handle that differs from its job's in any character, or sits at another job's index, fails.

Read the calls in order. Pass only if all hold:

1. **No still.** No `submit_job` on `fal-ai/nano-banana-pro`. The owner's image is saved once with `web_save`.
2. **Voices.** Nine voice `submit_job` calls in segment order, then one `wait_for_jobs` with the nine at 0-8, each
   with its own voice's handles as above (in <mcp-calls>).
3. **Fabric.** Five `submit_job` calls on `veed/fabric-1.0`, each `input.image_url` https://deskcast.example/press/anchor-rowan.png and `resolution` "480p";
   one grouped `wait_for_jobs` with the five at 0-4.
4. **The pending clip.** After that read the run reads lead-c again alone (a one-item jobs list with its own
   `request_id`, and its `status_url` and `response_url` when given, lead-c's clip's handles as above), not the four
   already done, and saves its video to `media/anchor-lead-c.mp4`. lead-c is submitted exactly once.
5. **Paid once.** No job is submitted twice.

Answer pass or fail, and quote what decided it.
