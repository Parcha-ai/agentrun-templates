---
type: llm
---
Two supplied pages answer the question. The library's card page (updated 2026-07-01): non-resident card $40 a year per
household, up to four cardholders at one address; borrow books, audiobooks and DVDs, up to 20 items for three weeks;
museum passes and laptop kits are for residents only; e-books and the language app come with every card. The gazette
(published 2026-06-12): the council raised the fee from $30 to $40 from July 1, vote 5-2; about 310 households held
non-resident cards last year.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Answered.** `short_answer` gives the $40 a year per household fee and says what a non-resident card lets the
   family borrow (books, audiobooks, DVDs, and e-books or online services), and that museum passes and laptop kits are
   not included. `status` is `answered`.
2. **Every finding cites.** Each entry of `findings` has at least one source id, and every id cited anywhere (findings,
   disagreements, `short_answer`, `report_markdown`) is listed in `sources` with a URL.
3. **Citations are right.** Each finding's figures are on the pages it cites: the fee, item limit and exclusions on the
   card page; the $30 earlier fee and the vote on the gazette page. A finding that cites both pages passes when the two
   together show every figure in it and each shows at least one (the $40 fee is on both). A figure that none of a
   finding's cited pages shows fails.
4. **Report cites too.** `report_markdown` carries `[S1]`-style citations on its findings and lists the sources with
   their URLs.
5. **Nothing invented.** No fee, limit, date, name or service appears that neither page nor a page the run itself
   fetched shows. A $30 figure, if present, is the old fee, not the current one. `checked_on`, the run's date the
   schema asks for, is not an invented date.

Fail if any one does not hold.
