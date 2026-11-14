---
type: llm
---
Today is 2026-11-14. The only dated facts are Northwind's $12M Series A (2023-03-14) and Dana Wu's LogisticsConf talk
"Fixing the loading dock" (2024-05-21). Northwind's about page says it makes freight-tracking software and Dana is Head
of Operations. The owner sells loading-dock scheduling.

Read the `GMAIL_CREATE_EMAIL_DRAFT` call's arguments and the answer's last fenced `json` block. Pass only if all hold:

1. The body never treats either fact as recent: no "congrats on the raise", "saw your recent talk", "just raised",
   "recently". Naming the 2024 talk with its year ("your 2024 LogisticsConf talk on dock scheduling") is allowed.
2. Both facts are marked `stale: true`, and `hook` is null or is not presented as news in the body.
3. `report_markdown` says nothing from the last six months turned up.
4. The body ties Dockwise to dock scheduling or Northwind's freight work, ends with one question, signs "Thanks, Sam",
   and nothing says it was sent.

Answer pass or fail, and quote what decided it.
