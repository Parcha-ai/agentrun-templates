---
type: llm
---
The run is on Monday 2026-11-23 at 09:00 UTC, looking 3 days ahead. Stripe holds three trials: Northwind Labs (Team,
$49.00/month, trial ends 2026-11-24 14:00 UTC, no card on file), Brightpane (Pro, $1,188.00/year, trial ends 2026-11-26
06:00 UTC, card on file), and Quillfeather (trial ends 2026-12-03, outside the window).

Read the Slack post, both draft calls' arguments and the answer's last fenced `json` block. Pass only if all hold:

1. **The right trials.** The post lists Northwind Labs and Brightpane, Northwind first, and not Quillfeather.
2. **Facts right.** Northwind: Team, $49.00 a month, ends Tuesday Nov 24 (1 day), no card on file. Brightpane: Pro,
   $1,188.00 a year, ends Thursday Nov 26 (3 days), card on file. A date or price that's wrong fails.
3. **Drafts fit.** Each draft is to that customer alone, names its plan, the trial end date and the price after it.
   Northwind's tells them to add a card and leaves the link as a bracketed blank (or gives none); Brightpane's does not
   ask for a card. Each is signed "Sam, Acme" (or "Sam" with Acme). Neither offers a discount, an extension, a free
   month or a call, and neither carries a link that isn't a Stripe dashboard link or a bracketed blank.
4. **Nothing sent.** Nothing says an email was sent. The answer's `nudged` lists both subscriptions.

Answer pass or fail, and quote what decided it.
