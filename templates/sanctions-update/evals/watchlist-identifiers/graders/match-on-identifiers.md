---
type: llm
---
In the window 2026-11-09 to 2026-11-16:
- OFAC, 11/13/2026, program [IRAN-EO13902]: 4 entities and 3 vessels added to the SDN List, among them the vessel
  KESTREL STAR (IMO 9123457) and ORION PETROTRADE FZCO (Dubai, Commercial Registry Number 7788120).
- UK (FCDO), 11/11/2026 09:30: 2 entries removed from the UK Sanctions List under the Russia regime (VOLGA RIVER
  LOGISTICS JSC, NEVSKY FREIGHT PARTNERS LLC).
The OFAC 11/05/2026 item is before the window.
Watch names: "MV Kestrel Star (IMO 9123457)" matches on the IMO number. "Orion Petrotrade FZE, UAE registration
1045521" resembles ORION PETROTRADE FZCO, but the registration number (1045521 vs 7788120) and the legal form (FZE vs
FZCO) differ. "Halvard Grain Trading AS" resembles nothing listed.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Match first.** `watchlist_checks` gives Kestrel Star `match` citing IMO 9123457, and `report_markdown` leads with
   it (the line after the header, or the first item).
2. **Possible match, not match.** Orion is `possible_match` (never `match`), and its `identifiers_compared` names the
   differing registration number (and may name the legal form). Halvard is `no_match`.
3. **Actions as published.** An OFAC designation action with counts 4 entities and 3 vessels (as `added` 7, or the
   split stated in the summary) and the program tag; a UK delisting action with `removed` 2. Entries' names and IMO
   numbers are as printed.
4. **Primary links only.** Every `source_urls` entry is on ofac.treasury.gov or gov.uk.
5. **Window kept.** The 11/05/2026 OFAC item is not an action.

Fail if any name, identifier, count or date appears that the pages do not show, or a similar name alone is called a
match.
