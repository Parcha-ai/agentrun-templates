<!--
  Adapted from the HyperFrames agent skills shipped in the npm package hyperframes@0.9.78
  (dist/skills/hyperframes: SKILL.md, references/spec.md, film.md, motion.md, captions.md, review.md,
  types/music.md), Copyright HeyGen, licensed under the Apache License, Version 2.0
  (https://www.apache.org/licenses/LICENSE-2.0). Source: https://github.com/heygen-com/hyperframes
  Modified for this template: condensed to what a music video cut by a script needs, Studio, telemetry, registry and
  media commands removed, commands written for the `hyperframes` CLI on the sandbox's PATH, and the music video's
  rules added. Distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND.
-->

# HyperFrames for a music video

HyperFrames renders HTML to video by seeking a paused GSAP timeline frame by frame, so every render is identical.
`film/index.html` is the root composition: `beats.mjs place` writes its shots (lane 1), the lyric captions scene from
`compositions/lyrics.html` (lane 2) and the song (lane 3). Media and images live in `assets/`.

## The contract

`hyperframes check --json` reports most violations with a `Fix:` line.

1. Every timed element has `class="clip"`, `data-start` and `data-duration` in seconds, and shows over
   `[start, start + duration)`. `data-track-index` is only a lane; paint order is `z-index`.
2. The video's length is the root's `data-duration`: overrun is cut, an early end holds the last frame. `place` sets it
   to the cut.
3. Each composition builds one paused timeline and registers it after its tweens:
   `window.__timelines["<data-composition-id>"] = tl`. A scene's host, its root and its timeline key share one id.
4. No `Date.now()`, unseeded `Math.random()`, network fetches, timers or `repeat: -1`. Everything visible is a
   function of timeline time.
5. Never tween a `.clip` element's transform, `display`, `visibility` or `autoAlpha`; animate a child (the still's
   `<img>` inside its timed `<div>` is what the push-in scales).
6. A timed `<video>` is `muted playsinline` (silent footage) or `data-has-audio="true"`; every clip here is muted, and
   the song is the one `<audio>`, with an `id`. Never `play()`, `pause()` or seek media; no `crossorigin`.
   `data-playback-rate` (0.1 to 10) slows a clip; `data-media-start` trims its start.
7. Time a `<video>` or its wrapper, never both.
8. Only the bundled fonts resolve by name (Inter, Montserrat, Outfit, Oswald, League Gothic, Archivo Black, Space Mono,
   Playfair Display, Poppins among them); any other family needs `@font-face` to a file in `assets/fonts/`.
9. Asset paths are `assets/...` with no leading `/`, in sub-compositions too.
10. A scene file puts its styles, markup and scripts inside `<template>` and styles its root as `#root`. Use `fromTo`,
    not `from`, inside a scene.
11. Never tween a colour to a CSS `var()`: GSAP can't read it.
12. Content stays inside the 90% action-safe box, captions inside the 80% title-safe box.

## On music

- **The song is the structure.** Cut density follows energy: slower shots in the verses, quicker ones in the chorus,
  a held picture on a breakdown. The plan already does this (longer shots where the bars are quieter); the pictures
  follow it: wide and calm in the long shots, close and busy in the short ones.
- **Cut on the bar, not on every beat.** Every cut lands on a bar line. Cutting on every beat reads as a slideshow,
  and a cut a few frames off the beat reads as a mistake: never move a cut by hand.
- **Trust the beat where it is steady.** A `NOTE` from the plan (a weak or drifting beat) means the grid may sit off
  the music in places: say so in the report rather than nudging shots.
- **One world.** One medium and palette for the whole film, one subject or place that returns, the ending rhyming
  with the opening. The same treatment for more than about 6 s with nothing changing is dead: every clip has motion.
- **Pictures for the words**: show what a line means, never the line itself. Lyrics appear on screen only as the
  captions.

## Captions (lyrics)

- One line at a time, from its first word to the end of its last word, held at least a beat; set as type over the
  picture with a scrim sized to the text, never a full-width bar.
- Landscape: the line's bottom about 9% of the height from the bottom. Portrait 1080x1920: the caption's bottom edge at
  least 672 px from the bottom (the kit sets 36% of the height).
- Fade the line in quickly (0.14 s) and let it cut out at its end; never animate words while they are read.

## Banned by default

- glow, bloom, lens flares, floating particles, light leaks as decoration;
- a spectrum bar or waveform as the picture;
- text in a generated picture, a logo, a real person's face;
- the same zoom on every shot; every shot entering the same way;
- shaking or "beat-pulse" scaling on every beat.

## Review

`check` catches what is broken; the review catches what is weak. Run it after `check` passes.

1. `hyperframes check --json`: besides errors it warns on craft it can measure (`line_unread`, `dead_stretch` over 3 s
   with nothing changing, `text_below_floor`, `first_frame_empty`). A warning is a question: fix it, or keep it on
   purpose and say why.
2. `hyperframes snapshot --review` writes sheets: each shot just after it starts and at its middle, a strip across every
   cut (−0.2 s to +0.2 s), and frames at phone width (360 px). The kit's `review.mjs` runs it and prints the sheets to
   read, a copy scaled to 1900 px for any sheet larger than that.
3. Describe each frame in one sentence as a stranger would. Then ask, once each: does every frame stay in one world;
   does a cut jump (two near-identical framings back to back); does a caption collide with the picture's subject or
   leave the title-safe box; can every caption be read at 360 px; is any frame showing words, a logo or a real
   person's likeness.
4. Write each problem as `t=4.2s · where · problem → exact change · what stays`. P0 breaks the read or the contract,
   P1 weakens the film, P2 is polish. Fix every P0 you can and the P1s worth their time; snapshot only what changed,
   once. Never score the film out of 10.
5. The rendered file: `ffprobe` its size and length against the root's `data-width`, `data-height` and
   `data-duration` before anything uses it.
