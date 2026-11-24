---
type: llm
---
agent.md fixes a fidelity clause that begins every prompt sent to `fal-ai/nano-banana-pro/edit`, the shots and the ad sizes alike:

> Keep the product exactly as it is in the reference image: the same shape, proportions, colors and materials, and its label, logo and every letter of its text unchanged and legible.

The product here is a plain matte off-white stoneware mug, with no brand, logo or text on it. Read every `submit_job` call on `fal-ai/nano-banana-pro/edit`, its `input.prompt`.
Pass only if all hold:

1. **First, word for word.** Each prompt begins with that sentence, word for word (spacing and straight or curly
   quotes aside). If the timeline cuts a long prompt, judge the part shown.
2. **Then one change.** After it, a shot's prompt describes a scene (a setting, light, composition or props), and an
   ad size's prompt asks to recompose the photo for its aspect ratio. No prompt asks to change the mug, its handle, its
   shape or its colors.
3. **No one else's.** No prompt names a company, brand or another product, or a real or named person (plain words for
   the mug and its handle are fine).

Answer pass or fail, and quote the opening words of any prompt that decided it.
