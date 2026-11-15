## Plan
1. Check reachability, robots and sitemap discovery.
2. Inspect four key pages, run one mobile Lighthouse test and summarize backlinks.
3. Check both UK keywords and prioritize evidenced fixes.

## Bottom line
The sampled pages load successfully and the homepage is fast: mobile Lighthouse performance **100**, SEO **83**, LCP **1,260 ms** [S3–S7, S12–S14]. There is no observed homepage indexing block. The clearest actionable gaps are missing descriptions, missing primary headings and provider-reported broken backlink destinations. Start with a small metadata/heading patch; investigate broken destinations next. Neither supplied keyword included sqlite.org in the eight conventional organic results returned, but the unusual brand result also cited SQLite in an AI overview. Do not infer sustained ranking loss from this snapshot [S9–S10].

## Prioritized fixes
| Priority | Fix | Pages | Impact | Effort |
|---|---|---|---|---|
| 1 | Add unique, useful meta descriptions | /, /about.html, /docs.html, /download.html | Medium | Low |
| 2 | Add descriptive H1s; clarify homepage product title | /, /docs.html, /download.html | Medium | Low |
| 3 | Verify and recover externally linked error destinations | sqlite.org; exact URLs not supplied | Medium | Medium |
| 4 | Publish and advertise an XML sitemap | /sitemap.xml, /robots.txt | Medium | Medium |
| 5 | Declare preferred canonical URLs after confirming host policy | All four sampled pages | Low | Low |
| 6 | Use buttons for interface actions; repair nested anchors | /, /docs.html | Low | Low |
| 7 | Improve versioned static-asset caching | / and its CSS/images | Low | Medium |

Descriptions were absent on all four pages; Lighthouse independently confirms the homepage omission [S3–S6, S14]. Suggested homepage title/H1: **SQLite — A Serverless, Embedded SQL Database**. Documentation and Download already have suitable main labels, but at H2 rather than H1 [S3, S5–S6]. These changes improve clarity; neither descriptions nor H1 counts guarantee higher rankings.

For broken backlinks, first obtain destination URLs and verify current responses. Restore useful content or redirect genuinely replaced pages to close equivalents, not indiscriminately to home [S8]. Missing canonicals and a missing fallback sitemap are opportunities, not proof of duplicate indexing or failed discovery [S1–S6, S11].

## Crawl and indexing checks
- **HTTPS:** homepage returned 200, independently confirmed by the page checker. HTTP/www redirects remain unknown [S1, S3].
- **Robots:** blocks repository-related paths, not the sampled public pages. Lighthouse independently found valid robots.txt [S2, S14].
- **Sitemap:** no directive in robots.txt; /sitemap.xml returned 404. No sitemap contents or lastmod values were available [S2, S11].
- **Indexability:** homepage Lighthouse passed with no blocking directives. Other pages returned 200 and follow=true, but their explicit index/header directives were not supplied, so their indexability remains unknown [S3–S6, S14].
- **Canonicals:** none detected on the four pages. Root and an index.html home link were observed, but alias duplication was not tested [S1, S3–S6].

## Sampled pages
| Page | Title (characters) | H1 count | Description | Canonical | On-page tool score |
|---|---|---:|---|---|---:|
| / | SQLite Home Page (16) | 0 | Missing | Not detected | 93.41 |
| /about.html | About SQLite (12) | 1 | Missing | Not detected | 96.34 |
| /docs.html | SQLite Documentation (20) | 0 | Missing | Not detected | 91.95 |
| /download.html | SQLite Download Page (20) | 0 | Missing | Not detected | 94.51 |

Titles are distinct; there are no present descriptions to compare for duplication. Short title flags alone do not justify padding titles. No structured data was detected; this is not an indexing blocker and is not a priority over the observed basics [S3–S6]. Home and Documentation also have parser-reported nested anchors [S3, S5].

## Lighthouse
One simulated mobile run: performance **100/100**, SEO **83/100**, FCP **960 ms**, LCP **1,260 ms**. Numeric CLS was outside the inspected report slices and remains unknown [S7, S12–S14]. This is lab data, not field Core Web Vitals or a ranking score.

The failed SEO audits were missing description and uncrawlable Menu/Search anchors using javascript:void(0). These are interface controls; actual content links were present, so this does not show that all navigation is undiscoverable. Use buttons for actions and real links for destinations [S1, S14]. Static assets had 120-second cache lifetimes, with an estimated 81 KiB cache opportunity; render-blocking CSS had estimated savings of 170 ms. Performance work is secondary here [S13–S14].

## Links
DataForSEO returned domain rank **539/1000**, **3,797,804 backlinks**, **30,397 referring domains**, **26,346 referring main domains**, and backlinks spam score **8/100**. It also reported **4,986 broken backlinks** and **1,955 broken pages** [S8]. These are provider-index counts; the summary did not list destination URLs. No competitor comparison supports labeling the profile strong or weak, and this evidence does not warrant buying or disavowing links.

## UK Google rankings
| Keyword | SQLite conventional organic result | Leaders at ranks 1–3 |
|---|---|---|
| sqlite | Not on the first page; organic ranks 1–8 checked | infinite.education; nationalarchives.gov.uk; capterra.co.uk |
| embedded database | Not on the first page; organic ranks 1–8 checked | rxdb.info; hackernoon.com; Substack/Arpit’s Newsletter |

The brand query separately cited www.sqlite.org in its AI overview; this is not an organic position. The exact Substack publication host was not exposed. Google redirect URLs were attributed using site labels/breadcrumbs rather than treating google.com as the ranking site [S9–S10]. These results cannot establish a trend, traffic loss or its cause.

## Sources and limitations
[S1] Homepage fetch. [S2] robots.txt. [S3–S6] Individual DataForSEO page checks. [S7] Single mobile Lighthouse invocation. [S8] Backlink summary. [S9–S10] UK keyword SERPs. [S11] Failed sitemap fetch. [S12–S14] Three bounded reads of the Lighthouse JSON report.

This was a four-page first pass with no crawl, Search Console or analytics access. Homepage findings were cross-checked across independent fetch/check mechanisms where possible; secondary-page head tags, backlink counts and rankings rely on their respective provider responses. Full source locators and remaining unknowns are recorded in the structured sources and gaps.
