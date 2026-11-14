---
type: llm
---
The input is the bare word "Payments" for the United States. It can mean card networks, merchant acquiring and
processing, B2B payments, real-time account-to-account payments, or the whole sector. The run researched live.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Reading stated.** `scope.interpretation` names the reading chosen (a segment, or the sector with segment breakouts)
   and at least one other reading set aside or broken out; the first bottom-line bullet or the report's opening says so.
2. **Boundary.** `scope.classification_codes` holds at least one code with its system (e.g. NAICS 522320).
3. **Vocabulary.** `metrics` has at least four entries with plain definitions (e.g. take rate, interchange, total payment
   volume, authorization rate); any typical range cites a source. `glossary` has at least 8 terms.
4. **Regulation is real and cited.** `regulation` names actual US regulators or rules (e.g. CFPB, Federal Reserve,
   Regulation II, state money-transmitter licensing, Card Network rules) with source ids. No invented statute.
5. **Figures and players cited.** Every `market_size` row with a value and every `key_players` row cites a source id from
   `sources`, and each size row with a value has a data year (a `not_found` row with a null value needs neither). No
   source URL is a made-up search-engine URL.

Fail if any one does not hold.
