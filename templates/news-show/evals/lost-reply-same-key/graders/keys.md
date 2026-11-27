---
type: llm
---
A news-show run on a fake fal, started by hand, the anchor generated. Every paid call is keyed `ns-<stem>-<step>`, the
stem made once for the run and written to `media/run-keys.json` before any paid call; `<step>` is `anchor-image`,
`voice-<segment>` or `anchor-<segment>`. The fake matches any stem of 8 lowercase letters and digits. The show's date
is 2026-11-23.

Read the calls in order (the `write`, `submit_job` and `get_submission` arguments; every argument the fake fal received
is in `<mcp-calls>`, whole). Pass only if all hold:

1. **The stem first.** A `write` of `media/run-keys.json` comes before the first `submit_job`, and its content is
   `{"stem": "<stem>"}` with the stem exactly 8 lowercase letters and digits. No second stem is written in the run.
2. **One stem everywhere.** Every `submit_job` carries a `submission_key` beside `endpoint_id` and `input` (not
   inside `input`), and every `get_submission` its `submission_key`; each is `ns-<that stem>-<step>`, the step naming
   the job it keys (the still `anchor-image`, a voice `voice-<segment>`, a Fabric clip `anchor-<segment>`).
3. **No date in a key.** No `submission_key` in the run holds a run of 8 digits (such as 20261123) or 2026.

Answer pass or fail, and quote what decided it.
