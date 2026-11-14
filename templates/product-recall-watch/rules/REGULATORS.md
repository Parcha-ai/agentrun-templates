# Where recalls are published

Each source below publishes official notices. Open the notice itself before you report it; a list page or a search
result is a lead. Some sites answer a plain fetch with a script page or a bot check: that source is `unreachable`, with
what it answered, never "nothing matching".

## Pick the sources

- Food and drink, supplements: FDA (US), USDA FSIS for meat, poultry and egg products (US), CFIA via Recalls and Safety
  Alerts (Canada), FSA (UK), FSANZ (Australia), EU RASFF only through national pages.
- Consumer products (toys, nursery, appliances, electronics, furniture): CPSC (US), EU Safety Gate, OPSS (UK), Health
  Canada, ACCC (Australia).
- Medical devices and drugs: FDA, MHRA (UK), Health Canada, TGA (Australia); makers' field safety notices.
- Vehicles, tires, child seats, vehicle equipment: NHTSA (US), DVSA (UK), Transport Canada.
- End of sale or end of support: the maker's own lifecycle or end-of-life page, and its security advisories.
- A maker line: its own recall or press page first, then the regulators for its category.

`regions` narrows the list: "US and Canada" drops the EU, UK and Australia; "FDA, CPSC" searches those two and the
makers' pages for the US market.

## How to read each

| Source | Read this | Notes |
|---|---|---|
| CPSC | `https://www.saferproducts.gov/RestWebServices/Recall?format=json&RecallDateStart=<from>&RecallDateEnd=<to>` (add `&ProductName=<word>`) | JSON: `RecallNumber`, `RecallDate`, `Products`, `Hazards`, `Remedies`, `Injuries`, `URL` (the notice) |
| FDA (food, drugs, devices) | openFDA enforcement: `https://api.fda.gov/food/enforcement.json?search=report_date:[<YYYYMMDD>+TO+<YYYYMMDD>]&limit=100` (`drug/`, `device/` likewise) | `recall_number`, `classification` (Class I, II, III), `code_info` (lots), `reason_for_recall`, `recall_initiation_date`, `report_date`. Weekly, so a recall can show here a week after the press release |
| FDA press releases | `https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts` | the firm's announcement as FDA posts it; it says "posted" and "announcement date" |
| USDA FSIS | `https://www.fsis.usda.gov/recalls` | recall number like `045-2026`, class, establishment number, lot or "use by" dates |
| NHTSA recalls | `https://api.nhtsa.gov/recalls/recallsByVehicle?make=<make>&model=<model>&modelYear=<year>` | `NHTSACampaignNumber`, `ReportReceivedDate`, `Component`, `Summary`, `Remedy`, `PotentialNumberofUnitsAffected` |
| NHTSA investigations | the vehicle's page at `https://www.nhtsa.gov/vehicle/<year>/<make>/<model>` | Preliminary Evaluations (PE) and Engineering Analyses (EA) are investigations, not recalls |
| EU Safety Gate | `https://ec.europa.eu/safety-gate-alerts/screen/webReport` | alert number like `A12/01234/26`, risk type, measures taken; the site needs script, so search it once by product and open the alert page |
| UK | OPSS `https://www.gov.uk/product-safety-alerts-reports-recalls`, FSA `https://www.food.gov.uk/news-alerts/search/alerts`, MHRA `https://www.gov.uk/drug-device-alerts`, DVSA `https://www.check-vehicle-recalls.service.gov.uk/` | gov.uk pages read well with `max_chars: 6000` |
| Canada | `https://recalls-rappels.canada.ca/en` (Health Canada, CFIA, Transport Canada) | each notice has a number like `RA-12345` |
| Australia | ACCC `https://www.productsafety.gov.au/recalls`, FSANZ `https://www.foodstandards.gov.au/food-recalls`, TGA | PRA number on ACCC notices |

## What counts as a notice

- In: a recall or recall expansion; a safety warning or public health alert; a contamination, allergen or lot alert; a
  medical device field safety notice or correction; a vehicle or equipment recall; an import alert that withdraws
  product; a maker's end-of-sale, end-of-support or end-of-life notice.
- Also in, labelled `investigation`: an open investigation or preliminary evaluation. It is not a recall and the report
  says so.
- An update: new lots or models added, a changed remedy, a reclassification, a termination, or new injury or death counts.
- Out: news stories, social posts and retailer pages on their own (use them only to find the notice); notices for
  products no entry matches; notices published before the window that did not change in it.

## Identifiers

- A held identifier matches only when the notice prints the same value, or a range that plainly contains it ("lots
  24-100 through 24-150" contains "24-118"). Compare the value itself: letter case, spacing and a label word such as
  "Lot", "Model" or "UPC" do not count, so "LOT 24-121" matches "Lot 24-121". Every character of the value does:
  "BW-200" is not "BW-200-3"; "LOT 24-118" is not "24-1180".
- `cannot_tell`: the notice covers the product but does not print model, lot or serial detail that settles it (for
  example, it gives only a "best by" date range and the reader holds a lot code).
- `no_match`: the notice lists identifiers and the held one is not among them or inside a range.
