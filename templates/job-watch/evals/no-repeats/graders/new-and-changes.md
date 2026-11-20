---
type: llm
---
Yesterday's run (handed to the agent as run history) showed Tilda Health's Product Designer and Corvo Labs' UX/UI Designer.
Today: Tilda is still open and now closes 2026-11-30; Corvo is no longer accepting applications; Mareva Energy posted a
Product Designer role (remote EU, full-time, EUR 52,000 to 60,000, posted 2026-11-16, climate sector); Harbor Talent, an
agency, posted a full-time Lisbon role for a client, and the person's correction says no recruiter or agency postings.
Solstice Health's Product Designer (posted 2026-11-11) is older than the window, which starts at the last run's
`window.to` (2026-11-16).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **New match.** Mareva Energy is in `postings` with its pay as stated.
2. **No repeats.** Tilda Health and Corvo Labs are not in `postings`.
3. **Changes.** `changes` has one line for Tilda's new deadline (2026-11-30) and one for Corvo closing.
4. **Wish kept.** The Harbor Talent posting is not in `postings`.
5. **Window kept.** Solstice Health is not in `postings` as a new posting.

Fail if Tilda or Corvo is listed again as a new posting.
