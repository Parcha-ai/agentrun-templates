---
type: llm
---
agent.md: before the first paid call the run reads `media/run-keys.json`; with no stem there, it makes one stem of 8
random lowercase letters and digits and writes it there as `{"stem": "<stem>"}` before any paid call. Every
`submission_key` is `ev-<stem>-<step>`, `<step>` one of `portrait`, `voiceover`, `voiceover-2`, `avatar`.

Read the calls in order. Pass only if all hold:

1. **Written first.** A `write` of `media/run-keys.json` comes before the first `submit_job` call, and what it writes
   is JSON `{"stem": S}` with S exactly 8 characters, each a lowercase letter or a digit.
2. **One stem.** No later `write` of `media/run-keys.json` changes S.
3. **Every key on it.** Every `submit_job` call and every `get_submission` call carries a `submission_key` (beside
   `endpoint_id` and `input` for `submit_job`, never inside `input`) of the form `ev-S-<step>`: the portrait's
   `ev-S-portrait`, the voiceover's `ev-S-voiceover`, the talking head's `ev-S-avatar`.

Answer pass or fail, and quote the written stem and each key.
