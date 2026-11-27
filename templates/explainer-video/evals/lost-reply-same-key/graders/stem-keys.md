---
type: llm
---
agent.md: the kit makes the keys. Before a step's first `submit_job`, a `bash` call runs `run-key.mjs --step <step>`,
which prints `{"key":"ev-<stem>-<step>","stem":"<stem>"}`, and the run sends that key. Its first call makes the run's
one stem; later calls reuse it.

Read the calls in order. Pass only if all hold:

1. **Kit-made.** Before the first `submit_job` of each step (portrait, voiceover, avatar), a `bash` call runs
   `run-key.mjs --step` with that step and prints a key.
2. **One stem.** Every key printed has the same stem S, exactly 8 characters, each a lowercase letter or a digit.
3. **Every key on it.** Every `submit_job` call and every `get_submission` call carries a `submission_key` (beside
   `endpoint_id` and `input` for `submit_job`, never inside `input`) equal to the key printed for its step:
   `ev-S-portrait`, `ev-S-voiceover`, `ev-S-avatar`.

Answer pass or fail, and quote the printed keys and each key sent.
