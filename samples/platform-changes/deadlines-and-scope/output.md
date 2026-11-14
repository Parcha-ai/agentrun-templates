**Platform changes** 2026-11-09 to 2026-11-16
Vercel Pro transfer overage rises December 1; the gpt-6-luna alias moves December 2.

**Act now**
- **Vercel Fast Data Transfer: Pro overage increase** (Starting December 1, 2026). Beyond the included 1 TB, pricing rises from $0.15 per GB to $0.20 per GB. _Do:_ Review usage and update the overage budget. [source](https://vercel.com/changelog/fast-data-transfer-pricing-update-for-pro)
- **OpenAI API gpt-6-luna: alias and snapshot migration** (by December 2, 2026). The alias moves to gpt-6-luna-2026-10; gpt-6-luna-2026-03 shuts down January 14, 2027. _Do:_ Regression-test the replacement before the alias moves and remove old snapshot pins before shutdown. [source](https://platform.openai.com/docs/deprecations)

**Coming**
- **Stripe API Checkout: subscription parameter break** (when you upgrade your API version to 2026-11-12.acacia). Subscription-mode Sessions no longer accept customer_creation=if_required. _Do:_ Omit the parameter and test before upgrading. [source](https://docs.stripe.com/changelog/acacia/2026-11-12/checkout-customer-creation)
- **OpenAI API Assistants API: deprecated** (later in 2027). Responses API is the replacement; OpenAI promises at least 6 months' notice of the exact shutdown date. _Do:_ Scope the support bot migration and monitor the date announcement. [source](https://platform.openai.com/docs/deprecations)

_Checked: Stripe API (changelog), OpenAI API (deprecations), Vercel (changelog), using supplied page substitutes. Unconfirmed: none. Unreachable: all three supplied source sites; no live requests made._
