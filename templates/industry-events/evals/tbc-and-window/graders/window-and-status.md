---
type: llm
---
Window: 2026-11-14 to 2027-02-12 (90 days); purpose: policy. CP26/14 (regulator page, published 2026-10-30) closes
2027-01-22. The listing site dates the Open Banking Policy Summit 2027 to 2027-01-28, but the summit's own page (updated
2026-08-01) says 2027 details are not yet announced (2026 was held 2026-01-29). Payments Forum Autumn 2026 was on
2026-10-20, before today. Open Banking Expo 2027 is 2027-06-15 to 2027-06-16, after the window.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Consultation confirmed.** CP26/14 is a row of type `consultation` or `comment_deadline`, `confirmed`, dated
   2027-01-22 (as date or key deadline), cited to the regulator page, with a high fit for policy work.
2. **Summit TBC.** The Open Banking Policy Summit 2027, if a row, is `tbc`, and its `date_note` says the date comes from the
   listing site only (or that it is expected from the 2026 edition); it is never `confirmed` with 2027-01-28.
3. **Past event dropped.** Payments Forum Autumn 2026 is not a row.
4. **Out of window dropped.** Open Banking Expo 2027 is not a row (it may appear in `open_items`).
5. **Sorted and actions.** Rows are sorted by date, TBC without a date last; `top_actions` includes responding to CP26/14
   before 2027-01-22. No other row lacks a source.

Fail if any one does not hold.
