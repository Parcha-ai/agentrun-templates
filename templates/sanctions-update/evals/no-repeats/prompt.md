---
description: "Last week's update reported a UK general licence for a bank's wind-down (expiring 31 December 2026) and OFAC's Russia-related designations of 11/09. This week the UK extended that licence to 31 March 2027 (a development), OFAC's page still lists the 11/09 designations (a repeat), OFAC made counter-terrorism designations a learned note rules out, and OFAC removed two Russia-related entities. The update holds the delisting and the licence extension only."
runs: 3
max_cost_usd: 1.50
input:
  regimes: ["OFAC", "UK"]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's sanctions update with your sanctions-update skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These names, licences and actions are test data.

--- https://ofac.treasury.gov/recent-actions (fetched 2026-11-16) ---
11/14/2026 · Russia-related Designation Removals · https://ofac.treasury.gov/recent-actions/20261114
11/12/2026 · Counter Terrorism Designations · https://ofac.treasury.gov/recent-actions/20261112
11/09/2026 · Russia-related Designations · https://ofac.treasury.gov/recent-actions/20261109

--- https://ofac.treasury.gov/recent-actions/20261114 (fetched 2026-11-16) ---
Russia-related Designation Removals. 11/14/2026.
The following entities have been removed from the SDN List [RUSSIA-EO14024]:
KAMA POLYMER TRADING LLC, Kazan, Russia; Tax ID No. 1655432198 (Russia).
URALSTONE MACHINERY JSC, Yekaterinburg, Russia; Tax ID No. 6672109834 (Russia).

--- https://ofac.treasury.gov/recent-actions/20261112 (fetched 2026-11-16) ---
Counter Terrorism Designations. 11/12/2026. The following entities have been added to the SDN List [SDGT]: CRESCENT RELIEF EXCHANGE, Sana'a, Yemen. AL-WAHA TRANSFER COMPANY, Aden, Yemen.

--- https://www.gov.uk/government/publications/ofsi-general-licence-int20265512340 (fetched 2026-11-16) ---
OFSI General Licence INT/2026/5512340: Baltic Amber Bank JSC wind-down. Amended 12 November 2026.
This licence permits UK persons to carry out activities necessary to close out positions and wind down transactions with Baltic Amber Bank JSC. Amendment: the licence's expiry has been extended from 31 December 2026 to 31 March 2027. All other terms are unchanged. Originally issued 4 November 2026.

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"quiet":false,"actions":[{"regime":"UK","issuing_body":"HM Treasury, Office of Financial Sanctions Implementation","kind":"general_license","program":"Russia","published":{"date":"2026-11-04","as_printed":"4 November 2026"},"stage":"issued","counts":{"added":null,"removed":null,"amended":null},"entries":[],"license":{"number":"INT/2026/5512340","terms":"Wind-down of transactions with Baltic Amber Bank JSC; expires 31 December 2026"},"summary":"OFSI licence allowing UK persons to wind down positions with Baltic Amber Bank JSC.","source_urls":["https://www.gov.uk/government/publications/ofsi-general-licence-int20265512340"]},{"regime":"OFAC","issuing_body":"Office of Foreign Assets Control","kind":"designation","program":"RUSSIA-EO14024","published":{"date":"2026-11-09","as_printed":"11/09/2026"},"stage":"on_list","counts":{"added":5,"removed":null,"amended":null},"entries":[],"summary":"Five Russia-related entities added to the SDN List.","source_urls":["https://ofac.treasury.gov/recent-actions/20261109"]}],"watchlist_checks":[],"regimes_checked":[],"pending_publication":[],"assumptions":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
