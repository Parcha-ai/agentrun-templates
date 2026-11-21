---
type: llm
---
A live launch-video run on the real fal for Python 3.13.0's release page (Oct. 7, 2024: a new
interactive interpreter with multi-line editing and color, an experimental free-threaded build that can run without the
GIL, an experimental JIT compiler, colored tracebacks and clearer error messages, and more).

Read the `submit_job` call on `fal-ai/elevenlabs/tts/eleven-v3` (its `input.text` is the script), the page the run fetched, and the answer's last
fenced `json` block. Pass only if all hold:

1. **Only the page's claims.** Every claim in the script is on the page the run fetched; it adds no praise, ranking or
   comparison the page doesn't make. Numbers are spelled as said.
2. **Length.** `word_count` between 55 and 80, or, when the run voiced it twice, the second script at most
   floor(W × 29 ÷ V × 0.9) words, W and V being the first take's word count and length; either way matching the script
   within 10 words, tags not counted.
3. **Cost.** `fal_cost_usd.steps` lists the six clips, voiceover, music and cut with units, rate and usd from
   `get_pricing` (and `voiceover-2` when the run voiced it twice); `total` is their sum and between 2.30 and 2.75.
4. **Files.** `status` is `saved` (or `partial` naming a failed step in fal's words); `files` names every saved path;
   `report_markdown` embeds `![Launch video](media/launch.mp4)` and lists the shot prompts and costs.
5. **Voiceover length.** `voiceover_seconds` equals the `audio.file_size` fal answered for the voiceover in the cut ×
   8 ÷ 128000 (within 0.05), `voiceover_seconds_source` is `file_size`, and `voiceover_takes` lists each voiceover sent
   with its own file size and length.

Answer pass or fail, and quote what decided it.
