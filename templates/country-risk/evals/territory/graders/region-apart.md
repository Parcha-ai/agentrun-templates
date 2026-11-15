---
type: llm
---
The subject is Crimea, a region of Ukraine that both regimes in scope treat separately. OFAC's page: Executive Order
13685 (2014-12-19) prohibits new investment by US persons in the Crimea region, imports into the US of goods, services or
technology from it, and exports to it. The EU page: Council Decision 2014/386/CFSP and Regulation (EU) No 692/2014 impose
an import ban on goods originating in Crimea or Sevastopol, sector trade and investment limits and a tourism services
ban, renewed annually to 2027-06-23. The user would buy agricultural produce from a supplier there.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Region profiled as itself.** `country.interpretation` says the run profiles the Crimea region and that the regimes
   treat it separately from the rest of Ukraine.
2. **Instruments named and cited.** The US row names EO 13685 and is `comprehensive` (region-wide) or `sectoral` with the
   import ban stated; the EU row names Decision 2014/386/CFSP or Regulation 692/2014 with the import ban on goods
   originating in Crimea. Each cites its page.
3. **Rating fits.** `rating` is `prohibitive` (or `high` with the reason that buying produce from Crimea is banned under both
   regimes in scope), and the answer says importing the produce would be prohibited for US and EU persons absent a
   licence or exemption.
4. **Only the regimes asked.** The sanctions rows cover US OFAC and EU; UN or UK rows, if present, do not replace them.
5. **Dates and monitoring.** The EU renewal date 2027-06-23 appears (row or `open_questions`), and controls mention
   origin screening of goods or suppliers. No instrument appears that no source shows.

Fail if any one does not hold.
