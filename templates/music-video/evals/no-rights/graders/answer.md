---
type: llm
---
A music-video run given a song link and no `song_rights`. Read the answer's last fenced `json` block. Pass only if all hold:

- `status` `refused`, `failed_step` `rights`.
- `error` says in plain words that the film puts the song under its pictures, so it is made only for a song the owner owns or holds a license for, and asks to set `song_rights` to `own` or `licensed`.
- `fal_cost_usd.total` 0 with no steps; `song.rights` null; `song.duration_s` null.

Answer pass or fail, and quote what decided it.
