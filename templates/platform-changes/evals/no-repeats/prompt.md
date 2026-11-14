---
description: "Last week's log reported the gpt-6-luna snapshot shutdown (January 14), the Assistants API deprecation, Vercel's Pro overage price rise and Stripe's acacia breaking change. This week OpenAI moved the snapshot shutdown to February 11 (a development), Stripe announced a Billing retry default change, and Vercel launched a beta queue product that a learned note says the owner doesn't want. The log holds the moved shutdown and the Stripe change; the rest sit in dropped_repeats or nowhere."
runs: 3
max_cost_usd: 1.50
input:
  platforms: ["OpenAI API", "Vercel", "Stripe API"]
  usage: "Node backend on Vercel Pro, Stripe Checkout and Billing, OpenAI chat completions on gpt-6-luna"
  lookback_days: 7
---
Scheduled run, fired 2026-11-23T08:00:00Z (Monday). Write this week's platform change log for the platforms below with your platform-changes skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These entries, versions and prices are test data.

--- https://platform.openai.com/docs/deprecations (fetched 2026-11-23) ---
Deprecations
2026-11-10: gpt-6-luna snapshot
On November 10, 2026 we notified developers using gpt-6-luna-2026-03 of its deprecation. Update, November 19, 2026: the shutdown date is moved to February 11, 2027 to give more time for evaluation. Recommended replacement: gpt-6-luna-2026-10. Requests to the `gpt-6-luna` alias move to gpt-6-luna-2026-10 on December 2, 2026 (unchanged).
2026-11-13: Assistants API
The Assistants API is deprecated in favor of the Responses API. We will shut it down later in 2027 and will give at least 6 months' notice of the exact date.

--- https://vercel.com/changelog (fetched 2026-11-23) ---
Nov 18, 2026 · Introducing Vercel Queues (beta). Durable queues for your functions, free during the beta.
Nov 14, 2026 · Vercel Ship 2026: the recap.
Nov 11, 2026 · Fast Data Transfer pricing update for Pro. Starting December 1, 2026, Fast Data Transfer beyond the included 1 TB on the Pro plan is billed at $0.20 per GB, up from $0.15 per GB.

--- https://docs.stripe.com/changelog (fetched 2026-11-23) ---
2026-11-20 · Billing: for subscriptions created on or after January 5, 2027, Smart Retries default to 8 attempts within 2 weeks, up from 4 attempts within 1 week. Existing subscriptions keep their settings. https://docs.stripe.com/changelog/2026-11-20/smart-retries-default
2026-11-12.acacia · Breaking changes · Checkout: `customer_creation` no longer accepts `if_required` for Checkout Sessions in `subscription` mode. Applies when you upgrade your API version to 2026-11-12.acacia.

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-09","to":"2026-11-16"},"quiet":false,"changes":[{"platform":"OpenAI API","product":"gpt-6-luna-2026-03","kind":"shutdown","section":"act_now","title":"gpt-6-luna-2026-03 snapshot shuts down January 14, 2027","what_changed":"Snapshot deprecated; shut down on January 14, 2027; replacement gpt-6-luna-2026-10; the gpt-6-luna alias moves on December 2, 2026.","affects":"Callers of gpt-6-luna-2026-03 and the gpt-6-luna alias. You use gpt-6-luna: yes.","announced_on":"2026-11-10","deadline":{"date":"2027-01-14","wording":"January 14, 2027"},"action":"Test chat completions on gpt-6-luna-2026-10 and pin it before January 14, 2027.","source_urls":["https://platform.openai.com/docs/deprecations"]},{"platform":"OpenAI API","product":"Assistants API","kind":"deprecation","section":"coming","title":"Assistants API deprecated for the Responses API","what_changed":"Deprecated; shutdown later in 2027 with at least 6 months' notice.","affects":"Assistants API users. You use chat completions: not directly.","announced_on":"2026-11-13","deadline":{"date":null,"wording":"later in 2027"},"action":"Check nothing calls the Assistants API.","source_urls":["https://platform.openai.com/docs/deprecations"]},{"platform":"Vercel","product":"Fast Data Transfer (Pro)","kind":"pricing","section":"act_now","title":"Pro Fast Data Transfer overage rises to $0.20 per GB","what_changed":"From December 1, 2026, overage beyond the included 1 TB on Pro is $0.20 per GB, up from $0.15.","affects":"Pro plan. You are on Pro: yes.","announced_on":"2026-11-11","deadline":{"date":"2026-12-01","wording":"Starting December 1, 2026"},"action":"Check last month's data transfer against 1 TB.","source_urls":["https://vercel.com/changelog/fast-data-transfer-pricing-update-for-pro"]},{"platform":"Stripe API","product":"Checkout","kind":"breaking","section":"worth_knowing","title":"acacia drops if_required for customer_creation in subscription mode","what_changed":"API version 2026-11-12.acacia rejects customer_creation=if_required for subscription-mode Checkout Sessions.","affects":"Checkout users upgrading to 2026-11-12.acacia. You use Checkout: yes.","announced_on":"2026-11-12","deadline":{"date":null,"wording":"when you upgrade to 2026-11-12.acacia"},"action":"Remove customer_creation from subscription Checkout Sessions before upgrading.","source_urls":["https://docs.stripe.com/changelog/acacia/2026-11-12/checkout-customer-creation"]}],"platforms_checked":[],"unconfirmed":[],"assumptions":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
