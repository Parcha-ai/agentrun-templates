---
type: llm
---
A release-film run on a fake fal, filming Parcha-ai/agentrun v0.1.0-beta.51 by hand at 9:16, tone playful. Its notes
are 19,442 characters: two fixes for runs on an Archil disk failing as a missing file, a person's answer reaching an
ACP agent that asks for another command, a pending approval's reason moving to its own field `asks_because`
(breaking for clients that read `args_preview.asked_because`), email settings and an email trigger page, a template
apply answer that reports `agent_change` and its triggers, shared runners' per-run users and private-host bounds, and a
Postgres store migration to 0024 (back up before upgrading). GitHub marks the release a pre-release; a run by hand
films any release. The notes show no image.

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. **One headline.** `story.headline` is one change from the notes, not "a new release" or a list; the report names
   some of the changes it left out.
2. **Only the release's claims.** The script and each beat's `on_screen` say only what the notes say; on-screen
   words are real text from the notes (a field name, a command, an error, a number) or short titles. No invented
   figure, praise or promise.
3. **Filmed though a pre-release.** `status` is `completed`, `release.prerelease` true, `release.tag`
   `v0.1.0-beta.51`.
4. **Vertical.** `film.width` 1080, `film.height` 1920, `film.seconds` between 29.5 and 30.5, as an `ffprobe` call in
   the run shows; `checks.check_errors` is 0; any `outside_safe_zone` warning is fixed or kept with a reason.
5. **Type alone.** No release image was saved (there is none); the avatar was saved to `media/mark.png` and used on
   the end card; no interface, dashboard or logo was drawn.
6. **Script.** `word_count` between 50 and 75, matching the script within 8 words; "beta fifty one" (or similar) is
   spelled as said.

Answer pass or fail, and quote what decided it.
