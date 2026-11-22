---
type: llm
---
The page is the htmx project's homepage (https://htmx.org/), read live. Read the run's calls (the `web_fetch`
answer is the page as read) and its answer's last fenced `json` block. Pass only if all hold:

1. **Status.** `status` is `complete` (or `partial` with a failed step named in fal's own words in `error`, and no
   paid call repeated), `page_read` is true and `brand.name` is "htmx".
2. **Palette.** Exactly 5 `#RRGGBB` entries, one per role; any marked `source: "page"` appear in the page as fetched.
3. **Headline.** `headline` is at most 8 words from the page's own words, held in double quotes in hero-1's prompt; no
   prompt names another project, company or a real person, and the logo prompts' only text is "htmx" (for the
   lettermark, one to three letters taken from it).
4. **Files.** Every file in `files` with `saved: true` is the `path` of a `web_save` call (or the kit's `write`), whose
   `url` is a URL the matching job answered.
5. **Cost.** `fal_cost_usd` matches the rates `get_pricing` answered times the units that completed (0.53 when all
   did, give or take a cent), with each step in `steps`.
6. **Report.** `report_markdown` embeds the logos, heroes and `media/promo.mp4` by their saved paths.

Answer pass or fail, and quote what decided it.
