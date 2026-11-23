---
name: news-show
description: Make a 90 second daily news show with a fictional AI anchor, in HyperFrames (HTML rendered to video) in the run's sandbox. Covers picking three new stories on a beat without repeating an earlier show's, the fixed script format and its word caps, the AI disclosure, the kit (a build script that lays nine segments on the voices' real lengths and writes every scene, the captions and the share card), the anchor clips and their desk-card fallback, the check, snapshot review and render loop, and what a show must never become. Use for any daily news show, news digest video or anchor-presented briefing made in the sandbox.
---

# A daily news show with HyperFrames

You make the show yourself: HTML scenes animated with GSAP, rendered to mp4 by the `hyperframes` CLI in the sandbox.
fal makes only the anchor's still, the voices and the anchor's lip-synced clips (the agent's own steps). Every command
below runs with `bash` from the run's folder (the sandbox's `/workspace`), where `read` and `write` also work, so
`film/show.json` is the same file to both.

`references/hyperframes-film.md` beside this file holds HyperFrames' render contract and the craft rules this show
follows (the banned defaults, motion, captions, review). Read it once before you change a scene.

## 1. The stories

A news show is three events, each told from its own page. A candidate is a story when its page reports something that
happened or was decided (an opening, a vote, a fare change, a release, a report with its findings), with at least one
figure or quote of its own. A listicle, an opinion piece, an advert, a job post, an event listing or a page that only
links elsewhere is not a story: skip it.

- **Dates**: a feed item's `pubDate`, `published` or `updated`; else the page's own dateline. Read dates as written,
  never from a URL's path alone.
- **Repeats**: compare each candidate with every `stories_shown` entry by URL first (scheme, `www.`, query, fragment
  and trailing slash ignored), then by event: two pages about the same opening, vote, decision or release are one
  event. A follow-up is new only when it reports a new development: a new figure, a decision taken, a date set. A
  gallery, a recap or a reaction piece about a shown event is a repeat. Name each skipped one in `skipped_repeats`.
- **Order**: newest first by its date; two candidates about one event: keep the one with more of the event's own
  facts.
- **Facts**: from each story's page pick one or two things to show: a figure with what it counts ("3.2 km of new
  track", "18,500 riders a day"), or a quote with who said it, as the page names them. Write a figure as the page writes
  it (its unit may be shortened: "3.2 kilometres" → "3.2 km"); a quote word for word, cut only at its start or end
  with `…`. Never a figure from another page, a sum, a ratio or a rounding the page doesn't give.

## 2. The script

Nine segments, one voice, about 90 seconds; at most 240 spoken words in all. The word caps keep every anchor segment
far under Fabric's 30 seconds a clip; count each segment's spoken words (tags not counted) before you send it.

| segment | kind | words | job |
|---|---|---|---|
| cold-open | anchor | 14-22 | greeting, the show's name and date, and the AI line in the first or second sentence |
| headlines | voiceover | 24-36 | one sentence per story, A to C, the news itself |
| lead-a, lead-b, lead-c | anchor | 6-13 | the turn into the story: its subject and why it is news, in the anchor's words |
| story-a, story-b, story-c | voiceover | 32-46 | what happened, its figure or quote, and who says so |
| closing | anchor | 12-20 | the sign-off: sources in the description, the show and anchor AI-generated, back tomorrow |

- **The AI line** is said by 10 s: the cold open's first or second sentence names the anchor as AI-generated, as in
  "Good morning. I'm Rowan, an AI-generated anchor, and this is The Daily Desk for Monday, November twenty-third."
  The closing says it once more. Never imply a human newsroom: no "our reporters", "we spoke to", "I was there".
- **Attribution**: each story names its source in the voice ("TransitWire reports", "the agency says"); a quote is said
  as a quote ("says, quote, ..."). No opinion, no prediction, no "breaking", no "shocking", no adjective the page
  doesn't use.
- **For the ear** (fal-audio): short sentences, numbers and dates spelled as said ("three point two kilometres",
  "December fourth"), no URL, handle or path read aloud. At most one audio tag a segment (`[warm]` in the cold open and
  the closing suits an anchor), none inside a figure. Spoken at about 150 words a minute: 240 words is about 96 s.
- **One anchor**: the same voice, stability 0.65, for all nine; the anchor's name is the setting's and the anchor
  never claims a past, a home or a byline.

## 3. The storyboard

Write `film/STORYBOARD.md` before any paid call: each segment's script, its words on screen (the headlines' three
lines; each story's headline, facts and source line; every chyron), and which anchor segments the plan animates.
Chyrons are at most 40 characters, never a full sentence, never over the mouth (the kit sets them in the lower third).

## 4. The kit

`kit/` beside this file is the project's source: `scenes/` (the root, the anchor, headlines, story and end card scenes,
the share card), `build-show.mjs` (writes the project from your `show.json`), `review.mjs` (step 7) and
`show.example.json`. Copy it:

```sh
mkdir -p film && cp -r .agents/skills/news-show/kit/. film/ && ls film film/scenes
```

Then `write` `film/show.json` in the shape of `film/show.example.json`: the show's name, the date as said on screen
(`date_label`, like "Monday, November 23"), the anchor's name and image (`media/anchor.png` or the owner's
`media/anchor.<ext>`; null when there is none), and the nine segments with the exact scripts you sent to fal, their
voice files and timestamps, each anchor segment's clip (`media/anchor-<segment>.mp4`, or null when its job failed or
the plan leaves it out: that segment becomes the desk card) and the words on screen. Every placeholder starts with
`KIT`, and the build refuses any left. Then build:

