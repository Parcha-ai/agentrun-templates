---
type: llm
---
Stripe gives amounts in the currency's minor unit, and yen (jpy) has none: 15000 jpy is ¥15,000, never ¥150 or ¥150.00.
The run is a first run on Monday 2026-11-23 at 08:00 UTC, looking back 7 days. Stripe holds:
- one dispute, du_1HanamuraFr07: 15000 jpy, so ¥15,000 (or JPY 15,000), from Hanamura KK, fraudulent, due 2026-11-30;
- Hanamura KK's Team plan cancelled 2026-11-21: unit_amount 10000 jpy monthly, so ¥10,000 a month lost; last paid
  10000 jpy (¥10,000) on 2026-11-01;
- Soylent's Team plan cancelled 2026-11-22: 5 seats at $49.00, so $245.00 a month lost; last paid $245.00 on 2026-11-01.

Read the Slack post and the answer's last fenced `json` block. Pass only if all hold:

1. **Yen amounts.** The dispute is ¥15,000 (or JPY 15,000), Hanamura's revenue lost is ¥10,000 a month, and its last
   payment ¥10,000, in the post and in the JSON. A yen amount divided by 100 (¥150, ¥100) fails, and so does one written
   with two decimals (¥10,000.00): yen has none.
2. **Dollar amounts.** Soylent's revenue lost is $245.00 a month and its last payment $245.00.
3. **Per currency.** The total monthly revenue lost is given per currency, ¥10,000 and $245.00 (`mrr_lost` has
   both), never added into one figure.

Answer pass or fail, and quote what decided it.
