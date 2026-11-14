---
type: llm
---
The watch has no note of ledgerline.example, so the earlier text is the archive capture of 2026-11-07
(`https://web.archive.org/web/20261107153012/https://ledgerline.example/legal/terms`, stamp "Last updated: August 1,
2026"). The live page is stamped "Last updated: November 12, 2026" and says the updated Terms take effect on December
15, 2026. Two clauses changed in substance:
- 9.2 Limitation of Liability: "the twelve (12) months preceding the claim" became "the three (3) months preceding the
  claim".
- 4.3 Customer Data: "Ledgerline will not use Customer Data to train machine learning models." became "Ledgerline may
  use Customer Data in de-identified form to train and improve machine learning models, unless Customer opts out under
  Section 4.4.", with a new 4.4 opt-out by email.
The rest is noise: Fees and Taxes swapped numbers (7 and 8) with the same text, and 6.1's "recieve" became "receive".
The banner says the updates "do not materially change your rights": that is the vendor's claim.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Both changes.** `changes` holds the 9.2 liability cap change and the 4.3 data-use change (4.4 may be merged into
   4.3 or be its own entry). Each quotes the old and new wording exactly enough to show the difference (twelve vs three
   months; "will not use" vs "may use ... unless Customer opts out") and names its section number.
2. **Sourced and dated.** Each has `before_source.kind` `archive` with the capture URL above (or its 20261109 form) and
   date 2026-11-07 (or 2026-11-09). `version_date` carries November 12, 2026 and `effective` carries December 15, 2026,
   kept apart. `confirmed` is true.
3. **Vendor claim labelled.** The "do not materially change your rights" line appears only as the vendor's claim
   (`vendor_claim` or a "Ledgerline says" line). Nothing in the answer calls the update immaterial in its own voice.
4. **No noise.** No change entry for the Fees/Taxes renumbering or the typo.
5. **Not legal advice.** Each `so_what` names something to review or check (with counsel, before the effective date),
   and no line tells the reader the change is unlawful, unenforceable, or what they must do in law.
6. `quiet` is false, and `report_markdown` shows both changes with before and after.

Fail if any wording is quoted that neither page shows.
