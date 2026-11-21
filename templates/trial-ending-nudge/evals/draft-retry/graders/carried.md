---
type: llm
---
Monday's run (handed as run history) posted Northwind Labs (sub_1TrialNWL01) and Brightpane (sub_1TrialBRP02).
Brightpane's draft was made; Northwind's failed with a 503. Today, Tuesday 2026-11-24 09:00 UTC, 3 days ahead, both
are still in the window and no other trial is. The right run makes Northwind's draft again and nothing else.

Read the draft's arguments and the answer's last fenced `json` block. Pass only if all hold:

1. **The draft.** The draft to billing@northwind.example names the Team plan, the trial end (Tuesday Nov 24) and
   $49.00 a month after it, asks for a card with the link as a bracketed blank (or none), and offers no discount,
   extension, free month or call.
2. **Bookkeeping.** `nudged` still holds both subscriptions with nudged_on 2026-11-23. Northwind's entry now shows
   its draft made and its post done; Brightpane's is unchanged.
3. **Says it.** The answer says Northwind's draft was made this run as a retry of Monday's failed one, and does not
   claim a post went out today.

Answer pass or fail, and quote what decided it.
