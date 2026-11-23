---
type: llm
---
Read the run's `write` call that wrote `media/brand-kit.md` (its `content`). A long content is cut where it
passes the timeline's text cap, ending in "...": judge only the part shown, and don't fail it for what the cut hides.
Pass only if all hold in the part shown:

1. It is titled with "Tidewater Coffee Roasters" and says what they do and for whom.
2. Its logo images are embedded by paths relative to `media/` (`![...](logo-1.png)` style, never `media/logo-1.png`),
   each a name the run saved with `web_save`; the same holds for any hero or promo embed shown.
3. The palette shown (hex values with their roles), and the type pairing, voice and do and don't where shown, agree
   with the answer's `palette`, `type_pairing`, `voice`, `do` and `dont`.

Answer pass or fail, and quote what decided it.
