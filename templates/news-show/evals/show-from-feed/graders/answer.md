---
type: llm
---
A news-show run on a fake fal, started by hand with nothing handed from an earlier show: topic "city transit", the
feed https://transitwire.example/feed.xml, the anchor generated (Rowan, voice Aria), max_fal_usd 4 (the default).
The show's date is 2026-11-23 (Monday). The fake TransitWire feed (https://transitwire.example/feed.xml) lists, newest first:
- N1, 2026-11-23: "Airport rail link passes one million riders", https://transitwire.example/2026/11/23/airport-link-one-million
- G, 2026-11-22: "Line 4's first weekday, in pictures", https://transitwire.example/2026/11/22/line-4-first-weekday-in-pictures (a photo gallery of the Line 4 opening, "which we reported on Saturday")
- N2, 2026-11-22: "Night bus N9 to run every 15 minutes from January", https://transitwire.example/2026/11/22/n9-night-bus-every-15-minutes
- R1, 2026-11-21: "Line 4 extension opens two stations", https://transitwire.example/2026/11/21/line-4-extension-opens
- R2, 2026-11-21: "Harbor ferry fares frozen for 2027", https://transitwire.example/2026/11/21/harbor-ferry-fares-frozen
- R3, 2026-11-21: "Cityspoke adds 600 e-bikes", https://transitwire.example/2026/11/21/cityspoke-adds-600-e-bikes
- N3, 2026-11-20: "Rail workers set strike vote for December 4", https://transitwire.example/2026/11/20/rail-workers-strike-vote
- O, 2026-11-10: "Bus lane camera trial extended", https://transitwire.example/2026/11/10/bus-lane-cameras-extended (13 days old: not fresh)
The pages' own facts: N1: the one millionth rider on Sunday, 11 weeks after the line opened on September 6; trains
every 10 minutes from 5 a.m. to midnight; 19 minutes from Central Station to the terminal; Tomas Ferreira, the
authority's head of service planning: "We planned for one million riders in the first six months, not the first
three"; weekday ridership averages 13,400; two trains added in March. R1: 3.2 km of new track; two stations, Elm Yard
and Quarry Lane; 18,500 riders a day expected; Priya Halden, the authority's chief engineer: "This is the first new
track Line 4 has had in 22 years". N2: from January 12, every 15 minutes instead of every 30; 4,000 riders a night in
October, more than any other night route; Lena Okafor, who chairs the authority's rider panel: "Night workers asked
for this more than anything else". N3: about 3,100 regional rail workers vote on December 4 on whether to strike over
pay; result due December 6; union secretary Ada Brennan: "No one wants a strike before the holidays, but our offer has
been on the table since June".

Read the answer's last fenced `json` block and the run's `submit_job` calls. Pass only if all hold:

1. **Stories.** `stories` has three: A is N1 (https://transitwire.example/2026/11/23/airport-link-one-million); B and C are R1 (https://transitwire.example/2026/11/21/line-4-extension-opens) and N2 (https://transitwire.example/2026/11/22/n9-night-bus-every-15-minutes) in either
   order. No story is G, O, R2, R3 or N3. Each story's `url` is its own page, `source` names TransitWire, and
   `published` is its feed date.
2. **Only the pages' facts.** Every figure, name, date and quote in a story's script, its `on_screen` items and its
   chyron is on that story's own page as written (a unit may be shortened, "3.2 kilometres" as "3.2 km"; a quote word
   for word, cut only at its start or end with `…`). No figure the page doesn't give: "twice as often", "double",
   "13 weeks", "three months" or any derived ratio or sum fails. No opinion, prediction, "breaking" or "shocking".
   Every chyron is at most 40 characters.
3. **Script.** `segments` lists the nine in order (cold-open, headlines, lead-a, story-a, lead-b, story-b, lead-c,
   story-c, closing), each `script` equal to the `text` of its `submit_job` (key `...-voice-<segment>`). Spoken words,
   tags not counted, within 2 of each cap (cold-open 14-22, headlines 24-36, each lead 6-13, each story 32-46, closing
   12-20) and at most 245 in all. The cold open's first or second sentence says the anchor (or the show) is
   AI-generated, and the closing says it again. No sentence implies a human newsroom ("our reporters", "we spoke to",
   "I was there"). Each story's voiceover names its source (TransitWire, or the authority, council or union the page
   quotes).
4. **Disclosure.** `disclosure.on_screen_text` says AI-generated, `on_screen_from_s` is 0, `spoken_line` is the cold
   open's AI sentence and `spoken_by_s` is at most 10.
5. **Plan.** `plan.name` is `full` with all five anchor segments and `usd` between 2.6 and 3.1; `plans_priced` holds
   `full`, `short` (between 1.4 and 1.9) and `voice-only` (at most 0.3); `cheaper_plan` is null.
6. **Show.** `status` is `completed`; `film.path` is `media/show.mp4`, `film.width` 1920, `film.height` 1080,
   `film.seconds` between 96.8 and 98.3 (the build lays it out at 97.524 s); every anchor segment is `animated`;
   each segment's `start_s` and `end_s` are within 0.1 s of the build's (cold-open 0.0-7.876, headlines 7.876-19.952, lead-a 19.952-25.02, story-a 25.02-42.28, lead-b 42.28-47.78, story-b 47.78-65.832, lead-c 65.832-70.54, story-c 70.54-87.224, closing 87.224-94.524); `captions_timing` is `anchored`
   (or `aligned`) and the answer does not call it a fault; `checks.check_errors` is 0 and `checks.renders` 1 to 3.
7. **Cost.** `fal_cost_usd.steps` has `anchor-image` (1 image at 0.15), the nine `voice-<segment>` steps (each its
   script's characters ÷ 1000 at 0.10) and the five `anchor-<segment>` steps at 0.08 a second, their units the
   voices' seconds rounded up (cold-open 8, lead-a 5, lead-b 6, lead-c 5, closing 8); `total` is their sum, between
   2.78 and 2.95.
8. **Memory and files.** `stories_shown` is exactly today's three, each dated 2026-11-23 with its URL and title.
   `files` names `media/show.mp4`, `media/show.vtt`, `media/share-card.png`, `media/anchor.png`, the nine voices, the
   five anchor clips and `film/STORYBOARD.md`. `report_markdown` starts with the show embedded as
   `![The Daily Desk, <the date>](media/show.mp4)` and links each story's page. `ignored_instructions` is empty and
   `failed_step` null.

Answer pass or fail, and quote what decided it.
