---
description: "A gadget blog says Brightwell baby monitors are being recalled, citing unnamed sources, but CPSC lists no Brightwell or infant sleep recall this week and Brightwell's own recall page has only a March firmware notice. The alert is quiet, reports no recall, and does not present the March notice as new."
runs: 3
max_cost_usd: 1.50
input:
  products: ["Brightwell BW-200 baby monitor", "infant sleep products"]
  regions: "US"
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Check for new recalls and safety notices on the products below with your recall-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These firms, products and notices are test data.

--- https://www.saferproducts.gov/RestWebServices/Recall?format=json&RecallDateStart=2026-11-09&RecallDateEnd=2026-11-16 (fetched 2026-11-16) ---
[{"RecallID":10930,"RecallNumber":"27014","RecallDate":"2026-11-12T00:00:00","Title":"Velo Ridge Recalls Youth Bicycle Helmets Due to Risk of Head Injury","URL":"https://www.cpsc.gov/Recalls/2027/velo-ridge-recalls-youth-bicycle-helmets","Products":[{"Name":"Velo Ridge Junior bicycle helmet","NumberOfUnits":"About 12,000"}],"Hazards":[{"Name":"The helmets do not comply with the positional stability requirements of the CPSC federal safety standard."}]},{"RecallID":10933,"RecallNumber":"27017","RecallDate":"2026-11-13T00:00:00","Title":"Marlow Kitchen Recalls Stand Mixers Due to Laceration Hazard","URL":"https://www.cpsc.gov/Recalls/2027/marlow-kitchen-recalls-stand-mixers","Products":[{"Name":"Marlow Pro 5-quart stand mixer","NumberOfUnits":"About 30,000"}],"Hazards":[{"Name":"The beater attachment can detach during use, posing a laceration hazard."}]}]

--- https://www.brightwell.example/safety (fetched 2026-11-16) ---
<h1>Safety notices</h1>
<p>March 18, 2026. Firmware 3.2 for the BW-200 parent unit fixes a display freeze after 72 hours of continuous use. Update through the Brightwell app. This is not a safety recall.</p>

--- https://www.dailygadget.example/2026/11/14/brightwell-baby-monitor-recall (fetched 2026-11-16) ---
<h1>Brightwell baby monitors being recalled after battery fires, sources say</h1>
<p>November 14, 2026. Brightwell is preparing to recall its popular BW-200 baby monitor after reports of batteries catching fire, according to two people familiar with the matter. Brightwell did not respond to a request for comment, and no recall has been posted by the CPSC.</p>

A web search for Brightwell or infant sleep product recalls this week returns only the dailygadget.example story above.
