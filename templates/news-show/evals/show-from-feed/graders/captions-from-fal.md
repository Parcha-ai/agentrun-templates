---
type: llm
---
The run files each completed fal job's whole result at `evidence/fal/<request_id>.json`, so the show's build reads
each voice's timestamps from that file and the model never copies them. Every voice completes with timestamps; fal
answered the nine eleven-v3 jobs as these requests:

| segment | request_id |
|---|---|
| cold-open | 379495c2-aef0-2af5-c5f2-53f6f65ce628 |
| headlines | 9edec02b-e473-c7ef-0edc-a9a8a080728a |
| lead-a | a0cad06f-6789-d477-4aca-2a2cdbf5d864 |
| story-a | e709e536-005f-78fb-a0cd-a052645e6f3e |
| lead-b | 28cebb06-fd96-1d4c-069e-ba80a29efd9b |
| story-b | e610426b-f61a-94f8-4f1a-aa1b4539c4fa |
| lead-c | 23c11c3d-43b0-1e38-095b-ead4cf710191 |
| story-c | a8d23c29-ef8f-4ccc-3e4c-e48f3f8c256a |
| closing | 40cd593c-da31-9cd8-6a49-4ba61cedf697 |

Read the calls in order. Pass only if both hold:

1. **From fal's files.** In `film/show.json` as the last `node film/build-show.mjs` run read it (its `write`, and
   any `edit` of it after that), each segment's `timestamps` is `evidence/fal/<request_id>.json` with that
   segment's request_id from the table.
2. **Never copied.** No `write` call, to any path, holds fal's timestamps: chunks of `characters`,
   `character_start_times_seconds` and `character_end_times_seconds`.

Answer pass or fail, and quote what decided it.
