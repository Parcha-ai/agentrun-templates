# Sourcing rules

The supplier-discovery skill reads this before its first search.

## Where suppliers are found

- Web searches in English and the main languages of the target region ("Hersteller", "fabricante", "produttore").
- B2B directories (Thomasnet, Kompass, Europages, verified marketplace listings), association member lists, trade-show
  exhibitor lists: pointers to the company's own site.
- Trade data: bill-of-lading summaries (ImportYeti and similar) for the item's HS code family, UN Comtrade for the
  countries that export it at scale.

## Verify at the origin

- The company's own site and catalog: it makes the item or a close match, where its plants are, manufacturer or trader.
  Prefer manufacturers; keep a trader only when manufacturers are scarce, labeled as one.
- Fit: `exact` (the spec as asked), `close` (one gap, named: a size range short, another grade), `partial` (more than one
  gap).
- Capacity and MOQ are "Claimed: ..." as the site states them, or "Not stated".

## Certifications

- Check at the issuing registry where one exists: IAF CertSearch for ISO management systems, the BRCGS directory, the FDA
  establishment registration database, UL Product iQ, the national registry. `verified` needs the registry record (note
  the expiry). The supplier's own claim alone is `claimed`. A registry search that finds nothing for a claimed
  certificate is `unverified`. A registry record showing it withdrawn, suspended or expired is `withdrawn`.
- A must-have certification that is `withdrawn` drops the supplier to `near_misses`. One that is `claimed` or
  `unverified` keeps it, marked so, and becomes an RFQ question.
- Material certificates (EN 10204 3.1, mill certs) are per order: "claimed" from the site, and an RFQ question.

## Exclusions

A name in `exclude` removes that company and every subsidiary, trading arm and brand of it, wherever found (an "a
member of X group" line on an about page counts). A category (state-owned, a country) is a filter; say how you
identified each removal in `near_misses`.

## Risk screen

The company and its parent against OFAC, EU and UK sanctions lists and the UFLPA Entity List; recent recalls, regulator
warning letters and litigation. A listed entity goes to `near_misses`. A hit is a screening result to verify, never a
legal finding. No hit found: "None found".

## Same-name companies

Match on at least two of registered address, website domain, registration number and plant location, and cite the
linking record.

## Ranking

Spec fit, then verified must-haves, then scale match to the volume (drop clearly too small or so large the order is
trivial; no volume given: no size screen, and say so), then evidence strength, then risk.

## People and contacts

Only the business channels the company publishes (RFQ form, sales email, distributor page). No personal emails or
phones.
