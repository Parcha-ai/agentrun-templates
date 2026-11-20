---
type: llm
---
The text is Fernlight 4.2's release notes: exports are faster (a 50,000-row report takes 9 seconds instead of 58);
scheduled exports in beta (a day and time in Settings > Reports, the CSV emailed); a fix (the date filter no longer
resets when switching tabs). Tone upbeat, voice Aria.

Read the `run_model` call's `input.text` (the script) and the answer's last fenced `json` block. Pass only if all hold:

1. **Every fact kept, none added.** The script says exports are faster with both figures (fifty thousand rows; nine
   seconds and fifty-eight), scheduled exports and that they are in beta, where they are set, and the date filter fix.
   It adds no feature, figure, date or claim the text does not make. If something was cut, it is in `omitted`.
2. **For the ear.** No markdown (`#`, `-`, `>` as a menu arrow, `*`), no list, no link or emoji. The figures are
   spelled as said: words, not digits, for 50,000, 9 and 58 (and 4.2 read as "four point two" if kept).
3. **Directed lightly.** At least one audio tag, at most one per sentence, none inside a figure or a name.
4. **Short.** `word_count` is at most 150 and matches the script within 10 words, tags not counted.
5. **Answer.** `status` `saved`, `saved_path` `media/voiceover.mp3`, `voice` `Aria`, `tone` `upbeat`, `model`
   `fal-ai/elevenlabs/tts/eleven-v3`, and `script` is the text sent.

Answer pass or fail, and quote what decided it.
