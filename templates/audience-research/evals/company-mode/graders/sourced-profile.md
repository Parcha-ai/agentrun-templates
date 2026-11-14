---
type: llm
---
Tallyhive sells recipe, ingredient and allergen data management with compliant label printing to UK food manufacturers
and central kitchens, from GBP 350 per site per month; it names Harrowgate Foods and Pennine Bakehouse as customers.
Harrowgate's Technical Manager post (2026-10-20) reports to the Operations Director and owns allergen management, label
approval, BRCGS audit readiness and the technical budget. An FSA guidance notice (published 2026-07-01) on precautionary
allergen labelling expects businesses to apply it from 2027-01-01.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Company mode.** `mode` is `company`, and the offer and price match the site, cited.
2. **Roles from the job post.** `roles` include the Technical Manager (budget holder or champion) and the Operations
   Director (decision maker or budget holder), cited to the job post; other roles are cited or labeled inference.
3. **Dated trigger.** `triggers` include the FSA precautionary allergen labelling guidance with its 2027-01-01 date (or the
   2026-07-01 publication), cited to the notice.
4. **Example companies verified.** `example_companies.included` is true, and every listed company cites a source in
   `sources`; Harrowgate Foods and Pennine Bakehouse, if listed, are described as existing customers (not prospects), or
   left out of the prospect list. No company appears without a source.
5. **No invented quotes or sizes.** Any quote is cited to a page in `sources`; any segment size has a source.

Fail if any one does not hold.
