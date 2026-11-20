---
type: llm
---
The task gives every endpoint's answer. Fundable returned four fintech rounds, `total_count` 4:
- Ledgerline: $12M Series A, led by Northfield Ventures (Quarry Capital and Sela Partners took part), valuation $60M,
  announced 2026-11-12, links `https://news.example/ledgerline-series-a` and `https://wire.example/2026/11/12/ledgerline`.
  Crunchbase matched it exactly: `https://www.crunchbase.com/organization/ledgerline`.
- Fernbank: $6M Series A extension, co-led by Maple Growth and Ridge Partners (Olive Seed Fund joined), 2026-11-10,
  `https://startups.example/fernbank-raises-6m`. Crunchbase: `https://www.crunchbase.com/organization/fernbank-app`.
- Tallypay: $3.5M seed; the description names Alder Fund, Brook Angels and Cove Ventures as taking part and says the
  article does not say who led. 2026-11-13, `https://news.example/tallypay-seed`. Crunchbase answered only "TallyPay
  Labs", a payroll company: not a match.
- Coinwell: seed, amount undisclosed (0), from Pine Street Partners, 2026-11-14, `https://blog.example/coinwell-seed`.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **All four, nothing else.** `rounds` holds exactly these four companies; `matched_total` is 4; `quiet` is false.
2. **Amounts.** Ledgerline 12000000, Fernbank 6000000, Tallypay 3500000, Coinwell null. The report never gives Coinwell
   an amount.
3. **Leads as named.** Ledgerline's `lead` is Northfield Ventures; Fernbank's holds Maple Growth and Ridge Partners;
   Tallypay's and Coinwell's are empty, and the report says their leads were not named. Coinwell's description says the
   round came "from Pine Street Partners", not that it led, so Pine Street sits in `other_investors`. The report says
   "led by" only for firms a description says led.
4. **Stages.** Fernbank's stage says it is a Series A extension; Ledgerline's is Series A, the other two Seed.
5. **Links.** Each round's `links` are its own article links above, primary first; no other URL appears in the answer
   except the two Crunchbase links. Tallypay's and Coinwell's `crunchbase_url` are null; nothing from "TallyPay Labs"
   (payroll for restaurants) is used for Tallypay.
6. **What they do.** Each `what_it_does` matches its description or its matched Crunchbase entry.

Answer pass or fail, and quote the field or line that decided it.
