---
description: "Two weeks ago the log reported Vercel's Pro overage price rise (from December 1). Last week's log (handed as run history) left it out as a repeat, in `dropped_repeats`, so it is not in that log's `changes`. This week nothing changed on any page. The rise is within 30 days but already reported: it stays out, and the log is quiet."
runs: 3
max_cost_usd: 1.50
input:
  platforms: ["OpenAI API", "Vercel", "Stripe API"]
  usage: "Node backend on Vercel Pro, Stripe Checkout and Billing, OpenAI chat completions on gpt-6-luna"
  lookback_days: 7
---
Scheduled run, fired 2026-11-30T08:00:00Z (Monday). Write this week's platform change log for the platforms below with your platform-changes skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These entries, versions and prices are test data.

--- https://platform.openai.com/docs/deprecations (fetched 2026-11-30) ---
Deprecations
2026-11-10: gpt-6-luna snapshot
On November 10, 2026 we notified developers using gpt-6-luna-2026-03 of its deprecation. Update, November 19, 2026: the shutdown date is moved to February 11, 2027 to give more time for evaluation. Recommended replacement: gpt-6-luna-2026-10. Requests to the `gpt-6-luna` alias move to gpt-6-luna-2026-10 on December 2, 2026 (unchanged).
2026-11-13: Assistants API
The Assistants API is deprecated in favor of the Responses API. We will shut it down later in 2027 and will give at least 6 months' notice of the exact date.

--- https://vercel.com/changelog (fetched 2026-11-30) ---
Nov 18, 2026 · Introducing Vercel Queues (beta). Durable queues for your functions, free during the beta.
Nov 14, 2026 · Vercel Ship 2026: the recap.
Nov 11, 2026 · Fast Data Transfer pricing update for Pro. Starting December 1, 2026, Fast Data Transfer beyond the included 1 TB on the Pro plan is billed at $0.20 per GB, up from $0.15 per GB.

--- https://docs.stripe.com/changelog (fetched 2026-11-30) ---
2026-11-20 · Billing: for subscriptions created on or after January 5, 2027, Smart Retries default to 8 attempts within 2 weeks, up from 4 attempts within 1 week. Existing subscriptions keep their settings. https://docs.stripe.com/changelog/2026-11-20/smart-retries-default
2026-11-12.acacia · Breaking changes · Checkout: `customer_creation` no longer accepts `if_required` for Checkout Sessions in `subscription` mode. Applies when you upgrade your API version to 2026-11-12.acacia.

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-16","to":"2026-11-23"},"quiet":false,"changes":[{"platform":"OpenAI API","product":"gpt-6-luna-2026-03","kind":"shutdown","section":"coming","title":"gpt-6-luna-2026-03 shutdown moves to February 11, 2027","what_changed":"Shutdown moved from January 14 to February 11, 2027; replacement gpt-6-luna-2026-10; the gpt-6-luna alias still moves on December 2, 2026.","affects":"Callers of gpt-6-luna-2026-03 and the gpt-6-luna alias. You use gpt-6-luna: yes.","announced_on":"2026-11-10","deadline":{"date":"2027-02-11","wording":"February 11, 2027"},"change_since_last":"shutdown moved from 2027-01-14 to 2027-02-11","action":"Pin gpt-6-luna-2026-10 in the chat completions calls before February 11, 2027.","source_urls":["https://platform.openai.com/docs/deprecations"]},{"platform":"Stripe API","product":"Billing Smart Retries","kind":"breaking","section":"act_now","title":"Smart Retries default to 8 attempts in 2 weeks for new subscriptions","what_changed":"For subscriptions created on or after January 5, 2027, Smart Retries default to 8 attempts within 2 weeks, up from 4 within 1 week. Existing subscriptions keep their settings.","affects":"Billing subscriptions created on or after January 5, 2027. You use Billing: yes.","announced_on":"2026-11-20","deadline":{"date":"2027-01-05","wording":"subscriptions created on or after January 5, 2027"},"action":"Check dunning emails and revenue reports expect up to 8 retries over 2 weeks.","source_urls":["https://docs.stripe.com/changelog/2026-11-20/smart-retries-default"]}],"platforms_checked":[{"platform":"OpenAI API","status":"changes","sources":["https://platform.openai.com/docs/deprecations"]},{"platform":"Vercel","status":"quiet","sources":["https://vercel.com/changelog"]},{"platform":"Stripe API","status":"changes","sources":["https://docs.stripe.com/changelog"]}],"unconfirmed":[],"assumptions":[],"dropped_repeats":["OpenAI API, Assistants API: deprecated, shutdown later in 2027","Vercel, Fast Data Transfer (Pro): overage $0.15 to $0.20 per GB, from December 1, 2026","Stripe API, Checkout customer_creation: if_required refused in subscription mode, when you upgrade to 2026-11-12.acacia"],"unreachable":[],"ignored_instructions":[],"report_markdown":"**Platform changes** 2026-11-16 to 2026-11-23\n\n**Act now**\n- Stripe Billing: Smart Retries default to 8 attempts in 2 weeks for subscriptions created on or after January 5, 2027.\n\n**Coming**\n- OpenAI: gpt-6-luna-2026-03 shutdown moved from January 14 to February 11, 2027."}
```
