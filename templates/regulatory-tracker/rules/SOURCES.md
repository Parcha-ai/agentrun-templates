# Official sources and stages

The tracker reads this before every brief. Edit it like code. What the owner tells the agent later is kept in its
learning and wins over this file where they differ.

## Stages (say exactly one)

| stage | means | never call it |
|---|---|---|
| bill_introduced | a bill filed in a legislature | law |
| bill_progress | a bill passed a chamber, a committee, or reached a trilogue or Council position | law, final |
| proposed | a proposed rule, draft regulation or draft delegated act open or published for comment | final, in force |
| consultation_open | a consultation or call for evidence with a deadline | a rule |
| final | a final rule or adopted act published, not yet in force | in force |
| in_force | a rule or act whose effective date fell inside the window | |
| guidance | guidance, FAQs, Q&As, opinions, supervisory statements | binding law, unless it says so |
| enforcement | a fine, order or settlement by an authority | |
| ruling | a court or tribunal judgment | |
| signal | a speech, letter, leak, roadmap or reported intention | an obligation |

Dates carry their meaning: published, adopted, comment_deadline, effective, compliance, hearing, appeal_deadline,
delivered (a speech). A document that gives a phased date ("compliance for risk assessments by January 1, 2028")
gets one date per phase with a note.

## Where official documents are

**United States (federal)**
- Federal Register: `https://www.federalregister.gov/api/v1/documents.json?conditions[term]=<words>&conditions[publication_date][gte]=<YYYY-MM-DD>&order=newest`
  (JSON; each document has `type` Proposed Rule / Rule / Notice, `publication_date`, `effective_on`,
  `comments_close_on`, `html_url`). The document's `html_url` is the source.
- Dockets: regulations.gov. Codified text: ecfr.gov. Bills: congress.gov.
- Agency newsrooms: ftc.gov/news-events/news/press-releases, sec.gov/newsroom, consumerfinance.gov/about-us/newsroom,
  hhs.gov/ocr, and the agency the topic names.

**US states**: the state register or administrative code site; the agency's own rulemaking page (for privacy in
California: cppa.ca.gov/regulations); the legislature's bill search (leginfo.legislature.ca.gov); the attorney
general's press page.

**European Union**
- EUR-Lex Official Journal and procedure pages: `https://eur-lex.europa.eu/oj/direct-access.html`; a CELEX number names
  each act.
- Commission "Have your say": `https://ec.europa.eu/info/law/better-regulation/have-your-say/initiatives` (feedback
  periods with dates).
- Commission press corner, Council press releases (consilium.europa.eu/en/press), Parliament Legislative Observatory
  (oeil.secure.europarl.europa.eu), and the agencies and boards the topic names (EDPB, ESMA, EBA, EFRAG).
- A member state's acts bind there only; EU acts bind every member state.

**United Kingdom**
- legislation.gov.uk new legislation feed: `https://www.legislation.gov.uk/new/data.feed`.
- gov.uk search API: `https://www.gov.uk/api/search.json?q=<words>&order=-public_timestamp&count=20` (each result has
  `public_timestamp`, `link`, `format`: consultation_outcome, open_consultation, guidance, policy_paper, press_release).
- Bills: bills.parliament.uk. Regulators: ico.org.uk, fca.org.uk, cma.gov.uk.

**Elsewhere**: the national gazette, the regulator's own newsroom and consultation page, and the legislature's bill
tracker.

## Not sources of an item

News stories, law-firm alerts, trade press, newsletters, vendor blogs, social posts. They find candidates. An item
whose official document you cannot open goes in `unconfirmed_leads`, attributed to whoever reported it, or nowhere.
