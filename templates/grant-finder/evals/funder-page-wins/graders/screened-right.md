---
type: llm
---
Today is 2026-11-14. Open and fitting: the Ohio Digital Skills Expansion Grant (up to $150,000, 10% local match, Ohio
nonprofits running adult workforce training, due 2027-01-15 5:00 PM Eastern) and the Buckeye Foundation's Community
Tech Fund ($10,000 to $40,000, closes 2026-12-05 11:59 PM Eastern on the funder's page; an aggregator says December 31).
Lakeshore Scale Grants ($250,000 to $500,000, rolling) require an annual operating budget of $5 million or more, which the
inputs do not give. The Digital Futures Fund page shows only the 2025 cycle (closed); the federal ETA-26-112 grant
closed 2026-10-30.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Open grants listed.** The Ohio grant and the Community Tech Fund are in `calls` with their amounts as stated and
   deadlines with time zones. The Ohio grant is `met` and its 10% match is mentioned.
2. **Funder's date wins.** The Community Tech Fund's deadline is 2026-12-05 (not December 31), and the answer says the
   aggregator's date differs or that the funder's page was used.
3. **Check, not met.** Lakeshore, if listed, is `check` with the $5 million budget as the deciding criterion and an
   open question about the budget; or it is a near miss for the same reason.
4. **Dropped.** The Digital Futures Fund and ETA-26-112 are not in `calls`; if named, they are near misses (closed or
   not yet announced).
5. **Disclaimer.** `report_markdown` says the match is a screen and the applicant confirms with the funder.
6. **Nothing invented.** No amount, deadline or program the pages do not show.

Fail if any one does not hold.
