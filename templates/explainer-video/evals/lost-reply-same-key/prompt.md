---
description: 'fal''s reply to the voiceover''s submit_job is lost after the request was sent. The run keys every job ev-<stem>-<step> from the one stem the kit wrote to media/run-keys.json before paying, no date and no source in a key; it reads the voiceover back with get_submission under the same key, follows the handles it answers, never submits the voiceover again, and finishes the explainer. Pass 2 of 2.'
runs: 2
max_cost_usd: 7.85 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 2.6067: 3x = 7.820. The 3x term decides: no run met serve's reserve, which would have to exceed 2x the highest run to change this cap.
input:
  text: |
    # Scheduled exports
    Scheduled exports send a report to your inbox on a timetable you choose. Open the report, choose Schedule, and pick a day and an hour; times follow your workspace's time zone.
    Each scheduled export can hold up to 50,000 rows and arrives as a CSV within 15 minutes of the hour you picked. A workspace can keep up to 20 schedules.
    Scheduled exports are in beta on every Fernlight plan since November 18, 2026. To stop one, open the report and choose Unschedule.
  presenter: a woman in her forties with short gray hair and a navy blazer, in a bright modern studio
  voice: Laura
---
Make an explainer video of this help doc.
