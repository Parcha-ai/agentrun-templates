---
description: "Three vendors' pages in a busy week. OpenAI set a shutdown date for the gpt-6-luna snapshot the team uses and gave the Assistants API only 'later in 2027'; Vercel raised Pro data transfer overage from December 1; Stripe shipped an API version with a breaking change on upgrade. Stripe Terminal's reader end of support can't touch this team, and Vercel's conference recap is marketing. The log holds four changes, the Assistants deadline in the vendor's own words, and leaves the rest out."
runs: 3
max_cost_usd: 1.50
input:
  platforms: ["Stripe API", "OpenAI API", "Vercel"]
  usage: "Node backend on Vercel Pro, Stripe Checkout and Billing for US and EU customers, OpenAI chat completions on gpt-6-luna and the Assistants API for the support bot"
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's platform change log for the platforms below with your platform-changes skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These entries, versions and prices are test data.

--- https://platform.openai.com/docs/deprecations (fetched 2026-11-16) ---
Deprecations
2026-11-10: gpt-6-luna snapshot
On November 10, 2026 we notified developers using gpt-6-luna-2026-03 of its deprecation. The snapshot will be shut down on January 14, 2027. Recommended replacement: gpt-6-luna-2026-10. Requests to the `gpt-6-luna` alias move to gpt-6-luna-2026-10 on December 2, 2026.
2026-11-13: Assistants API
The Assistants API is deprecated in favor of the Responses API. We will shut it down later in 2027 and will give at least 6 months' notice of the exact date. See the migration guide.
2026-08-04: text-embedding-3-small-legacy
Shut down on 2026-10-06. Replacement: text-embedding-4-small.

--- https://vercel.com/changelog (fetched 2026-11-16) ---
Nov 14, 2026 · Vercel Ship 2026: the recap. Watch the keynote and every session on demand.
Nov 11, 2026 · Fast Data Transfer pricing update for Pro. Starting December 1, 2026, Fast Data Transfer beyond the included 1 TB on the Pro plan is billed at $0.20 per GB, up from $0.15 per GB. Hobby and Enterprise are unchanged. https://vercel.com/changelog/fast-data-transfer-pricing-update-for-pro
Oct 30, 2026 · Node.js 24 is now the default runtime for new projects.

--- https://docs.stripe.com/changelog (fetched 2026-11-16) ---
2026-11-12.acacia · Breaking changes · Checkout: `customer_creation` no longer accepts `if_required` for Checkout Sessions in `subscription` mode; omit the parameter instead. Applies when you upgrade your API version to 2026-11-12.acacia. https://docs.stripe.com/changelog/acacia/2026-11-12/checkout-customer-creation
2026-11-10 · Terminal: BBPOS WisePad 2 readers reach end of support on March 31, 2027. Order WisePad 3 replacements from the Dashboard. https://docs.stripe.com/changelog/2026-11-10/terminal-wisepad-2-end-of-support
2026-10-28.acacia · Billing: new `billing_thresholds.reset_cycle` option. https://docs.stripe.com/changelog/acacia/2026-10-28/billing-thresholds-reset
