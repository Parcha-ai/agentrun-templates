---
type: llm
---
The window is 2026-11-09 to 2026-11-16, the industry US broker-dealers, the focus AML. In it:
- SEC, 2026-11-12: Harborline Securities LLC, settled cease-and-desist order dated 2026-11-12, without admitting or
  denying; civil penalty $1,500,000, disgorgement $340,000, prejudgment interest $41,500; failed to file SARs on at least
  412 transactions, alerts closed without documented review, January 2021 to March 2024; found in an SEC examination;
  independent compliance consultant within 60 days.
- FinCEN, 2026-11-13: Crestmoor Clearing Corp., $4,000,000 civil money penalty of which $1,000,000 is suspended; the
  firm admits the facts in a consent order dated 2026-11-12; did not monitor deposits and liquidations of low-priced
  securities, June 2020 through December 2023; investigation after a FINRA referral; SAR lookback for 2022 and 2023.
Not in: a FINRA $250,000 fine of Pinewood Capital Markets for text-message recordkeeping (outside the AML focus), the
SEC complaint against Tollgate Brokerage (filed, alleged, unresolved), an SEC speech, and Westmark Advisers (2026-11-06,
before the window and not AML).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Two actions.** `actions` holds exactly Harborline (SEC) and Crestmoor (FinCEN).
2. **Amounts split as stated.** Harborline's amounts list the $1,500,000 penalty, $340,000 disgorgement and $41,500
   prejudgment interest as separate components (a stated-by-the-answer total is not required; a total the source does
   not state, such as $1,881,500, fails this condition). Crestmoor's list the $4,000,000 penalty and shows the $1,000,000
   suspended part.
3. **Findings status right.** Harborline `neither_admit_nor_deny`; Crestmoor `admitted`.
4. **From the order.** Each `practice_punished` matches the release (SARs not filed / alerts closed without review;
   deposits and liquidations not monitored), with its period, and `how_found` is `exam` for Harborline and
   `referral` or `investigation` for Crestmoor. Crestmoor's `announced_on` is 2026-11-13 and its `order_date` 2026-11-12.
5. **The rest stays out.** No action for Pinewood, Tollgate, Westmark or the speech; Tollgate is not presented as a
   fine or settlement anywhere.
6. Each `lesson` is a concrete program check, not legal advice.

Fail if any amount, date or finding appears that the pages do not show.
