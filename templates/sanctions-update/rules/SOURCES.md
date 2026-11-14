# Where each regime publishes

Primary sources only. These are candidates, not a promise that every page answers: a blocked page goes in
`unreachable` with what it returned, and that regime is not "quiet".

## How to read them

- A recent-actions page gives the date and a title per action. The counts, the entries and their identifiers, and any
  licence's terms live in the action's own notice: open it before writing the action.
- Adopted, in force and on the list are three different moments. The EU adopts a measure (Council press release), it
  enters into force when published in the Official Journal (or on the date the act says), and the entries then appear
  on the consolidated list. Report the stage the official source shows.
- Times: OFAC prints dates without times on most notices; the UK Sanctions List and OFSI notices often print a time
  (UK time). Quote what is printed; never add a time.

## Regimes

| Regime | Issuing body | Where |
|---|---|---|
| OFAC (US) | US Department of the Treasury, Office of Foreign Assets Control | Recent actions `https://ofac.treasury.gov/recent-actions` (one page per day, `.../recent-actions/YYYYMMDD`); SDN search `https://sanctionssearch.ofac.treas.gov`; general licences on each program's page; civil penalties `https://ofac.treasury.gov/civil-penalties-and-enforcement-information` |
| UK | Foreign, Commonwealth & Development Office (UK Sanctions List) and HM Treasury's Office of Financial Sanctions Implementation (OFSI) | `https://www.gov.uk/government/publications/the-uk-sanctions-list`; financial sanctions notices `https://www.gov.uk/government/collections/financial-sanctions-regime-specific-consolidated-lists-and-releases`; OFSI general licences `https://www.gov.uk/government/collections/ofsi-general-licences`; OFSI enforcement `https://www.gov.uk/government/collections/enforcement-of-financial-sanctions` |
| EU | Council of the EU (decisions and regulations), published in the Official Journal | Official Journal `https://eur-lex.europa.eu/oj/direct-access.html`; Council press releases `https://www.consilium.europa.eu/en/press/press-releases/` (adoption only); consolidated list via `https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions` |
| UN | UN Security Council and its sanctions committees | press releases `https://press.un.org/en/content/security-council/press-release`; consolidated list `https://main.un.org/securitycouncil/en/content/un-sc-consolidated-list` |
| Canada | Global Affairs Canada (regulations in the Canada Gazette) | `https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/` |
| Switzerland | State Secretariat for Economic Affairs (SECO) | `https://www.seco.admin.ch` sanctions news and SESAM list |
| Australia | Department of Foreign Affairs and Trade | `https://www.dfat.gov.au/international-relations/security/sanctions` and its consolidated list |

## Identifiers that decide a match

IMO number (vessels, seven digits), registration or company number with its country, tax number, date of birth,
nationality, passport number, address. Transliterated names and legal-form suffixes (FZE, FZCO, LLC, Ltd) differ often:
a different suffix or a different registration number is a `possible_match` at most.
