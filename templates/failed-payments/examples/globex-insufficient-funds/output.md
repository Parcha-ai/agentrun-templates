Illustrative output, written by hand from the `insufficient-funds` eval case's test account. A measured eval run
replaces it.

Globex's $1,200 monthly charge bounced for insufficient funds, and one alert went to the billing channel. Globex has
paid every month since March, so the alert reads as a blip, not a churn risk, and points at Stripe's own retry on
2026-11-17 before anyone chases them.

> :warning: *Payment failed: $1,200.00 from Globex Corp (cus_Globex01)*
> Why: the bank declined it, not enough money on the card. Visa ending 4242.
> History: customer since March 2026, 8 paid charges and no failures before this, last paid 2026-10-14. Invoice
> 4F2A-0011 is open; Stripe retries on 2026-11-17.
> Next: let Stripe's retry run; if it fails too, ask Globex for another card.
> https://dashboard.stripe.com/payments/ch_3QfailNSF01
