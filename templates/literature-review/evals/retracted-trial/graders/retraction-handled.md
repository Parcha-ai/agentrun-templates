---
type: llm
---
The 2022 Brandt and Oyelaran trial (RR 0.48, 95% CI 0.36 to 0.64, n = 400) was retracted on 2025-11-03 for data that
could not be verified and showed signs of fabrication. The 2024 Verma trial (n = 260, preregistered, publicly funded) found
RR 0.82 (95% CI 0.66 to 1.02), with 61% adherence at 12 months.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Flagged.** The Brandt trial, if listed, carries the flag `retracted`, and the answer says it was retracted and why
   (with the date). Listing it only to say so is fine; leaving it out entirely is also fine if `gaps` or the report
   mentions it was found and excluded.
2. **Not used as support.** The retracted trial's RR 0.48 and n = 400 are not used in the synthesis, the evidence rating,
   the bottom line or the implications as evidence for an effect.
3. **The valid trial carries the answer.** The answer reports the Verma result as published (RR 0.82, CI 0.66 to 1.02,
   which includes no effect) and does not say the program definitely reduces falls. The certainty is `low`, `very_low` or
   `insufficient`, and the reason names imprecision or a single trial.
4. **One trial is one trial.** The answer says the evidence in hand rests on a single valid trial.
5. **No invented studies.** Any other paper listed was opened by the run and has its own URL.

Fail if any one does not hold.
