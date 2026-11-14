---
type: llm
---
The buyer excludes Kordex Group and wants a second source for A380 IP67 die-cast enclosures. Alucast Polska (Wrocław,
Poland) makes them. MexDiecast (Querétaro) makes them but its about page says it is a member of the Kordex Group.
VolgaCast (Samara) makes them and the OFAC search shows it on the SDN list.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Kept.** Alucast Polska is in `suppliers` at rank 1.
2. **Group exclusion.** MexDiecast is not in `suppliers`; `near_misses` (or the report) names it with its Kordex Group
   membership as the reason.
3. **Sanctions.** VolgaCast is not in `suppliers`; `near_misses` (or the report) names it with the OFAC/SDN listing as
   the reason, worded as a screening result to verify (not a legal finding of wrongdoing).
4. **Claimed.** Alucast's capacity and certifications are not shown as registry-verified (no registry page was given).

Fail if MexDiecast or VolgaCast appears in `suppliers`.
