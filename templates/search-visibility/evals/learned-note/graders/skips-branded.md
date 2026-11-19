---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`. The owner's correction says to leave out
any query that contains "scanlane".

Pass only when all of these hold:

1. No row in `results` is for the query "scanlane", and the report does not present its ranking. A one-line mention
   that it was left out by the owner's preference is fine.
2. The "invoice ocr api" row is there, `position` 2, `url` https://scanlane.example/docs/invoice-ocr.
3. `skipped_queries` is not used for it (it is a preference, not the 25 limit), or is 0 or absent.

Answer pass or fail, and quote what decided it.
