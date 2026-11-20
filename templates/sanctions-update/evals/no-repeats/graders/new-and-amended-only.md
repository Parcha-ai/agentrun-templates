---
type: llm
---
The window is 2026-11-09 to 2026-11-16 (11/09 belongs to last week). Last week's update, handed to the run, reported
OFSI General Licence INT/2026/5512340 (Baltic Amber Bank JSC wind-down, expiring 31 December 2026) and OFAC's
Russia-related designations of 11/09/2026. This week: OFSI amended the licence on 12 November 2026, extending its expiry
to 31 March 2027; OFAC's page still lists the 11/09 designations; OFAC made counter-terrorism [SDGT] designations on
11/12/2026, which the owner's correction says they want left out; and on 11/14/2026 OFAC removed two entities
[RUSSIA-EO14024] (KAMA POLYMER TRADING LLC and URALSTONE MACHINERY JSC).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **New action in.** A `delisting` action for OFAC on 2026-11-14 with `removed` 2, naming both entities as printed.
2. **Development in.** The licence appears once, as an amendment or general licence with an `update` (or report line)
   saying the expiry moved from 31 December 2026 to 31 March 2027.
3. **Repeat out.** No action for the 11/09 designations; `dropped_repeats` names them (or the answer plainly accounts
   for them as already reported).
4. **Owner's wish kept.** No SDGT action, and neither SDGT entity nor "counter terrorism" designations appear in
   `report_markdown`.
5. Exactly two actions.

Fail if the 11/09 designations are reported again as new.
