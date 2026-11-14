---
type: llm
---
Charge ch_3QfailRDR01 for 899.00 USD was blocked by Stripe's Radar on 2026-11-14 (`outcome.type: blocked`, risk level
highest, score 91, never sent to the bank). The customer cus_New7781 ("J. Smith", email jsmith1984@mail.example) was
created two minutes before the charge and has no other charges or invoices.

Read the Slack post and the answer's last fenced `json` block. Pass only if all hold:

1. The post gives $899.00 (or 899.00 USD) and cus_New7781 (a name is fine too).
2. It says Stripe's Radar (or Stripe's fraud screen) blocked it, not that the bank declined it, and gives the risk
   level or score.
3. It says this is the customer's first payment or that the customer is brand new.
4. The next step is to review it (in Radar), and nothing asks the customer to retry or use another card.
   `decline.retry_advised`, if present, is false.
5. The post has no email address.

Answer pass or fail, and quote what decided it.
