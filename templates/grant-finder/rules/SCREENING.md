# Screening programs and calls

The grant-finder skill reads this before its first search.

## Where to look, by applicant

- **Students**: university financial-aid offices, national scholarship schemes, foundations and societies in the field.
- **Researchers**: research councils and agencies (NIH, NSF, UKRI, ERC and Horizon Europe, DFG, ARC), foundations, society
  fellowships.
- **Artists, filmmakers, writers**: arts councils, film and media funds, residencies, festival and exhibition calls
  (organizers' own pages; FilmFreeway, CaFE and similar only as pointers).
- **Nonprofits**: government grant portals (Grants.gov and state agencies), community and private foundations.
- **Companies and founders**: innovation agencies (SBIR/STTR, Innovate UK, EIC), tax credits from the tax authority's page,
  regional development agencies, development banks; pitch competitions and accelerators from the organizer's page.
- **Speakers and researchers with a paper**: the conference's own CFP page; WikiCFP, Sessionize and similar as pointers.

Location picks jurisdictions: city, region or state, nation, then supranational bodies the applicant belongs to, then
programs abroad that accept applicants from there.

## Keep, drop, near miss

- **Keep**: the current edition's own page shows it open (or rolling), with a deadline, and the applicant may apply.
- **Drop** (one line in `near_misses` when it is close): past deadline; a round "to be announced"; only a prior year's page;
  an aggregator listing with no funder page; outside a hard limit.
- **Never list**: a scheme that charges a fee to "unlock" or "process" a grant, guarantees an award, or traces to no
  real funder. Say why in `near_misses` and tell the applicant not to pay it: real funders do not charge to award.
- A rule that is unclear against a hard limit (a fee not stated when the applicant set a fee cap): near miss, with the
  question to ask.

## Eligibility match

On the single deciding criterion:
- `met`: the inputs clearly satisfy it.
- `likely`: the inputs probably satisfy it.
- `check`: it hinges on a fact the inputs do not give (a budget size, a degree level); name the fact in
  `open_questions`.

## Ranking

By match (met, likely, check), then by value, then by nearest deadline. A deadline within 14 days moves up within its
match group. Effort: low (short form or automatic claim), medium (proposal plus documents), high (multi-stage, consortium
or audited claim).

## Same-name programs

Match on funder, jurisdiction, edition year and reference number. Use only the current edition.
