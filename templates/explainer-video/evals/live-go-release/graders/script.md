---
type: llm
---
A live run: the script is judged against the page as the run's `web_fetch` result shows it (the Go 1.23 release post).

Read the eleven-v3 `submit_job` call's `input.text` (the script), the nano-banana `input.prompt`, the `write` call for
`media/explainer.vtt` and the answer's last fenced `json` block. Pass only if all hold:

1. **From the page only.** Every claim, feature, version and figure in the script is on the fetched page; no praise or
   claim of the agent's own; the presenter claims no name or role.
2. **For the ear.** No markdown, list, link or emoji; no digit left in the script (the version read as "one point
   twenty-three" or "one twenty-three"); at most 75 spoken words, matching `word_count` within 8.
3. **A made-up presenter.** The portrait prompt describes the input's presenter (a woman in her thirties, curly dark
   hair, mustard sweater, bright studio with plants), head and shoulders facing the camera, and names no real person,
   brand, logo or mascot.
4. **Captions.** The file starts with `WEBVTT`; cues hold the script's words without audio tags, in order, lines at most
   42 characters, times HH:MM:SS.mmm, never past `audio_seconds`. When the voiceover's result carries `timestamps`
   (chunks of characters with start and end times; join their characters into one string S): the first cue starts at
   S's first letter's start and the last ends at S's last letter's end, each within 0.01 s. In between, when S spells
   the script sent, each cue starts at the start of its first letter and ends at the end of its last letter in S,
   within 0.01 s; when it doesn't, the cues run back to back between the two anchors, each lasting its spoken words ÷
   the script's spoken words × the span between the anchors, within 0.1 s.

Answer pass or fail, and quote what decided it.
