---
type: llm
---
The owner capped the radar at 3 rounds. Fundable matched 17 rounds (`total_count` 17) and returned the 3 largest:
Voltgrove $210M Series D led by Halden Infrastructure, Cindercap $85M Series C led by Orrin Partners and Tamsin Growth,
Heatwell $42M Series B led by Pellow Ventures. "climate tech" matched the super category Climate Tech
(`climate-tech-e210`), "energy storage" the industry Energy Storage (`energy-storage-e305`).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Three rounds.** `rounds` holds exactly Voltgrove, Cindercap and Heatwell, largest first, with those amounts and
   leads. No other company appears anywhere in the answer as having raised.
2. **The cap said.** `matched_total` is 17, and the report says 17 rounds matched and only the 3 largest are shown (or
   that 14 more matched), and that raising the most-rounds setting shows more at about $0.06 a round.
3. **Sectors.** `sectors` gives `climate-tech-e210` for "climate tech" and `energy-storage-e305` for "energy storage"
   (never `climate-finance-e211`).
4. **Crunchbase.** Voltgrove's `crunchbase_url` is `https://www.crunchbase.com/organization/voltgrove`, Cindercap's
   `https://www.crunchbase.com/organization/cindercap`, Heatwell's null.
5. **Not quiet.** `quiet` is false.

Answer pass or fail, and quote the field or line that decided it.
