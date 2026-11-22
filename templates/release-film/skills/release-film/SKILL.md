---
name: release-film
description: Make a 30 second launch film from a GitHub release with HyperFrames (HTML rendered to video) in the run's sandbox. Covers the story from release notes, the storyboard, the kit (a working six-scene project with captions and a share card), setting the aspect, placing the voice and music, timing captions from ElevenLabs timestamps, the check, snapshot review and render loop, and what a film must never become. Use for any release film, changelog film or launch film made in the sandbox.
---

# Release films with HyperFrames

You make the film yourself: HTML scenes animated with GSAP, rendered to mp4 by the `hyperframes` CLI in the sandbox.
fal makes only the voice and the music (the agent's own steps). Every command below runs with `bash` from the run's
folder (the sandbox's `/workspace`), where `read` and `write` also work, so `film/index.html` is the same file to both.

`references/hyperframes-film.md` beside this file holds HyperFrames' render contract and the craft rules this film
follows (story, the spec's banned defaults, motion, captions, review). Read it once before you write a scene.

## 1. The story

A release is many changes; a film is one. Pick the **headline**: the change a user of this product feels most (a
failure that stops happening, a step that goes away, a number that moves), never "a new release", "bug fixes", or the
longest section. Everything else in the notes is left out; say in the report which other changes you left out.

| Beat | Seconds (30 s) | Job |
|---|---|---|
| hook | 0 – 4.5 | the old way failing, in the release's own words: the error message it fixes, the step it removes, the issue it closes. Frame 0 already shows it |
| reveal | 4.5 – 7.5 | the product's name and the version land, big |
| proof-a | 7.5 – 13 | the change in its own text: the command, the config line, the field, the before → after |
| proof-b | 13 – 18.5 | the change seen: the release's screenshot pushed to 1.6–2x, or a second piece of real text |
| payoff | 18.5 – 24.5 | the one line to remember, in the biggest type of the film, one accent word |
| endcard | 24.5 – 30 | the mark carried in, the name, the call to action (the upgrade or install line from the notes), the version; holds 2 s |

The beats follow the voice: once the timestamps exist, move each scene's start to the word that names it
(`film/words.json`, step 6), keeping each scene at least 2.5 s.

**Copy**: on-screen titles at most 6 words a line, no trailing period; the screen never repeats the spoken sentence
word for word (it shows the proof the voice talks about). Real text from the release only: a command, an error string,
a field name, a number. No "Introducing", "Meet", "unlock", "seamless", "supercharge", "game-changer", "effortless",
"in seconds". Spell out in the voice what is read aloud ("beta fifty one"), but write it as printed on screen
(`v0.1.0-beta.51`).

**Long notes**: read the whole body once to choose; the film's text is at most about 45 words on screen in all.

## 2. The storyboard

Write `film/STORYBOARD.md` before any paid call: for each beat its seconds, the exact words on screen, the image if
any, the script's words under it, and its one hero move. This is also `SPEC.md` of the reference: the palette as hex
values, the faces with their sizes, the eases. Change it when the review changes the film.

## 3. The kit

`kit/` beside this file is a complete project that renders as it is: `index.html` (the root: palette, six scene hosts,
the captions host, the voice and the music), `compositions/` (one file a scene, plus the captions file the script
writes), `card/index.html` (the 1200x630 share card) and `build-captions.mjs`. Copy it:

```sh
cp -r .agents/skills/release-film/kit film && mkdir -p film/assets film/card/assets && ls film film/compositions
```

Every placeholder word starts with `KIT`. Change the copy, never the kit: every scene is a template to fill, not a
fixed design. You may restyle any scene, move or drop elements, and change any tween, as long as the contract in the
reference holds. Each scene's comment says its job.

- **Palette**: the `:root` block of `film/index.html` and `film/card/index.html`. Take the accent from the mark or the
  release's screenshots when they have a clear brand colour (one, rationed: the reveal ground, one payoff word, the end
  card); keep the kit's when they don't. Keep text contrast: ink on accent and paper, paper on night and field.
- **Faces**: League Gothic (display), Inter (text, weights 400/700/900) and JetBrains Mono (code) are bundled with
  the CLI and need no file. Keep them unless the brand's own font files are in the release.
- **Images**: `cp media/release-1.png film/assets/shot.png` (proof-b shows `assets/shot.png`); the mark: `cp
  media/mark.png film/assets/mark.png && cp media/mark.png film/card/assets/mark.png`. Keep each file's real extension
  and change the `src` to it. No screenshot: rebuild proof-b as a second text proof (copy proof-a's panel), never a
  drawn interface. No mark: the end card shows the name alone.
- **Timing**: each host in `index.html` has `data-start` and `data-duration`; the scene's root inside has the same
  duration; every tween inside a scene is on the scene's own clock (0 = the scene's start). When a scene's length
  changes, move its later tweens and clips to fit inside it.

## 4. The aspect

The kit is 1920x1080 and sizes everything in container units of each scene, so another aspect is its numbers:

```sh
cd film && case "$ASPECT" in
  "1:1")  W=1080; H=1080 ;;
  "9:16") W=1080; H=1920 ;;
  *)      W=1920; H=1080 ;;
esac && sed -i "s/data-width=\"1920\"/data-width=\"$W\"/g; s/data-height=\"1080\"/data-height=\"$H\"/g" index.html compositions/*.html && grep -c "data-width=\"$W\"" index.html
```

Each scene's `<style>` already holds two container-query blocks: `@container (max-aspect-ratio: 5/4)` for 1:1 and
`@container (max-aspect-ratio: 3/4)` for 9:16. The 9:16 block keeps every word inside the area that TikTok, Reels and
Shorts all leave clear: 15-65% of the height, 11-82% of the width (11-72% in the top 44%). The captions sit just
under it, so in portrait nothing a scene shows goes below 65% of the height. When you restyle a scene, restyle its
blocks too, and `check` reports `outside_safe_zone` or `text_occluded` when they are wrong. The card stays 1200x630.
At 9:16, look hardest at line lengths: a title that fits 1920 wide wraps at 1080. Cut words, never shrink type below
the floor.

## 5. Voice and music

```sh
cp media/voiceover.mp3 film/assets/voiceover.mp3 && cp media/music.mp3 film/assets/music.mp3
ffprobe -v error -show_entries format=duration -of csv=p=0 film/assets/voiceover.mp3
```

The voice's `<audio>` starts at 0.5 s; the music runs the whole film at `data-volume="0.16"` with a 0.4 s fade in and
1.5 s fade out (the kit has both). With no music (it failed), delete the music `<audio>` line. With a re-voice, copy
`media/voiceover-2.mp3` to `film/assets/voiceover.mp3` instead. When the film runs longer than 30 s (the agent's step
5), set the root's `data-duration`, the music's, the end card's and the captions host's together.

## 6. Captions and the words' times

```sh
node .agents/skills/release-film/kit/build-captions.mjs --script media/vo.txt \
  --timestamps media/voiceover-timestamps.json --duration <ffprobe seconds> --offset 0.5 \
  --film film --vtt media/captions.vtt
```

`media/vo.txt` is the exact text you sent to fal, tags included (`write` it first). The script writes
`film/compositions/captions.html` (word-by-word caption groups over the scenes), `film/words.json` (every word's start
and end on the film's clock) and the WebVTT file, and prints one JSON line: its `method` is `captions_timing` in the
answer. `aligned` uses fal's character times; `anchored` (fal's characters don't spell the script) and `measured` (no
timestamps) spread the words by letters between two anchors: both are still a correct timing, never a fault. Read
`film/words.json` and move scene starts onto the words that name them (a cut lands on the word, never mid-word). Run
the script again after any change to the root's length or canvas.

## 7. Check, look, fix

```sh
cd film && grep -rn "KIT" index.html compositions card/index.html; hyperframes lint && hyperframes check --json > ../media/check.json; echo "exit $?"
```

The grep must print nothing (a `KIT` left is a placeholder on screen). Read `media/check.json`: fix every error. Each
warning is a question: fix it, or keep it and say why in `checks.warnings_kept`. Expected and kept: `audio_clip_silent`
never appears with real audio (if it does, the voice file is wrong); `timeline_track_too_dense` on the captions track.
Fix `line_unread` by cutting words or holding the line longer, `first_frame_empty` by showing the hook at 0 s,
`contrast_aa_failure` by changing the ink, and `gsap_undefined_css_variable` by tweening opacity or transforms instead
of a `var()` colour.

Then look at it:

```sh
cd film && hyperframes snapshot --review -o ../media/review 2>&1 | tail -5 && ls ../media/review
```

`read` the `review-*.jpg` sheets it lists (the beats, the phone width, one strip per cut; they are images; the
`beat-*.png` and `seam-*.png` frames are there for a closer look). Describe each beat frame in one sentence as a stranger would; then go
through the review questions in the reference (does it read, does the subject separate, framing, timing, the banned
defaults, the pictures alone, the phone sheet). Write each problem as `t=4.2s · where · problem → change`, fix every
P0 and the P1s, then snapshot only what changed (`hyperframes snapshot --at 4.2,11.0 -o ../media/review-2`) and look
once more. List what you fixed in `checks.review_fixes`.

## 8. Render

```sh
cd film && hyperframes render --quality looks -o ../media/film.mp4 > ../media/render.log 2>&1; echo "exit $?"; tail -4 ../media/render.log
ffprobe -v error -show_entries format=duration:stream=width,height -of json ../media/film.mp4
```

Give the `bash` call a `timeout` of 600: a 30 s film renders in about 2 minutes with 2 CPUs (software GL; the log's
"BeginFrame did not run" line is expected). The ffprobe must show the canvas's width and height and the root's
duration. A failed render: read the log's error, fix, render again (at most 3 renders in all, counted in
`checks.renders`).

## 9. The share card

Fill `film/card/index.html` with the payoff line (at most 8 words), the name and the version, and the palette. Then:

```sh
cd film && hyperframes snapshot card --at 0.5 --no-end -o ../media/card && cp ../media/card/frame-00-at-0.5s.png ../media/share-card.png && ffprobe -v error -show_entries stream=width,height -of csv=p=0 ../media/share-card.png
```

It must print `1200,630`. `read` it once: the headline readable at a glance, nothing cut at an edge.

## Never

- Never compose the film on fal or with any renderer but `hyperframes render` in the sandbox.
- Never draw an interface, a dashboard or a logo the release doesn't have; never redraw the mark.
- Never show a claim, number or name the release doesn't make.
- Never leave a `KIT` placeholder, a `check` error, or a caption over the end card's call to action.
- Never fetch anything from the sandbox: it has no network to the web, and everything it needs is in the run's folder.
