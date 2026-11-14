---
description: "Last week's alert reported the Kestrel granola recall (three lots) and the Brightwell BW-200 monitor recall. This week FDA expanded the Kestrel recall to lots 24-131 through 24-140, the Brightwell notice is unchanged, and Kestrel recalled pet treats, which a learned note says the owner doesn't carry. The alert holds only the Kestrel expansion, with the held lot 24-133 as a match inside the new range."
runs: 3
max_cost_usd: 1.50
input:
  products: ["Kestrel Foods", "Brightwell BW-200 baby monitor"]
  regions: "US"
  held_identifiers: ["LOT 24-133"]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Check for new recalls and safety notices on the products below with your recall-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching. These firms, products and notices are test data.

--- https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/kestrel-foods-expands-recall-oat-crunch-granola (fetched 2026-11-16) ---
Kestrel Foods Expands Recall of Oat Crunch Granola Because of Undeclared Peanut
Company Announcement Date: November 13, 2026 · FDA Publish Date: November 13, 2026 · Product Type: Food & Beverages · Reason: Undeclared peanut
Kestrel Foods, Inc. is expanding its November 5, 2026 recall of Kestrel Oat Crunch Granola, Maple Almond, 12 oz (UPC 0 12345 67890 1) to include lots 24-131 through 24-140, best by 2027-03-21 through 2027-04-10, in addition to the previously recalled lots 24-118, 24-119 and 24-121. One allergic reaction has been reported in connection with the expanded lots. Consumers should not eat the product and may return it to the place of purchase for a full refund. Questions: 1-800-555-0142.

--- https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/kestrel-foods-recalls-pet-bites-chicken-treats (fetched 2026-11-16) ---
Kestrel Foods Recalls Pet Bites Chicken Treats Because of Possible Salmonella Health Risk
Company Announcement Date: November 12, 2026 · Product Type: Animal & Veterinary · Lot 25-301, 8 oz pouch.

--- https://www.saferproducts.gov/RestWebServices/Recall?format=json&RecallDateStart=2026-11-09&RecallDateEnd=2026-11-16 (fetched 2026-11-16) ---
[]

--- https://www.cpsc.gov/Recalls/2027/brightwell-home-electronics-recalls-bw-200-video-baby-monitors-due-to-burn-hazard (fetched 2026-11-16) ---
Recall Date: November 6, 2026 · Recall Number: 27015 · Brightwell Home Electronics Recalls BW-200 Video Baby Monitors Due to Burn Hazard. Units: About 41,000. Incidents/Injuries: 14 reports of overheating, including 2 reports of minor burns. Remedy: stop using the parent unit and contact Brightwell for a free replacement battery pack.

The result of this trigger's last completed run:

```json
{"window":{"from":"2026-11-02","to":"2026-11-09"},"quiet":false,"notices":[{"regulator":"U.S. Food and Drug Administration","maker":"Kestrel Foods, Inc.","notice_id":"F-0388-2027","status":"class_ii_recall","product":"Kestrel Oat Crunch Granola, Maple Almond, 12 oz","matched_line":"Kestrel Foods","affected":["Lot 24-118","Lot 24-119","Lot 24-121","Best by 2027-03-01 through 2027-03-20","UPC 0 12345 67890 1"],"hazard":"Undeclared peanut","counts":null,"remedy":"Do not eat; return for a full refund; 1-800-555-0142","published_on":"2026-11-05","event_date":"2026-11-05","is_update":false,"change_since_last":null,"identifier_checks":[{"identifier":"LOT 24-133","result":"no_match","why":"Not among the listed lots"}],"so_what":"Check stock for lots 24-118, 24-119 and 24-121.","source_url":"https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts/kestrel-foods-recalls-oat-crunch-granola"},{"regulator":"U.S. Consumer Product Safety Commission","maker":"Brightwell Home Electronics","notice_id":"27015","status":"voluntary_recall","product":"Brightwell BW-200 Video Baby Monitor","matched_line":"Brightwell BW-200 baby monitor","affected":["Model BW-200 parent units manufactured January 2025 through June 2025"],"hazard":"Battery can overheat, burn hazard","counts":"14 reports of overheating, 2 minor burns; about 41,000 units","remedy":"Stop using the parent unit; free replacement battery pack from Brightwell","published_on":"2026-11-06","event_date":null,"is_update":false,"change_since_last":null,"identifier_checks":[{"identifier":"LOT 24-133","result":"no_match","why":"Not a Brightwell identifier"}],"so_what":"Pull affected parent units and request battery packs.","source_url":"https://www.cpsc.gov/Recalls/2027/brightwell-home-electronics-recalls-bw-200-video-baby-monitors-due-to-burn-hazard"}],"identifier_summary":"LOT 24-133 matched no notice.","sources_checked":[],"assumptions":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
