---
type: llm
---
The window is 2026-11-16 to 2026-11-23. Last week's log, handed to the run, reported four changes: the gpt-6-luna-2026-03
shutdown on January 14, 2027; the Assistants API deprecation ("later in 2027"); Vercel's Pro overage rise to $0.20 per
GB; Stripe's 2026-11-12.acacia `customer_creation` breaking change. This week:
- OpenAI updated the snapshot entry on 2026-11-19: the shutdown moves to February 11, 2027 (a development).
- Stripe (2026-11-20): Smart Retries default to 8 attempts within 2 weeks, up from 4 within 1 week, for subscriptions
  created on or after January 5, 2027 (new, in scope: the team uses Billing).
- Vercel (2026-11-18): Vercel Queues beta, a new feature; a learned note says the owner wants no new features or betas.
- The Assistants, Vercel price and acacia entries are unchanged.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **The development is in.** A change for the gpt-6-luna-2026-03 shutdown with `deadline.date` 2027-02-11, and
   `change_since_last` (or the report) saying it moved from January 14, 2027.
2. **The new change is in.** A Stripe Billing change for the Smart Retries default (4 attempts in 1 week to 8 in 2
   weeks, for subscriptions created on or after January 5, 2027).
3. **Repeats out.** No change for the Assistants API, the Vercel overage price or the acacia breaking change; each is in
   `dropped_repeats` (or plainly accounted for as already reported) and not in the report's list.
4. **Owner's wish kept.** No change for Vercel Queues, and `report_markdown` does not mention it.

Fail if a change the last log reported comes back as new.
