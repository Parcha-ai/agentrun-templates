---
type: llm
---
Window: the three days to 2026-11-16. Matches: Tilda Health's Product Designer (Mid-level), Lisbon hybrid 2 days,
full-time, EUR 48,000 to 58,000 per year, posted 2026-11-15, health sector (a board copy exists on jobboard.example); and
Corvo Labs' UX/UI Designer, Lisbon onsite, full-time, posted 2026-11-14, pay not listed. Out: Brightpath (remote, US
only), Verdant Grid (senior, 7+ years), Harbor Talent's 6-month contract for an unnamed client (not full-time), and
Maresa's posting from 2026-09-20 (stale, no refresh).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Matches.** Tilda Health and Corvo Labs are in `postings`, each once, linked to their employer or ATS pages. Tilda is
   ranked above Corvo.
2. **Merged.** The jobboard.example copy of the Tilda posting is not a separate row (it may be in `also_seen_on`).
3. **Pay as stated.** Tilda's pay is EUR 48,000 to 58,000 per year; Corvo's is "not listed". No pay is invented.
4. **Near misses.** Brightpath (US only), Verdant Grid (senior) and the Harbor Talent contract (not full-time) are not
   in `postings`; each that is named appears as a near miss with that criterion.
5. **Stale out.** Maresa's September posting is not in `postings`.

Fail if any one does not hold.
