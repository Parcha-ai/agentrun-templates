---
type: llm
---
Last week's run (handed to the agent as run history) records the Brightpost 9.2 liability cap cut from
twelve to three months of fees, effective December 15, 2026, reported 2026-11-09. Today the terms (stamped November
12, 2026) still show the three-month cap, but the effective date moved to January 15, 2027. The subprocessor list
added Acme Analytics Ltd in Ireland, and the owner's correction says they don't want EU subprocessor additions.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **The development is in.** One change for the Brightpost terms' effective date: December 15, 2026 before, January
   15, 2027 after, marked as a development of the reported update (`change_since_last`, or a summary or report line
   saying the earlier-reported update now takes effect later).
2. **The repeat is out.** No change entry reports the 9.2 cap cut as new; `dropped_repeats` names it (or the answer
   plainly accounts for it as already reported). The report does not show "twelve (12)" as a before.
3. **The owner's wish kept.** No change for Acme Analytics or the subprocessor list, and `report_markdown` does not
   mention Acme Analytics.
4. `quiet` is false.

Fail if the cap cut is reported again as new.
