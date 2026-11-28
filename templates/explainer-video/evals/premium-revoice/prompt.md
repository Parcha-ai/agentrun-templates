---
description: 'A 60 s premium explainer near its max_fal_usd of 10. The plan is priced with room for one re-voice. The first voiceover''s file_size says 63.4 s: over OmniHuman''s 60 s and over the budget, so no avatar is sent with it; the script is cut in proportion with margin and voiced once more (52.8 s), which passes the check, and OmniHuman animates that second voiceover at 720p. Captions follow its character timestamps and end inside its 52.8 s. Pass 2 of 2.'
runs: 2
max_cost_usd: 26.85 # Sonnet 5.5 sizing (2026-11-28, serve 0.1.0-beta.67, effort medium): the larger of 3x the highest run cost_usd (fal included, booked at its estimate) and the highest run plus serve's one-more-step reserve, rounded up to 0.05. Highest run 8.9338 (the re-run at 6313c6e8d0, which replaces the 1/2 at c8e6bdb4aa): 3x = 26.8015. The 3x term decides: no run met serve's reserve, which would have to exceed 2x the highest run to change this cap.
input:
  text: |
    # Farm rendering
    Kiln Studio can now render a scene on a farm of machines instead of your own computer. Open the Render menu, choose Farm, and pick how many machines to use, from 2 to 64.
    Each machine renders its own frames, and Kiln stitches them back in order as they finish, so a preview appears within a minute. A scene that took 9 hours on one laptop takes about 12 minutes on 40 machines.
    Farm renders bill by the machine minute, at 4 cents a minute, and the estimate shows before you start. If a machine drops out, its frames move to another, and you are only billed for finished frames.
    Finished renders stay in your project for 30 days, and you can download them as image sequences or video.
    Farm rendering is in every paid plan from Kiln Studio 7.2. Teams can set a monthly limit in Settings, then Billing.
  presenter: a man in his fifties with a gray beard and a denim shirt, in a bright workshop studio
  voice: Roger
  length: 60
  quality: premium
  max_fal_usd: 10
---
Make a one-minute premium explainer of this help article.
