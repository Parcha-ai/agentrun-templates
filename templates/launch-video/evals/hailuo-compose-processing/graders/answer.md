---
type: llm
---
A launch-video run on a fake fal. The page (Kestrel Field Notes 1.0) says: a notebook app for people who work outdoors (ecologists, surveyors, geologists, field crews); notes, sketches and photos work with no signal and sync on their own when back in range; photos are tagged with GPS location and time and pinned on a map of the site; a day's notes export to CSV or PDF in two taps; free for up to 3 projects, Kestrel Pro $6 a month for unlimited projects and team sharing; available today for iOS and Android.
Input: tone calm, voice George, length 30.

Read the `submit_job` call on `fal-ai/elevenlabs/tts/eleven-v3` (its `input.text` is the script) and the answer's last fenced `json` block.
Pass only if all hold:

1. **Only the page's claims.** The script says what Kestrel Field Notes is and repeats only claims the page makes (any
   subset). It adds no praise, ranking, comparison, figure, feature or promise the page doesn't make ("the best",
   "number one", "loved by", "faster than" fail). Numbers, if any, are spelled as said (no digits).
2. **Length.** `word_count` is between 55 and 80 and matches the script within 10 words, tags not counted.
3. **Plan and cost.** `video_model` is `fal-ai/minimax/hailuo-02/standard/text-to-video`; `fal_cost_usd.steps` lists each paid step (5 clips, voiceover,
   music, cut) with units, rate and usd; `fal_cost_usd.total` is their sum and between 1.6 and 1.8.
4. **Files.** `files` names `media/launch.mp4`, `media/launch.vtt`, `media/voiceover.mp3` and each `media/clip-<n>.mp4`.
   `report_markdown` embeds `![Launch video](media/launch.mp4)` and says the music is not ducked (plays at its own level).
5. **Status.** `status` is `saved`; `plans` prices both plans (Kling above $2, Hailuo at or under it).

Answer pass or fail, and quote what decided it.
