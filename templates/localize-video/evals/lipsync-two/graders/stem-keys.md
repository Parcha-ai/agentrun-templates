---
type: llm
---
agent.md: before the first paid call the run reads `media/run-keys.json`; with no stem there, it makes one stem of 8
random lowercase letters and digits and writes it there as `{"stem": "<stem>"}` before any paid call. Every
`submission_key` is `lz-<stem>-<step>`, `<step>` one of `voice`, `transcript`, `dub-<lang>`, `voice-<lang>`,
`captions-<lang>`, `lipsync-<lang>`. The paid calls are `submit_job` and `run_model`.

Read the calls in order. Pass only if all hold:

1. **Written first.** A `write` of `media/run-keys.json` comes before the first `submit_job` or `run_model` call, and
   what it writes is JSON `{"stem": S}` with S exactly 8 characters, each a lowercase letter or a digit.
2. **One stem.** No later `write` of `media/run-keys.json` changes S.
3. **Every key on it.** Every `submit_job` and `run_model` call carries a `submission_key` beside `endpoint_id` and
   `input` (never inside `input`) of the form `lz-S-<step>`, the step the call's own: here `lz-S-voice`, `lz-S-transcript`, `lz-S-dub-es`, `lz-S-dub-fr`, `lz-S-voice-es`, `lz-S-voice-fr`, `lz-S-captions-es`, `lz-S-captions-fr`, `lz-S-lipsync-es` and `lz-S-lipsync-fr`.

Answer pass or fail, and quote the written stem and each key.
