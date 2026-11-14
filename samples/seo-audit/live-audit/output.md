# SQLite SEO first-pass audit
Checked 14 November 2026. Scope: four public pages and two UK English Google queries.

## Bottom line
The sampled site is reachable and fast. Homepage mobile Lighthouse measured **Performance 100/100, SEO 83/100, LCP 1,260 ms and CLS 0** [S11]. The strongest immediate opportunities are missing meta descriptions and inconsistent heading structure—not a performance rebuild. Explicit canonicals are absent from all four samples, and the fallback sitemap returns 404 [S3–S6, S10]. No persistent ranking loss or penalty was established.

**Next step:** ship a small metadata and heading template update, preserving the lightweight site.

## Prioritized fixes
| Priority | Fix | Pages | Impact | Effort |
|---|---|---|---|---|
| 1 | Write unique, intent-specific meta descriptions | /, /about.html, /whentouse.html, /download.html | Medium | Low |
| 2 | Add descriptive page H1s; demote use-case sections to H2; clarify homepage title | /, /download.html, /whentouse.html | Medium | Low |
| 3 | Declare preferred absolute canonicals after verifying host policy | All four sampled pages | Medium | Low |
| 4 | Publish or locate a sitemap and advertise it in robots.txt | /sitemap.xml, /robots.txt | Medium | Medium |
| 5 | Use buttons for JavaScript-only navigation actions | / | Low | Low |
| 6 | Repair nested anchors in repeated Common Links lists | / | Low | Low |

Descriptions are missing in all four checks, independently confirmed on Home by Lighthouse [S3–S6, S11]. Suggested homepage title: `SQLite — Embedded SQL Database`; suggested H1: `SQLite: an embedded SQL database`. These are editorial proposals, not existing tags. Better descriptions may improve snippets, but Google can rewrite them and no ranking uplift is guaranteed.

Canonical work is preventive: checks returned null canonicals, Home links to index.html, and branded AI citations use www. Neither duplicate serving nor duplicate indexation was confirmed [S1, S3–S6, S8].

## Crawl and indexing checks
- **HTTPS reachable:** homepage fetch and independent page check returned 200 at https://sqlite.org/ [S1, S3]. HTTP and www redirects remain unknown.
- **Sampled paths allowed:** robots.txt blocks /cvstrac, /src, /docsrc, /cgi and /contrib, not the four sampled pages. Do not remove these exclusions without understanding their purpose [S2].
- **Sitemap warning:** robots.txt has no Sitemap directive; /sitemap.xml returned 404. A sitemap elsewhere remains possible [S2, S10].
- **Indexability:** no homepage crawlability failure was indicated by Lighthouse. Interior pages returned 200 and follow=true, but explicit noindex/header facts were not exposed, so their indexability remains unknown [S4–S6, S11]. Google-selected canonicals and actual index coverage require Search Console.
- **Navigation warning:** Lighthouse failed crawlable-anchors on JavaScript controls. Real destination links also exist, so this is not evidence that the site cannot be traversed [S1, S11].

## Sampled pages
| Page | Observed title | Tool title length | H1 count | Page-check score | Main findings |
|---|---|---:|---:|---:|---|
| https://sqlite.org/ | SQLite Home Page | 16 | 0 | 93.41 | Missing description/canonical/H1; nested-anchor parser errors [S3] |
| https://sqlite.org/about.html | About SQLite | 12 | 1 | 96.34 | Missing description/canonical [S4] |
| https://sqlite.org/whentouse.html | Appropriate Uses For SQLite | 27 | 3 | 93.78 | Missing description/canonical; three section-level H1s [S5] |
| https://sqlite.org/download.html | SQLite Download Page | 20 | 0 | 94.51 | Missing description/canonical; title uses H2 [S6] |

Titles are distinct across the sample. Short titles alone are not a reason to pad them. All four checks reported no micromarkup and returned no schema types. Structured data is a secondary opportunity, not a demonstrated blocker or promised rich result.

## Lighthouse
One simulated mobile run: **Performance 100; SEO 83; LCP 1,260 ms; CLS 0; total blocking time 0 ms** [S11]. Failed weighted SEO audits were missing meta description and non-crawlable anchors. The report also found render-blocking sqlite.css with displayed estimated savings of 170 ms, plus sponsor images without dimensions. These are low-priority refinements given the measured speed; do not trade a simple fast architecture for a higher checklist score. Lab measurements do not establish real-user Core Web Vitals.

## UK Google rankings
| Keyword | sqlite.org first-page organic result | Organic range checked | Leaders |
|---|---|---|---|
| sqlite | Not on the returned first page | 1–8 | nationalarchives.gov.uk, facebook.com, mikelatimer.ai [S8] |
| embedded database | Not on the returned first page | 1–9 | html.it, slashdot.org, appcoding.com [S9] |

The branded result is unusual: its AI overview cites https://www.sqlite.org/ despite no sqlite.org organic item in the returned list. AI citations are not organic positions. The category query also returned an Italian-language leader despite UK English settings. Treat both as snapshots and validate persistent visibility in Search Console before making major content or migration decisions. No query-level traffic, demand or ranking history was available.

## Sources and limits
[S1] Homepage fetch. [S2] robots.txt fetch. [S3–S6] Independent single-page checks for Home, About, Appropriate Uses and Download. [S7] One mobile Lighthouse call. [S8–S9] UK Google organic tool responses. [S10] Failed fallback sitemap fetch, HTTP 404. [S11] Four slices of the Lighthouse JSON report.

This was not a crawl. HTTP/www variants, /index.html behavior, full response-header index directives on interior pages, schema validation, Search Console, backlinks and field performance remain unverified.
