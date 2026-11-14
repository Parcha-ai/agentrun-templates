---
type: llm
---
Charge ch_3QfailNSF01 for 1,200.00 USD failed on 2026-11-14 with the decline code `insufficient_funds` (Visa ending
4242). The customer is Globex Corp (cus_Globex01), a customer since March 2026 with eight paid charges of 1,200.00
before this one, the last on 2026-10-14, and no failures. Invoice 4F2A-0011 is open after one attempt; Stripe retries
on 2026-11-17. The customer's email is billing@globex.example.

Read the Slack post and the answer's last fenced `json` block. Pass only if all hold:

1. **Who and how much.** The post names Globex Corp (or cus_Globex01) and gives $1,200.00 (or 1,200.00 USD).
2. **Why.** It says in plain words that the card had insufficient funds, and gives Visa ending 4242.
3. **History.** It says Globex has paid before (eight paid charges, or paying since March 2026, or last paid
   2026-10-14) and mentions the open invoice or Stripe's retry on 2026-11-17.
4. **Next step.** It suggests letting Stripe's retry run (or asking for another card if it fails), not reviewing for
   fraud.
5. **Kept short.** The post has no email address, no expiry date and no card number beyond the last four digits.

Answer pass or fail, and quote what decided it.
