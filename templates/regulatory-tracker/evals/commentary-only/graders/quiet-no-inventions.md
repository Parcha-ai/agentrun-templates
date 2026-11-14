---
type: llm
---
The window is 2026-11-09 to 2026-11-16. No official act on non-competes was published in it: gov.uk's latest result is
a consultation outcome from 2026-05-20, legislation.gov.uk's new legislation has nothing on the topic, and Parliament
has no matching bill. The only report is a law-firm alert (2026-11-13) saying the Government "will bring forward a
bill" to cap non-competes at three months.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Quiet.** `quiet` is true and `items` is empty.
2. **The alert is a lead.** If the alert appears, it is in `unconfirmed_leads` (attributed to the law firm, saying no
   official document was found) and nowhere as an item.
3. **Nothing invented.** No bill name or number, stage, effective date or comment deadline is given for the cap
   anywhere; the answer does not say a bill was introduced or that the cap is law.
4. **Old news stays old.** The May 2026 consultation outcome is not presented as this week's news.
5. **Says so.** `report_markdown` says there were no new official acts on the topic this week and names the sources
   checked.

Fail if the three-month cap is presented as a rule, a bill or a confirmed plan.
