---
type: llm
---
The input gives no `your_company`. The page shows Team at $49 and Business at $99 per user per month (SAML SSO and
scheduled exports on Business), Enterprise as contact sales, and real-time dashboards for operations teams.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. `lens.mode` is `competing` and `lens.personalized` is false.
2. The answer says in words (in `lens.interpretation`, `angle` or `report_markdown`) that the competitive read is
   generic because no company or offer was given.
3. The `angle` holds positioning and price position taken from the pages (the three plans, the Enterprise
   "contact sales"), cited, and implications written for a generic reader. It does not name, assume or invent the
   reader's product, price, customers or strengths.
4. Published pricing is reported as published: the $49 and $99 figures, dated to the page, and Enterprise as not public.
5. No funding, headcount, customer or review claim appears without a source the run fetched.

Fail if any one does not hold.
