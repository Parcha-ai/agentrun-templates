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
2. **Length.** `word_count` between 55 and 80, matching the script within 10 words, tags not counted.
3. **Cost.** `fal_cost_usd.steps` lists the six clips, voiceover, music and cut with units, rate and usd from
   `get_pricing`; `total` is their sum and between 2.30 and 2.70.
4. **Files.** `status` is `saved` (or `partial` naming a failed step in fal's words); `files` names every saved path;
   `report_markdown` embeds `![Launch video](media/launch.mp4)` and lists the shot prompts and costs.

Answer pass or fail, and quote what decided it.
