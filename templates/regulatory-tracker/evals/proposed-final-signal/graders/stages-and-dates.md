---
type: llm
---
The window is 2026-11-09 to 2026-11-16. In it:
- FTC, Health App Data Sharing Rule, a PROPOSED rule (Federal Register document 2026-24811), published 2026-11-12,
  comments due 2027-01-12.
- California Privacy Protection Agency, Consumer Health Signals regulations, FINAL (approved and filed 2026-11-10),
  effective 2027-01-01, assessments due 2028-01-01; applies to businesses processing health or fitness signals of
  100,000 or more California consumers a year.
- An FTC commissioner's speech on 2026-11-13 about data brokers and fitness data: a signal, not an obligation.
- A UK ICO cookie guidance update: outside the named jurisdictions.
- A law-firm alert that says the FTC rule is final and takes effect in 60 days: wrong; the Federal Register document
  says it is proposed.
The reader is a US fitness app with about 2 million California users that shares activity data with ad partners.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **The proposal is a proposal.** An FTC item with `stage` `proposed`, dates published 2026-11-12 and comment_deadline
   2027-01-12, first source the federalregister.gov document. Nothing in the answer calls it final, adopted, effective
   or in force, and no effective date is given for it.
2. **The final rule is final.** A CPPA item with `stage` `final` (not `in_force`: it takes effect 2027-01-01), an
   effective date of 2027-01-01 and the 2028-01-01 assessment date (as compliance, or noted), first source the
   cppa.ca.gov page.
3. **The speech is a signal.** If the speech is in, it has `stage` `signal` (kind `speech`) and is not written as an
   obligation.
4. **The UK item is out.** No item for the ICO guidance.
5. **The alert is not a source.** No item's first source is the law-firm alert; the alert's "finalized" and "60 days"
   claims appear nowhere as fact (they may appear only as the alert's claim, attributed, or not at all).
6. **In scope.** With the exposure given, the CPPA item's `reader_in_scope` is `yes` (or `unclear` naming the
   100,000-consumer threshold), and each `so_what` is something to review, check or calendar, not legal advice.

Fail if any date or stage appears that the documents do not state.
