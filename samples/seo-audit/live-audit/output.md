## Plan and scope
1. Check homepage reachability, robots and sitemap discovery.
2. Sample four key pages, run one mobile Lighthouse audit, and collect link and UK keyword data.
3. Check the two requested Google queries and prioritize supported fixes.

## Bottom line
SQLite's homepage is reachable and fast: mobile Lighthouse performance **100**, SEO **83**, LCP **1,260 ms** [S1, S3, S13, S14]. There is no demonstrated sitewide crawl block. The clearest first-pass opportunities are homepage presentation, preferred-URL signals and externally linked error destinations. Three secondary-page checks failed, limiting conclusions.

**Next step:** ship the homepage title, description and H1 update, then investigate broken backlink destinations. Do not treat the lab SEO score as an overall ranking score.

## Prioritized fixes
| Priority | Fix | Pages | Impact | Effort |
|---|---|---|---|---|
| 1 | Replace generic title; add a useful description and one descriptive H1 [S3] | / | Medium | Low |
| 2 | Export and verify broken backlink destinations; redirect only to equivalent replacements [S8] | Affected URLs not supplied | Medium | Medium |
| 3 | Add homepage canonical; verify alternate URLs before consolidation [S1, S3] | / | Medium | Low |
| 4 | Make embedded-database intent clearer in the existing use-case introduction [S11, S15] | /whentouse.html, / | Medium | Medium |
| 5 | Locate or publish an XML sitemap and advertise it in robots.txt [S2, S12] | /robots.txt, /sitemap.xml | Low | Low |
| 6 | Repair nested anchors and mismatched end tags [S3] | / | Low | Low |

Suggested homepage title: **SQLite — Embedded, Serverless SQL Database Engine**. Suggested H1: **SQLite: an embedded SQL database engine**. Draft description: **SQLite is a self-contained, serverless SQL database engine for applications and devices. Explore documentation, downloads and guidance on when to use SQLite.** These are proposed copy, not observed tags.

## Crawl and indexing
- HTTPS homepage returned 200 in two independent mechanisms [S1, S3]. HTTP and www redirect behavior remain unknown.
- robots.txt blocks repository-related prefixes, not the sampled public documentation pages [S2]. Do not remove these blocks without understanding their purpose.
- No sitemap is advertised in robots.txt; /sitemap.xml returned 404. Another sitemap may exist elsewhere [S2, S12].
- Homepage canonical is absent in the returned metadata; navigation points Home to index.html. Duplicate content or duplicate indexation was not proven [S1, S3].
- Full homepage indexability remains unknown because explicit noindex and HTTP robot-header values were not returned [S3].

## Sampled pages
- **/**: title `SQLite Home Page`; tool-reported title length 16; missing description; zero H1s; canonical null; no micromarkup detected. Tool on-page score **93.41**. Nested anchor errors at lines 127 and 186 [S3]. The direct fetch corroborates the title and section-only headings [S1].
- **/about.html**: provider page check failed with HTTP 400; tags and indexability unknown [S4].
- **/docs.html**: provider page check failed with HTTP 502; this is not proof of a website 502 [S5].
- **/whentouse.html**: provider check failed with HTTP 400 [S6]. A separate text fetch returned 200, title `Appropriate Uses For SQLite`, client/server comparisons and an embedded-devices section. Head metadata and complete heading count remain unknown [S15].
- Cross-page duplicate titles and descriptions could not be evaluated. No structured-data ranking penalty is inferred from its absence on the homepage.

## Lighthouse
One simulated mobile run: **performance 100/100**, **SEO 83/100**, **LCP 1,260 ms**, **FCP 960 ms** [S7, S13, S14]. CLS was not read. The report identifies sqlite.css as render-blocking with displayed estimated savings of 160 ms [S14]. Given the fast LCP, speed tuning is lower priority than the observed content and link issues. Individual failing SEO audit results were not read; the 83 score is not attributed to a guessed cause. These are lab results, not real-user Core Web Vitals.

## Links
DataForSEO reports **3,797,804 backlinks**, **30,397 referring domains**, **26,346 referring main domains**, domain rank **539/1000**, and backlink spam score **8/100** [S8]. There is no competitor benchmark. It also reports **4,986 broken backlinks** and **1,955 broken pages**. Obtain destination URLs and verify them before choosing redirects; the summary did not supply those URLs.

## UK keyword footprint
DataForSEO estimates **535** Google top-100 keywords: **48** at position 1, **21** at positions 2–3, **88** at positions 4–10 and **122** at positions 11–20. Modeled monthly organic visits: **1,775.03**, not measured traffic. New keywords: **308**; lost: **309**. That small difference does not demonstrate sustained decline [S9].

## UK Google rankings
| Keyword | Best organic position | Observed page or scope | Leaders 1–3 |
|---|---|---|---|
| sqlite | 2 | SQLite WASM documentation; organic ranks 1–8 checked [S10] | wiki.archlinux.org; sqlite.org; reddit.com |
| embedded database | Not on first page | Organic ranks 1–9 checked [S11] | html.it; slashdot.org; appcoding.com |

These are single desktop snapshots. Google redirect links were identified using website names and breadcrumbs, not incorrectly classified as google.com ranking pages. SQLite's homepage was referenced in the returned AI overview for the brand query, but that is not an organic homepage ranking [S10].

## Sources and limitations
[S1] Homepage direct fetch. [S2] robots.txt. [S3] Homepage on-page check. [S4–S6] Failed secondary-page checks. [S7] Mobile Lighthouse execution. [S8] Backlink summary. [S9] UK domain keyword overview. [S10–S11] UK Google results. [S12] Default sitemap 404. [S13–S14] Lighthouse report slices. [S15] Use-cases page text.

Homepage availability, title and heading findings were cross-checked through independent mechanisms. Rankings and domain estimates were not independently replicated. No Search Console, analytics, full crawl, forms or logins were used.
