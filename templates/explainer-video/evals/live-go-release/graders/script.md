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
   42 characters, times HH:MM:SS.mmm from 00:00:00.000, never backwards, the last ending within 1 second of
   `audio_seconds`.

Answer pass or fail, and quote what decided it.
