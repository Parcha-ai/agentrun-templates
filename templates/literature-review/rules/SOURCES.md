# Open scholarly indexes, and how to query them

All are free to read. Use `web_fetch` on the URL; replace `<terms>` with URL-encoded words. Read only the fields you need
and set `max_chars` small. When an index is unreachable, record `accessible: false` and move on.

## Existing syntheses

| Index | Use |
|---|---|
| Cochrane Library, cochranelibrary.com | Systematic reviews of health interventions; abstracts and plain-language summaries are open |
| Campbell Collaboration, campbellcollaboration.org | Social-science systematic reviews |
| PROSPERO, crd.york.ac.uk/prospero | Registered review protocols: shows reviews in progress |
| Epistemonikos, epistemonikos.org | Database of systematic reviews and the trials they include |
| What Works Clearinghouse (ies.ed.gov/ncee/wwc), EEF Toolkit, JBI | Education and nursing evidence libraries |

## Primary literature

| Index | Query URL |
|---|---|
| Crossref | `https://api.crossref.org/works?query.bibliographic=<terms>&filter=from-pub-date:2011&rows=20&select=DOI,title,author,issued,container-title,type` |
| Crossref, one paper | `https://api.crossref.org/works/<doi>` (look at `updated-by` for corrections and retractions) |
| Semantic Scholar | `https://api.semanticscholar.org/graph/v1/paper/search?query=<terms>&limit=20&fields=title,year,authors,externalIds,venue,openAccessPdf,publicationTypes` |
| Semantic Scholar, citations | `https://api.semanticscholar.org/graph/v1/paper/<id>/citations?fields=title,year,externalIds&limit=50` (also `/references`) |
| OpenAlex | `https://api.openalex.org/works?search=<terms>&per-page=20` |
| PubMed search | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=<terms>&retmax=20&retmode=json` |
| PubMed record | `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=<pmid>&rettype=abstract&retmode=text` |
| Europe PMC | `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=<terms>&format=json&resultType=core&pageSize=20` |
| arXiv | `http://export.arxiv.org/api/query?search_query=all:<terms>&max_results=20` |
| ERIC (education) | `https://api.ies.ed.gov/eric/?search=<terms>&format=json&rows=20` |
| SSRN, NBER, RePEc/IDEAS | Search on their sites; working papers are preprints |
| DOI landing page | `https://doi.org/<doi>` |

## Registries and grey literature

| Source | Use |
|---|---|
| ClinicalTrials.gov, `https://clinicaltrials.gov/api/v2/studies?query.term=<terms>&pageSize=20` | Registered trials, outcomes, results |
| WHO ICTRP, AEA RCT Registry, OSF, EGAP | Trials registered outside the US |
| 3ie, J-PAL, World Bank and OECD repositories, government evaluation offices | Evaluations and grey literature |

## Retractions and corrections

Check three places for each paper you cite: the Crossref record's `updated-by`, the publisher page for a notice, and a
search for `"<title>" retraction`. A retracted paper is flagged `retracted` and never supports a finding.

## Reading well

- Open the paper, not the snippet. Full text in Europe PMC (open access) or on a preprint server is fine.
- A paywalled paper seen only as an abstract is `abstract_only`.
- Distinguish the paper's publication date from the trial's dates when they differ.
- Two papers with similar titles are two papers. Confirm by DOI.