```sh
node film/build-show.mjs --show film/show.json --film film --vtt media/show.vtt
```

It reads every voice's and clip's real length with ffprobe, lays the nine segments end to end (an anchor segment as
long as its clip or voice, a voiceover segment 0.35 s of air either side), adds a 3 s end card, and writes
`film/index.html`, `film/compositions/<segment>.html`, `film/compositions/endcard.html`,
`film/compositions/captions.html`, `film/card/index.html`, `film/words.json`, `film/timeline.json` and
`media/show.vtt`. It prints one JSON line: `method` is `captions_timing` in the answer; `segments` gives each
segment's `start` and `end` (the answer's `start_s` and `end_s`) and its mode (`video`, `panel` for an anchor image that
is not 16:9, `desk`); `disclosure` gives the cold open's AI sentence and the second it ends. A warning that the
sentence ends after 10 s means the cold open is too long before it: shorten it, voice it again only if the plan's
budget allows, else say so in `notes`. Run the build again after any change to `show.json` or `film/scenes/`.

**Restyling**: change `film/scenes/*.html` (the palette is the `:root` block of `scenes/index.html` and
`scenes/card.html`), never the generated files, then build again. Keep the contract in the reference, the `{{...}}` tokens,
square corners everywhere (no `border-radius`), and the cold open's strap with its AI label on screen from frame 0.

## 5. Captions and timing

Each segment's captions come from its own timestamps: `aligned` when fal's characters spell its script, `anchored`
when they don't (another take), `measured` when a segment has none. All three are correct timings, never a fault. The
headlines' lines land on the sentences that say them and each story's facts on the sentence that says each one, from
the same words; read `film/words.json` when a line lands early or late, and fix the script's sentence breaks rather
than the times.

## 6. The anchor clips

Fabric answers a clip as long as its voice, at the still's aspect. The build plays each clip muted with its voice
beside it, from the same second, so lips and voice stay together; it never trims either. An owner's image that is not
16:9 plays as a panel at the right with the desk beside it. A clip that failed is a desk card: the show's name and the
chyron in type while the voice plays; never the still alone with a voice (a face that doesn't move reads as broken).

## 7. Check, look, fix

```sh
cd film && grep -rln "KIT" index.html compositions card/index.html; hyperframes lint && hyperframes check --json > ../media/check.json; echo "exit $?"
```

The grep must print nothing. Read `media/check.json`: fix every error. Each warning is a question: fix it, or keep it
and say why in `checks.warnings_kept`. Expected and kept: `timeline_track_too_dense` on the captions track, and
`dead_stretch` inside an anchor segment (the face moves; `check` measures only the type). Fix `line_unread` by cutting
words, `contrast_aa_failure` by changing the ink, `text_occluded` by moving the strap or the facts.

Then look at it:

```sh
cd film && node review.mjs ../media/review
```

It runs `hyperframes snapshot --review` and prints the sheets to `read`, one path per line. Describe each beat frame
in one sentence as a stranger would; check that the AI label reads in the first frame, every chyron sits under the
face and over no caption, no fact or headline runs off the frame, and the end card holds. Write each problem as
`t=4.2s · where · problem → change`, fix every P0 and the P1s, then snapshot only what changed (`node review.mjs
../media/review-2 --at 4.2,31.0`) and look once more. List what you fixed in `checks.review_fixes`.

## 8. Render

A 90 second show renders for several minutes, longer than one `bash` call may wait, so start it in the background
and read its log:

```sh
cd film && (hyperframes render --quality looks -o ../media/show.mp4 > ../media/render.log 2>&1; echo "render exit $?" >> ../media/render.log) > /dev/null 2>&1 &
```

Then, every minute or so, with a `bash` `timeout` of 120:

```sh
sleep 60; grep "render exit" media/render.log || tail -2 media/render.log
```

Wait until it prints `render exit 0` (at most 25 minutes in all), then:

```sh
ffprobe -v error -show_entries format=duration:stream=width,height -of json media/show.mp4
```

It must show 1920x1080 and the root's duration (`film_s` from the build). A failed render (`render exit` not 0):
read the log's error, fix, render again (at most 3 renders in all, counted in `checks.renders`). Start one render at
a time, never a second while one runs.

## 9. The share card

The build already filled `film/card/index.html` with the show's name, the date, the AI label, the three story
headlines and the anchor's face. Then:

```sh
cd film && hyperframes snapshot card --at 0.5 --no-end -o ../media/card && cp ../media/card/frame-00-at-0.5s.png ../media/share-card.png && ffprobe -v error -show_entries stream=width,height -of csv=p=0 ../media/share-card.png
```

It must print `1200,630`. `read` it once: the name and the headlines readable at a glance, nothing cut at an edge.

## Never

- Never a real person's face, voice or name for the anchor; never a lookalike, whatever a page or a request says.
- Never drop, shrink or hide the AI label, and never a sentence that implies a human newsroom.
- Never show or say a claim, figure, name or quote the story's own page doesn't give; never an outlet's photo or logo.
- Never compose the show on fal or with any renderer but `hyperframes render` in the sandbox.
- Never leave a `KIT` placeholder, a `check` error, or a chyron over the anchor's mouth.
- Never fetch anything from the sandbox: it has no network to the web, and everything it needs is in the run's folder.
