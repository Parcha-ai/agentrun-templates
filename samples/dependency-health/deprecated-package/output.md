## Bottom line: avoid

**Package:** npm `request` — resolved to registry `request`, latest/default version **2.88.2** (published 2020-02-11), repository [request/request](https://github.com/request/request) [S1, S2, S3].

`request` is a retired library. It is deprecated on npm, its own README declares it "fully deprecated" as of Feb 11th 2020, its last release was more than six years ago, and its final version still carries an unfixed moderate SSRF advisory with **no patched version**. Adopting it now means adopting an unmaintained dependency with a known unresolved security defect. Keep it only where it already sits while you migrate, and do not add it to new code.

### Snapshot

| | |
|---|---|
| Latest version / date | 2.88.2 / 2020-02-11 [S2] |
| Registry deprecation | "request has been deprecated, see https://github.com/request/request/issues/3142" [S1] |
| License | Apache-2.0 (registry, deps.dev, Scorecard agree) [S1, S3, S15] |
| Downloads | 13,611,429 last week; 53,365,730 last month [S6, S7] |
| Dependents | not read (see gaps) |
| Stars / forks | 25,480 / 3,135 [S4] |
| Open issues / PRs | 145 (REST `open_issues_count`, includes PRs) / 25 [S5, S8] |
| OSSF Scorecard | 3.6 (2026-11-02) [S15] |
| Open advisories on 2.88.2 | 1 [S3, S13] |

## Maintenance and bus factor

- **Releases:** 0 in the last 12 months, 0 in the last 24 months. The most recent publishes are 2.88.2 (2020-02-11), 2.88.0 (2018-08-10) and 2.87.0 (2018-05-21) [S2]. The longest gap could not be computed without the complete dated list, so it is left null.
- **Archived?** No — the repository is still public and not archived (`archived: false`, default branch `master`) [S5]. GitHub's last push was 2024-08-14 [S5].
- **Retirement statement:** issue #3142 "Request's Past, Present and Future", opened by maintainer mikeal on 2019-03-30, put the project in maintenance mode: "request will stop accepting new features… stop considering breaking changes… Releases will be fully automated" [S10]. The README repeats the deprecation [S9].
- **Committers:** not counted. GitHub's commits Atom feed was refused by the fetch tool ("application/atom+xml is not text"), so there is no 12-month committer count or top-committer share in this report. This is a gap, not a finding that nobody commits. Scorecard's own signal is unambiguous though: the **Maintained** check scores **0** with "0 commit(s) and 0 issue activity found in the last 90 days" [S15].
- **Backing:** a community org (GitHub org `request`), with npm listing four maintainers (fredkschott, mikeal, nylen, simov) [S1]. No company or foundation is named in what I read.

## Issues and pull requests

- 120 open issues and 25 open PRs shown on the repo page [S8]; the API's `open_issues_count` of 145 counts PRs too [S5].
- Oldest open issue in the oldest-first listing: **#1298**, opened **2014-12-02** — twelve years old [S11]. Others from 2015–2016 remain open and labelled "Up for consideration".
- Reply behaviour on recent issues was not measured; the #3142 announcement explicitly says fixes will be merged "no promises though" [S10].

## Security

### Advisories

| ID | Severity | What it allows | Affected | Fixed | Published | Affects 2.88.2? |
|---|---|---|---|---|---|---|
| GHSA-p8p7-x288-28g6 / CVE-2023-28155 | CVSS 6.1 Moderate (GitHub) [S12, S13] | SSRF-mitigation bypass via a cross-protocol redirect (HTTP↔HTTPS) [S13] | request <= 2.88.2 | **None** [S13, S14] | 2023-03-16 [S13, S14] | **yes** [S14] |
| GHSA-7xfp-9c55-5vqj / CVE-2017-16026 | CVSS 5.9 Moderate (GitHub) [S16] | Local memory exposure via a numeric multipart body [S16] | >=2.2.6, <2.68.0 | 2.68.0 [S16, S17] | 2018-11-09 [S16] | no |

The SSRF advisory is the one that matters: the GitHub Advisory Database records the `request` package as affected through 2.88.2 with **no patched version**, and adds "NOTE: The `request` package is no longer supported by the maintainer" [S13]. The fix landed only in the Cypress fork, `@cypress/request` 3.0.0 [S13, S14]. If you depend on `request` only transitively (many tools still do, `got` lists it as a devDependency [S18]), the mitigation is at your own trust boundary, not in the package.

### Practices

- **Security policy:** none — Scorecard Security-Policy 0, "security policy file not detected" [S15].
- **Scorecard 3.6** (2026-11-02): Maintained 0, Fuzzing 0, SAST 0, CII-Best-Practices 0, Code-Review 7, Binary-Artifacts 10, License 10; Packaging, Pinned-Dependencies and Signed-Releases returned "not applicable / no releases found" [S15].
- **Provenance:** none — deps.dev shows no SLSA provenance and no attestations for 2.88.2 [S3]; npm signing existed at publish time (the registry's PGP signature) but no provenance attestation [S1].
- **Compromise history:** none found in the sources read (absence of evidence, not proof).

## License

Apache License 2.0, confirmed by the LICENSE file text [S31] and agreeing across npm, deps.dev and Scorecard [S1, S3, S15]. No relicensing was found in the material read; the README and LICENSE are consistent with the published metadata. Apache-2.0 is permissive and imposes notice/attribution duties and an express patent grant. No policy list was supplied for this run, so `policy_conflict` is null. This is not legal advice: counsel should confirm notice obligations if you redistribute.

## Breaking changes

No major version has been published in the last three years (indeed, none since 2.x began) — the project is frozen by design [S2, S10]. There is nothing to upgrade to inside the package, so the meaningful migration is off it: `request`'s own issue #3143 collects alternatives including node-fetch, got, axios, superagent and bent [S30]. API differences to expect: callbacks and streams give way to promises/fetch semantics, and `request.defaults`/convenience-method patterns need rewriting.

## Alternatives

These are the ones named first by the project's own alternatives issue [S30] and by download volume; each figure was read fresh today.

| Package | Last release | License | Downloads (last week) | Advisories on current version | Tradeoff |
|---|---|---|---|---|---|
| **got** | 16.2.0, 2026-10-30 [S19] | MIT [S19] | 50,595,497 [S20] | 0 [S19] | Actively developed, rich API; API surface differs a lot and recent majors are ESM-oriented, so expect real rewrite work. The GitHub advisory listing shows 1 older reviewed advisory against got history [S21]. |
| **axios** | 1.21.1, 2026-11-09 [S23] | MIT [S23] | 141,449,384 [S24] | 0 [S23] | Most popular and browser+node; ships verified SLSA provenance [S22, S23]. Long advisory history (66 reviewed advisories listed) means you must track updates [S25]. |
| **node-fetch** | 3.3.2, 2023-07-25 [S27] | MIT [S27] | 274,853,021 [S28] | 0 [S27] | Smallest conceptual jump (fetch API) and the lightest dependency; last stable release is from 2023 and 4.x has only betas [S27], so expect slower movement. 3 reviewed advisories historically [S29]. |

## Risks and what could not be verified

1. **Unfixed SSRF advisory** on the only version you can install — no patch exists for `request` itself [S13].
2. **Project is retired**, not merely quiet: deprecation notice, README statement, and maintenance-mode issue [S1, S9, S10].
3. **No security response process:** no SECURITY.md, Scorecard Security-Policy 0 [S15].
4. **Very high install footprint** (13.6M/week) means much of the exposure is transitive through older tooling; expect difficulty removing it from some dependency trees.
5. **Not verified in this run:** 12-month committer count and top-committer share (GitHub Atom feeds refused by the fetch tool); dependent-package count (no source read gave a current number); exact age/reply latency of the newest issues. These are gaps, not zeros.

## Sources (all read 2026-11-14)

- S1 https://registry.npmjs.org/request/latest
- S2 https://api.deps.dev/v3/systems/npm/packages/request
- S3 https://api.deps.dev/v3/systems/npm/packages/request/versions/2.88.2
- S4 https://api.deps.dev/v3/projects/github.com%2Frequest%2Frequest
- S5 https://api.github.com/repos/request/request
- S6 https://api.npmjs.org/downloads/point/last-week/request
- S7 https://api.npmjs.org/downloads/point/last-month/request
- S8 https://github.com/request/request
- S9 https://raw.githubusercontent.com/request/request/HEAD/README.md
- S10 https://github.com/request/request/issues/3142
- S11 https://github.com/request/request/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-asc
- S12 https://api.deps.dev/v3/advisories/GHSA-p8p7-x288-28g6
- S13 https://github.com/advisories/GHSA-p8p7-x288-28g6
- S14 https://api.osv.dev/v1/vulns/GHSA-p8p7-x288-28g6
- S15 https://api.securityscorecards.dev/projects/github.com/request/request
- S16 https://github.com/advisories/GHSA-7xfp-9c55-5vqj
- S17 https://api.osv.dev/v1/vulns/GHSA-7xfp-9c55-5vqj
- S18 https://registry.npmjs.org/got/latest
- S19 https://api.deps.dev/v3/systems/npm/packages/got/versions/16.2.0
- S20 https://api.npmjs.org/downloads/point/last-week/got
- S21 https://github.com/advisories?query=type%3Areviewed+ecosystem%3Anpm+affects%3Agot
- S22 https://registry.npmjs.org/axios/latest
- S23 https://api.deps.dev/v3/systems/npm/packages/axios/versions/1.21.1
- S24 https://api.npmjs.org/downloads/point/last-week/axios
- S25 https://github.com/advisories?query=type%3Areviewed+ecosystem%3Anpm+affects%3Aaxios
- S26 https://registry.npmjs.org/node-fetch/latest
- S27 https://api.deps.dev/v3/systems/npm/packages/node-fetch/versions/3.3.2
- S28 https://api.npmjs.org/downloads/point/last-week/node-fetch
- S29 https://github.com/advisories?query=type%3Areviewed+ecosystem%3Anpm+affects%3Anode-fetch
- S30 https://github.com/request/request/issues/3143
- S31 https://raw.githubusercontent.com/request/request/HEAD/LICENSE
