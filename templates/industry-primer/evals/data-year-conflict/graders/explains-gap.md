---
type: llm
---
Two supplied estimates differ by scope and by year. Alderbank Insights (published 2026-01-27): EUR 14.0 billion in 2024
for equipment only (manufacturer sales), down from EUR 15.3 billion in 2023, installation excluded. The Heat Policy
Observatory (published 2026-06-09): EUR 22.5 billion in 2025 for household spending on equipment plus installation;
installation is about 40% of a typical project; installers are fragmented, most under ten employees. The angle is an
installer roll-up.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Both kept.** `market_size` holds both figures as separate rows, each cited to its page.
2. **Data years right.** The EUR 14.0 billion row's data year is 2024 and the EUR 22.5 billion row's is 2025. Neither is
   given 2026 as its data year (2026 may appear as the publication date).
3. **Gap explained.** `size_note` (or the report) says the figures differ because one is equipment only and the other
   includes installation, and they describe different years. It may note that 40% installation share roughly bridges
   them, labeled as a calculation or inference.
4. **Never averaged.** No averaged or blended single market size (e.g. EUR 18 billion) is presented as the market size.
5. **Angle served.** The answer gives the installer layer attention (value chain stage, fragmentation, or a trend or
   implication for a roll-up), citing the Observatory page for the fragmentation fact.

Fail if any one does not hold.
