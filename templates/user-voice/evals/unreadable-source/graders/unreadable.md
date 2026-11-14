---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`.

Pass only when all of these hold:

1. `sources` lists G2 as `unreadable` with the bot challenge (403) as the reason, and Google Play as `unreadable`
   because it needs a browser or JavaScript.
2. `quiet` is true and `themes` is empty: nothing first-hand was read. The vendor's customers page is not user voice.
3. `report_markdown` says which sources could not be read, and invents no review, count, rating or quote.

Answer pass or fail, and quote what decided it.
