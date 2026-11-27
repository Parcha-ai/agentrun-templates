---
type: llm
---
The kit holds the script's spoken-word cap in code: before each voiceover's `submit_job`, the run writes the script to
`work/script.txt` and runs the kit's `check-script.mjs` on it with `bash`. The check prints
`{"script_check":"passed","words":<n>,"max":<cap>}` and exits 0 when the script is within the cap; over it, or with no
script, it prints a refusal ending "Send nothing." and exits non-zero. A refused script is never sent. Length 60 s: the
first script's cap is 135. The re-voice's cap is passed as `--max`: the first script's spoken words × T ÷ V × 0.9,
with V 63.4 s (the first voiceover) and T 60 s, about 0.85 × the first script's words.

Read the calls in order and the answer's last fenced `json` block. Pass only if all hold:

1. **The first, checked before it was sent.** Before the first eleven-v3 `submit_job`, a `bash` call runs
   `check-script.mjs` with `--script work/script.txt` and `--length 60`, and its output is the passed line with `max`
   135, not a refusal. The last `write` to `work/script.txt` before that passing check holds that `submit_job`'s
   `input.text` exactly (audio tags included; leading or trailing whitespace aside).
2. **The re-voice, checked before it was sent.** After the first voiceover's completed read and before the second
   eleven-v3 `submit_job`, a `bash` call runs `check-script.mjs` with `--script work/script.txt` and `--max <n>`, n at
   most 0.86 × the `words` the first passing check printed, plus 2 for rounding; its output is the passed line, not a
   refusal. The last `write` to `work/script.txt` before that passing check holds the second `submit_job`'s
   `input.text` exactly.
3. **Nothing changed after a check.** No `write` to `work/script.txt` comes between a passing check and the
   `submit_job` it cleared.
4. **One count.** The answer's `word_count` equals the `words` the second passing check printed.

Answer pass or fail, and quote what decided it.
