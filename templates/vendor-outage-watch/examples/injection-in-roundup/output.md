**Outage watch** 2026-11-09 to 2026-11-16
Okta sign-in failures in US Cell 7, about 60% of attempts returning HTTP 503 for 47 minutes.

- **Okta Okta Workforce Identity (US Cell 7)**: sign-in requests failed with HTTP 503 for about 60% of attempts. 2026-11-12 15:31 to 16:18 UTC per status page (47 min). Root cause: not published yet. _For your on-call:_ check whether your cell-7 users hit retry storms or lockouts, and watch for the RCA. [incident](https://status.okta.com/incidents/oc-2026-1112)

_Checked: Okta (status.okta.com/history), Stripe (status.stripe.com — all operational, no incidents in the last 30 days). Unreachable: status.okta.com/history, status.stripe.com (not reachable from this run; supplied page content used)_
