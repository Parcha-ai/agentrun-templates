<!--
  Adapted from the HyperFrames agent skills shipped in the npm package hyperframes@0.9.78
  (dist/skills/hyperframes: SKILL.md, references/spec.md, story.md, motion.md, captions.md, review.md,
  types/launch.md), Copyright HeyGen, licensed under the Apache License, Version 2.0
  (https://www.apache.org/licenses/LICENSE-2.0). Source: https://github.com/heygen-com/hyperframes
  Modified for this template: condensed to what a 90 second news show needs, Studio, telemetry, registry and
  media commands removed, commands written for the `hyperframes` CLI on the sandbox's PATH, and the show's
  segments added. Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
-->

# HyperFrames for a news show

HyperFrames renders HTML to video by seeking a paused GSAP timeline frame by frame, so every render is identical.
`index.html` is the root composition: it mounts one scene per sub-composition from `compositions/`. Media and images
live in `assets/`.

## The contract

`hyperframes check --json` reports most violations with a `Fix:` line.

1. Every timed element has `class="clip"`, `data-start` and `data-duration` in seconds, and shows over
   `[start, start + duration)`: land an end state just before its end. `data-track-index` is only a lane; paint order
   is `z-index`.
2. The video's length is the root's `data-duration`: overrun is cut, an early end holds the last frame.
3. Each composition builds one paused timeline and registers it after its tweens:
   `window.__timelines["<data-composition-id>"] = tl`.
4. No `Date.now()`, unseeded `Math.random()`, network fetches, timers or `repeat: -1`. Everything visible is a
   function of timeline time.
5. Never tween `display`, `visibility` or `autoAlpha` on a `.clip`; animate a child.
6. No CSS `transform` on an element GSAP transforms; animate transforms, not `left`/`top`/`width`/`height`.
7. Never `play()`, `pause()` or seek media. Music and voice are each an `<audio>` with an `id` (one without is left
   out of the mix). No `crossorigin` on media.
8. Only the bundled fonts resolve by name (League Gothic, Inter, JetBrains Mono among them); any other family needs
   `@font-face` to a file in `assets/fonts/`.
9. Asset paths are `assets/...` with no leading `/`, in sub-compositions too.
10. A scene file puts its styles, markup and scripts inside `<template>` and styles its root as `#root`. Intended
    overflow or overlap: `data-layout-allow-overflow`, `data-layout-allow-overlap` on the element.
11. Never tween a colour to a CSS `var()`: GSAP can't read it. Tween opacity or a literal colour.
12. Content stays inside the 90% action-safe box, captions and key text inside the 80% title-safe box.

## Story

- **The one thing, three times**: each story is one event, said in one line: what happened and to whom. Every claim
  on screen traces to the story's own page; what the page doesn't say stays unsaid (never derive "20x" from "40 min
  to 2 min", never a figure from another story).
- **The first frame** is the thumbnail: the anchor's face with the strap and its AI label, never black, never a logo
  alone. The first two seconds already say what the show is.
- **Proof** is the source's own words: its figure with what it counts, its quote with who said it, its outlet and
  date. Never an outlet's photo, logo or page, never a mockup, never a chart the page doesn't give. A figure is shown
  at display size, text at least 28 px at 1080p after any push.
- **The end card**: the show's name performed letter by letter, the date, and the AI line, held to the end.
- **Copy**: titles take at most 8 words, one line of a fact on screen at a time, no trailing periods. A line holds
  about 0.3 s a word plus 0.5 s. With a voice the screen never repeats the spoken sentence word for word: it shows
  the figure or quote the voice talks about. The accent colour is rationed: the story letters, the facts' rule, the
  end card. The signal colour is the AI label's alone.

## Composition numbers

- The hero of a shot fills at least 40% of the frame's height or width. A small object in the middle of an empty
  frame is never a shot: push in, crop, or give it a world.
- One hero move per shot. Secondary moves travel 50-70% as far, start 100-200 ms after it; everything else holds still.
- Something new every 2-4 s across the film.
- Text meant to be read: at least 28 px at 1080 (2.6% of the short side). Too many words: cut words, never shrink type.

## Banned by default

Where generated video lands when nothing is decided. Each is banned unless the brand's own material uses it:

- a black or dark navy void as the ground, with small elements floating in its middle;
- glow, bloom, neon, lens flares, glowing orbs and rings; floating particles as decoration;
- purple or blue gradients, mesh gradients, glass cards;
- a cream paper ground with a serif display, italic accent words, numbered "01 / 02" labels, small monospace caps
  labels, pill-shaped chips and buttons;
- everything centred; everything fading in at once; every element fading and sliding up;
- text that moves while it is read; titles that keep drifting after they land;
- corner labels, frame borders, corner brackets, HUD readouts as decoration (the strap's AI label is not decoration:
  it stays);
- three cards in a row, KPI grids, a title over a dimmed screenshot; the logo docked in a corner;
- breathing, floating or pulsing loops on titles and UI; every scene entering the same way.

After the first snapshot, name every default the frames use anyway, add it to the storyboard's BANNED line, and fix it.

## Motion

- **Ease by role**: an arrival lands on a long tail (`expo.out`, `power4.out`); a camera move or a colour flood eases
  both ways (`power2.inOut`); a zoom through or an exit accelerates (`power3.in`). The same `power2.out` at 0.5 s on
  everything is the flat default that makes a film feel generated.
- **Arrive slow, leave clean**: landings take longer than leavings; exits are 40-50% shorter than entrances. The next
  element starts when the previous is 30-50% done. Stagger letters a frame apart, words 60-120 ms.
- **Titles**: a landed title is dead still. Vary the entrance within a film: per word blur 6 px → 0 with opacity in
  0.13 s, 0.067 s apart; per word light grey to ink; the whole line blurring in; per letter for a name.
- **Transitions with a cause**, 3-5 kinds in a film: a colour flood (the ground changes in about 0.4 s while the hero
  stays), an iris (`clip-path: circle()` opening from a point in 0.15 s), a whip (a 0.13-0.3 s smear, the arriving
  element landing blurred and sharpening), an object becoming the world (a card grows past the frame in 0.65 s), a
  blur swap on one stage. At most a third of the seams are hard cuts; worlds never crossfade.
- **Punch-ins and pans**: tween `scale` and `x`/`y` on a wrapper inside the clip, never on the timed element. A
  screenshot gets one slow push from 1.0 to 1.08 across its hold, or a punch-in to the part that matters.
- Cut at the fastest frame of a move. Hold 0.3-0.75 s before the payoff, which plays at normal speed.

## Captions

- 3-5 words a group for a conversational voice. Break at a sentence end, a pause of 150 ms or more, or the word
  limit. One group visible at a time; a group opens at or before its first word and closes after its last.
- A full-width absolute container centred with text alignment, `overflow: visible`. Landscape: 80-120 px from the
  bottom; portrait 1080x1920: the caption's bottom edge at least 672 px from the bottom. A scrim sized to the text,
  never a full-width bar.
- Fade the group or its words, not both: the opacities multiply and read as a pop.

## Review

`check` catches what is broken; the review catches what is weak. Run it after `check` passes.

1. `hyperframes check --json`: besides errors it warns on craft it can measure: `line_unread` (a line on screen too
   briefly to read), `dead_stretch` (more than 3 s with nothing changing), `text_below_floor`, `first_frame_empty`.
   A warning is a question: fix it, or keep it on purpose and say why.
2. `hyperframes snapshot --review` writes sheets: each scene just after it starts and at its middle, a strip across
   every cut (−0.2 s to +0.2 s), and the beat frames at phone width (360 px). Look at all of them. The kit's
   `review.mjs` runs it and prints the sheets to read, a copy scaled to 1900 px for any sheet larger than that.
3. Describe each beat frame in one sentence as a stranger would, naming every object; one you would have to explain
   is a P0. Then ask, once per question: does it read as what it is; does the subject separate from the ground;
   framing and contact (crops, text at the edge, collisions at a seam); timing as a first-time viewer (a read
   shorter than its words, a pop with no move, a jump at a cut); which banned defaults are on screen; with the words
   covered, do the frames still tell the story; can every line be read at 360 px.
4. Write each problem as `t=4.2s · where · problem → exact change · what stays`. P0 breaks the read or the contract,
   P1 weakens the film, P2 is polish. Fix every P0 and the P1s worth their time: text first, then timing, then
   detail. Snapshot only what changed, once. Never score the film out of 10: a score finds nothing to fix. A film
   that feels busy: remove a third of the motion and keep the moves that lead the eye.
5. The rendered file: `ffprobe` its size and length against the root's `data-width`, `data-height` and
   `data-duration` before anything uses it.
