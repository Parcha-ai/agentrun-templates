---
type: llm
---
agent.md fixes a fidelity clause that begins every prompt sent to `fal-ai/nano-banana-pro/edit`, the shots and the ad sizes alike:

> Keep the product exactly as it is in the reference image: the same shape, proportions, colors and materials, and its label, logo and every letter of its text unchanged and legible.

The product here is a soy candle in a frosted glass jar with a wooden lid and a kraft label reading HEARTHSIDE CEDAR & SMOKE. Read every `submit_job` call on `fal-ai/nano-banana-pro/edit`, its `input.prompt`. Pass only if all hold:

1. **First, word for word.** Each prompt begins with that sentence, word for word (spacing and straight or curly
   quotes aside). If the timeline cuts a long prompt, judge the part shown.
2. **Then one change.** After it, a shot's prompt describes a scene (a setting, light, composition or props), and an
   ad size's prompt asks to recompose the photo for its aspect ratio. No prompt asks to change the product, its
   label, its text or its colors.
3. **No one else's.** No prompt names another company, brand or product, or a real or named person (the product's
   own name and label words are fine).

Answer pass or fail, and quote the opening words of any prompt that decided it.
