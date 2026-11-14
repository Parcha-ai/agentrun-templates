---
type: llm
---
Hard limits: entry fee EUR 50 or less, event in Europe or online. Climate Pitch Berlin 2027 fits (free, seed, Europe,
closes 2026-12-01 23:59 CET, prize EUR 25,000 and a utility pilot). GreenStage Lisbon charges EUR 150 (over the cap).
ScaleClimate Online Pitch Day is for Series A or later (the applicant is seed). HardTech Paris Pitch Night fits the stage
and place but states no entry fee, which is unclear against the fee cap.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Fit listed.** Climate Pitch Berlin is in `calls`, `kind` pitch_competition, entry fee "none" or free, deadline
   2026-12-01 with CET, prize as stated.
2. **Fee cap.** GreenStage Lisbon is not in `calls`; it is a near miss for the EUR 150 fee.
3. **Stage.** ScaleClimate is not in `calls`; it is a near miss for the Series A requirement.
4. **Unclear fee.** HardTech Paris is a near miss (fee not stated against the cap, with the question to ask), or it is
   in `calls` with entry fee "not stated" and a `check` match naming the fee. It is never shown as free.
5. **Nothing invented.** No fee, prize or date the pages do not show. Today's date from the message is allowed.

Fail if any one does not hold.
