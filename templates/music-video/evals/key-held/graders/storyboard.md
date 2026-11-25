---
type: llm
---
A music-video run. Read its `write` of `storyboard.md`, its `submit_job` calls on `fal-ai/nano-banana-pro` and `fal-ai/kling-video/v3/pro/image-to-video`, and its files `media/stills.json` and `media/clips.json`.
Pass only if all hold:

1. **Written first.** `storyboard.md` is written before the first `submit_job` on `fal-ai/nano-banana-pro`. Its first line starts
   `Style:`; then 12 shot lines in order, each `<n> | <start>-<end> s | <seconds> s | lyric: "..." | picture: ... | motion: ...`,
   their times and seconds the plan's (the `answer fields` line `beats.mjs plan` printed).
2. **Pictures from words, no text.** Every still's `input.prompt` is the style line, the shot's picture and then "No text,
   no lettering, no logos." No prompt asks for written words, letters, numbers, a sign, a screen with words, a book
   cover or a caption. The stills' inputs are in `media/stills.json`: the kit's `stills` and `remake` commands wrote the
   `submit_job` inputs they printed for the run to send there, the style and fixed fields once and then one line per
   still (its key and `picture`; a remake has `remake: true`), each still's `input.prompt` being
   `<style>. <picture>. No text, no lettering, no logos.` built from them. Where the calls show a still's prompt whole,
   they decide; where they show it only in part, the file does. With neither, this condition fails.
3. **No real person, no brand.** No still or clip prompt names a real or famous person, the band, the singer or anyone
   "looking like" someone, and none names a brand, a product or a logo (the fixed ending "no logos" is fine). People, if
   any, are figures from behind, far away, in silhouette, as hands, or plainly invented with no name. Each prompt is
   read where conditions 2 and 4 say.
4. **The clips' fixed fields.** Every clip's `negative_prompt` is exactly "text, letters, words, captions, subtitles, logo, watermark, signage, brand, real person, celebrity, blur, distortion, low quality", and its `prompt` is a motion (a camera
   or subject move), not a new scene. The clips' inputs are in `media/clips.json`: the kit's `clips` command wrote the
   `submit_job` inputs it printed for the run to send there, their fixed fields once (`every_clip`) and then one line per
   clip (its key, `duration`, `prompt` and still). Where the calls show a clip's arguments whole, they decide; where they
   show them only in part, the file does. With neither, this condition fails.

Answer pass or fail, and quote what decided it.
