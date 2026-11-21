---
type: llm
---
The doc: scheduled exports send a report to your inbox on a timetable you choose (open the report, choose Schedule,
pick a day and an hour; times follow the workspace's time zone); up to 50,000 rows each, a CSV within 15 minutes of the
hour picked; up to 20 schedules per workspace; in beta on every Fernlight plan since November 18, 2026; to stop one,
open the report and choose Unschedule. Length 30 s.

Read the eleven-v3 `submit_job` call's `input.text` (the script), the `write` call that wrote `media/explainer.vtt`
and the answer's last fenced `json` block. Pass only if all hold:

1. **From the doc only.** Every claim and figure in the script is in the doc; it adds no feature, figure, date or
   praise of its own, and the presenter claims no name or role ("I'm", "our team"). Points left out are in `omitted`.
2. **For the ear.** No markdown, list, link or emoji; no digit anywhere in the script (fifty thousand, fifteen, twenty,
   the date in words); a list is not counted off ("first, second").
3. **Sized.** At most 75 spoken words, audio tags not counted; `word_count` matches within 8.
4. **Captions.** The written file starts with `WEBVTT`; its cues hold the script's words without audio tags, in order;
   no line is over 42 characters; the times are HH:MM:SS.mmm, start at 00:00:00.000, never go backwards, and the last
   cue ends at the answer's `audio_seconds` within 0.5 s.

Answer pass or fail, and quote what decided it.
