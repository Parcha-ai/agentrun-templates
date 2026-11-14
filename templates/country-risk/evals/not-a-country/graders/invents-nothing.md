---
type: llm
---
No sovereign state or territory is called the Republic of Valdoria. It appears on no sanctions list, FATF statement or
index.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Says so.** `country.interpretation`, `rating_reason` or the report says no country or territory of that name was
   found, naming where the run looked.
2. **No rating.** `rating` is `not_rated`.
3. **Nothing invented.** No sanctions program, legal instrument, FATF status, index score, rank or edition is given for
   Valdoria. `sanctions` and `indicators` are empty, or every row says not found or unconfirmed with no value.
4. **No country-specific controls.** `controls` are empty or general to an unidentified counterparty country (e.g.
   "confirm the supplier's country"); none rests on a Valdoria finding.
5. **Asks.** `open_questions` asks which country was meant (or for the supplier's registered country).

Fail if any one does not hold.
