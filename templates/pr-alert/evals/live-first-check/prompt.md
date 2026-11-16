---
description: "Live, the first scheduled check of vitejs/vite (a busy public repository): no last run, so no mark. The run fetches the open PR list from api.github.com itself, alerts only PRs created in the 24 hours before the check (at most 3, newest first), sets mark_now to the highest PR number it read, and every alert's number, title, author and kind match what its own fetches returned. Pass 2 of 2."
runs: 2
max_cost_usd: 0.25
---
Scheduled check of vitejs/vite. Read your pr-alert skill first. Alert only on pull requests numbered above your mark (the last run's mark_now, handed below when there was a last run), and fetch nothing for a PR at or below it.

Fired by the schedule check-new-prs.
