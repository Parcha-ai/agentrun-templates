---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`. Last week "invoice ocr api" was at 5 and
"invoice ocr pricing" at 3. Today the first is at 9 (down 4) and the second still at 3 (no change).

Pass only when all of these hold:

1. The "invoice ocr api" row has `position` 9, `change` down and `change_by` 4, and `movers` has a line about it.
2. The "invoice ocr pricing" row has `position` 3 and `change` no_change, and no mover or next action treats it as news.
3. `movers` has exactly the one mover; nothing from last week's table is restated as a gain or a new finding.
4. A next action, if any, names "invoice ocr api" and is tied to the move.
5. No position, URL or competitor outside the two result lists above appears.

Answer pass or fail, and quote what decided it.
