---
type: llm
---
agent.md: before the first paid call the run reads `media/run-keys.json`; with no stem there, it makes one stem of 8
random lowercase letters and digits and writes it there as `{"stem": "<stem>"}` before any paid call. Every
`submission_key` is `lv-<stem>-<step>`, `<step>` one of `clip-1` ... `clip-N`, `voiceover`, `voiceover-2`, `music`,
`cut`. The paid calls are `submit_job` and `run_model`.

Read the calls in order and the answer's last fenced `json` block. Pass only if all hold:

1. **Written first.** A `write` of `media/run-keys.json` comes before the first `submit_job` call, and what it writes
   is JSON `{"stem": S}` with S exactly 8 characters, each a lowercase letter or a digit.
2. **One stem.** No later `write` of `media/run-keys.json` changes S.
3. **Every key on it.** Every `submit_job`, `run_model` and `get_submission` call carries a `submission_key` (beside
   `endpoint_id` and `input` for `submit_job` and `run_model`, never inside `input`) of the form `lv-S-<step>`: the
   clips' `lv-S-clip-1` ... `lv-S-clip-6`, in shot order, the voiceover's `lv-S-voiceover`, the music's `lv-S-music`
   and the cut's `lv-S-cut`.
4. **Listed.** `files` lists `media/run-keys.json`.

Answer pass or fail, and quote the written stem and each key.
