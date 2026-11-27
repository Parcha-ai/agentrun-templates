---
type: llm
---
The kit holds the script's spoken-word cap in code: before the voiceover's `submit_job`, the run writes the script to
`work/script.txt` and runs the kit's `check-script.mjs` on it with `bash`. The check prints
`{"script_check":"passed","words":<n>,"max":<cap>}` and exits 0 when the script is within the cap; over it, or with no
script, it prints a refusal ending "Send nothing." and exits non-zero. A refused script is never sent. Length 30 s:
the cap is 75.

Read the calls in order and the answer's last fenced `json` block. Pass only if all hold:

1. **Checked before it was sent.** Before the eleven-v3 `submit_job`, a `bash` call runs `check-script.mjs` with
   `--script work/script.txt` and `--length 30`, and its output is the passed line with `max` 75, not a refusal.
2. **The script checked is the script sent.** The last `write` to `work/script.txt` before that passing check holds
   the eleven-v3 `input.text` exactly (audio tags included; leading or trailing whitespace aside), and no `write` to
   `work/script.txt` comes between that check and the `submit_job`.
3. **One count.** The answer's `word_count` equals the `words` that passing check printed.

Answer pass or fail, and quote what decided it.
