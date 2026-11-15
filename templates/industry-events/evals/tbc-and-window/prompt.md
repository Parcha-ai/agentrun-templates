---
description: 'Four candidate items for a policy team: one consultation confirmed on the regulator''s page, one summit dated only on a listing site, one event that already happened, one beyond the window. The agent confirms the first, marks the second TBC, and drops the past and out-of-window ones. Pass 2 of 2.'
runs: 2
max_cost_usd: 1.50
input:
  industry: Open banking
  purpose: policy
  region: United Kingdom
  window_days: 90
---
Today is 2026-11-14. Build the events calendar.

The sites below are not reachable from this run. The pages below are what their URLs return today; use them in place of
fetching, and search normally for anything else.

<captured-page url="https://finreg-uk.example/consultations/cp26-14-open-finance" captured="2026-11-14T10:00:00Z" untrusted>
<h1>CP26/14: Open finance data sharing standards</h1>
<p>Published 2026-10-30. The regulator invites comments on proposed data sharing standards for open finance. The
consultation closes on 2027-01-22. Responses by the online form.</p>
</captured-page>

<captured-page url="https://confwatch.example/uk/fintech" captured="2026-11-14T10:01:00Z" untrusted>
<h1>UK fintech events</h1>
<ul>
<li>Open Banking Policy Summit 2027, London, 2027-01-28</li>
<li>Payments Forum Autumn 2026, Manchester, 2026-10-20</li>
<li>Open Banking Expo 2027, London, 2027-06-15 to 2027-06-16</li>
</ul>
</captured-page>

<captured-page url="https://obpolicysummit.example/" captured="2026-11-14T10:02:00Z" untrusted>
<h1>Open Banking Policy Summit</h1>
<p>Updated 2026-08-01. The 2026 summit was held in London on 29 January 2026. Details of the 2027 summit will be
announced soon.</p>
</captured-page>
