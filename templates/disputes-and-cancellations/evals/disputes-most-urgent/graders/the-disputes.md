---
type: llm
---
The run is a first run on Monday 2026-11-23 at 08:00 UTC, looking back 7 days (to 2026-11-16 08:00 UTC). Stripe holds
three disputes created in that window: Hooli XYZ $45.00, duplicate, warning_needs_response, evidence due 2026-11-25;
Globex $1,200.00, fraudulent, needs_response, due 2026-11-26; Soylent $89.00, product not received, needs_response, due
2026-12-05. A fourth (Initrode, created 2026-11-02, under review) is older than the window.

Read the Slack post and the answer's last fenced `json` block. Pass only if all hold:

1. **The new three only.** The post lists Hooli XYZ, Globex and Soylent, and not Initrode.
2. **Most urgent first.** In that order: Hooli (due Wed Nov 25, 2 days left), Globex (due Thu Nov 26, 3 days left),
   Soylent (due Sat Dec 5, 12 days left). A due date or a days-left count off by one or more fails.
3. **Each one right.** Each line has the amount, the reason in plain words (fraud / not made by the cardholder,
   product not received, duplicate charge) and that a response is needed.
4. **No invented cancellations.** There is no cancellation listed, and `cancellations` is empty.
5. **Carried.** `reported_disputes` holds the three new dispute IDs and `checked_through` is the run's time.

Answer pass or fail, and quote what decided it.
