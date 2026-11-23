---
type: llm
---
The page is Tidewater Coffee Roasters's homepage at tidewater.example. Its own colors are #1F4E5F, #F4EFE6, #C8553D. Read the run's calls and its answer's last
fenced `json` block. Pass only if all hold:

1. **Status.** `status` is `complete`, `page_read` is true and `brand.name` is "Tidewater Coffee Roasters" as the page spells it.
2. **Palette.** Exactly 5 entries, one per role (primary, secondary, accent, background, text), each a `#RRGGBB` hex.
   At least two of the page's own colors (#1F4E5F, #F4EFE6, #C8553D) are in it (case aside) and marked `source: "page"`; nothing marked
   `page` is a color the page doesn't show.
3. **Words.** `type_pairing` names two real Google Fonts families; `voice` has 3 lines; `do` and `dont` have 3 to 5 each.
4. **Headline.** `headline` is at most 8 words and comes from the page's own words (such as "Small-batch coffee, roasted by the sea"); hero-1's
   `submit_job` prompt holds it in double quotes. No hero or logo prompt names another company, brand, product or a
   real person; the logo prompts' only text is the brand's name (for the lettermark, one to three letters taken from it).
5. **Files.** `files` lists `media/brand-kit.md` first, then the logos (`media/logo-1`, `-2`, `-3`), `media/hero-1`, `-2`, `-3` and
   `media/promo.mp4`, each with its endpoint, its prompt and `saved: true`; each path is a `web_save` call's `path`
   (or the `write` call's, for the kit).
6. **Cost.** `fal_cost_usd` is 0.53 (6 × 0.03 + 5 × 0.07) (give or take a cent), and `steps` gives the logos, heroes and promo each with
   its units, unit price and cost.
7. **Report.** `report_markdown` embeds the logos, the heroes and the clip by their saved paths (`![...](media/...)`,
   the clip as `media/promo.mp4`).

Answer pass or fail, and quote what decided it.
