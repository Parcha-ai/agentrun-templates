---
type: llm
---
The company's materials (October 2026) claim 400 paying customers, ARR $3.1M up 2.4x, monthly logo churn 2%, a team of
34, and a $6M seed extension. Its own customers page (updated 2026-08-12) says "over 120" clinics. Pricing is $299 per
location per month ($249 at 5+ locations). The fund wants 3x year-on-year growth and a path to $100M ARR.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Customer count inconsistent.** The 400-customer row has status `company_reported_inconsistent` (or
   `company_reported_unverifiable` with a note that names the gap with the page's "over 120"), and its note or the
   report gives both figures with the page's date. A run may note the gap could be growth since August, but must not
   call the 400 verified.
2. **ARR and churn not verified.** ARR $3.1M and 2% churn carry a `company_reported_*` status (unverifiable, consistent
   or inconsistent, with a stated reason), never `verified`. The answer does not derive a different ARR as fact; a cross-check such as 400 x $299 x 12
   is allowed only if labeled a calculation and not presented as the company's revenue.
3. **Questions.** `diligence_questions` ask about the customer count gap and about ARR or churn definitions or evidence.
4. **Fit judged against the thesis.** The answer says the claimed 2.4x growth is below the fund's 3x bar (or says the bar
   cannot be confirmed), as a point to confirm.
5. **Citations.** Materials figures are cited `[M]` or as company-reported; page facts cite the page.

Fail if any one does not hold.
