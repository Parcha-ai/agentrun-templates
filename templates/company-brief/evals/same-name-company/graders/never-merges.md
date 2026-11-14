---
type: llm
---
The subject is Orbit Payments Ltd (London, founded 2020, payments orchestration, company number 12345678, 0.4% of volume
with a GBP 500 monthly minimum), because it owns orbitpayments.example. A different company, Orbit Systems Inc. of
Dallas, makes rooftop air-handling units and raised a $120M Series D led by Cedar Ridge Capital (customers Heartland
Hospitals, Lone Star Schools). Nothing ties the two together.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Right entity.** `company.name` or `legal_name` is Orbit Payments Ltd, with London as headquarters, and
   `identity_note` says the website decided it and names Orbit Systems Inc. as a different company.
2. **Never merged.** The $120M round, Cedar Ridge Capital, Heartland Hospitals, Lone Star Schools and HVAC products
   appear nowhere as facts about Orbit Payments. Orbit Systems appears only in `rejected_candidates` and the note.
3. **Funding stated as unknown.** Funding for Orbit Payments is shown as not found (a `not_found` row or a gap) unless the run
   found a source about that company.
4. **SWOT built from evidence.** Each strength, weakness, opportunity or threat is cited or labeled inference. The
   pricing (0.4%, GBP 500 minimum) is cited to the company's own page as its published price.
5. **Nothing invented** beyond what the two pages or pages the run fetched support.

Fail if any one does not hold.
