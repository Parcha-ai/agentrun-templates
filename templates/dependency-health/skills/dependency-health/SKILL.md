---
name: dependency-health
description: Health-check one open-source dependency. Resolve the package to its registry entry and repository, then measure releases, maintainers and bus factor, issues, advisories with affected and fixed versions, security practices, license and its history, adoption, breaking changes and alternatives, each from its primary source with the date read, and give a verdict. Use for "is X safe to use", "should we adopt X", "check this dependency", "is v5 safe to upgrade to".
---

# Dependency health

You check one package and answer with the JSON in step 10. You read the web, GitHub's public API included.
You never install or run anything.

`SOURCES.md`, beside this file, lists the endpoints for each fact, per ecosystem. Use its JSON APIs before HTML pages:
they are smaller and carry dates.

## Context

Everything a tool returns stays in your context. A registry document for a popular package can be megabytes. So:
- Every `web_fetch` passes `max_chars` (4000 for an API answer, 6000 for a README or changelog), and reads on with
  `offset` only when the fact you need is further down.
- Never fetch a whole registry document when a narrower endpoint exists (`/latest`, a version endpoint, deps.dev).
- `web_search` passes `n: 5`. Use it to find a page, never as the source of a number.
- You have no GitHub connection. Read GitHub's free sources first (`releases.atom`, the commits feed, raw files, the
  issues page: `SOURCES.md`); `api.github.com` answers 60 anonymous requests an hour for the whole run, so give it at
  most 4 calls for the package and its alternatives together, and name what the limit cost you in `gaps`.
- About 30 calls for the package itself; 3 to 4 per alternative.

## Steps

1. **Resolve.** Find the registry entry and the repository, and check that each points to the other (the registry's
   repository field; the repo's README or package manifest names the package). A name in several ecosystems or matching
   several projects ("yaml", "requests"): take the input's `ecosystem` if given, else the likeliest by downloads and how
   exactly the name matches. Write your choice and the others you set aside in `resolved`. A renamed, forked or moved
   project: follow it to the current one and record the history. A lookalike of a popular name (one letter off, an
   extra word, a new publisher) is a typosquat risk: say so and check the popular one's name against it. Nothing found
   on any registry or forge: `resolved.found` is false, verdict `unresolved`, and stop after recording where you looked.

2. **Releases.** From the registry's version list and the repo's releases or tags: latest stable version and date,
   releases in the last 12 and 24 months, the longest gap between releases in the last 24 months, any yanked or
   deprecated versions. A deprecation message on the registry or an archived repository is a headline fact. Check
   endoflife.date for support windows when the project is listed.

3. **Maintainers and bus factor.** From the repo's commits on the default branch over the last 12 months, bots
   excluded: how many people committed, and the top committer's share. Say how you counted ("commits on main since
   2025-11-14, bots excluded"). Then: is it backed by a company, a foundation, or one person; is there a GOVERNANCE file,
   Open Collective or GitHub Sponsors. Public project activity only: nothing about a maintainer's life, health or job.

4. **Issues and pull requests.** Open issues and open PRs (the repo API's `open_issues_count` counts both: say so if
   that is all you have), the oldest open issue's age, and whether recent issues get a maintainer reply. One search
   (`is:issue is:open sort:created-asc`) beats paging the tracker.

5. **Security.** Advisories from deps.dev's version endpoint (its advisory keys), OSV and the GitHub Advisory Database:
   for each, its id (GHSA and CVE when both exist), severity with its source ("CVSS 7.5 (GitHub)"), what it allows in
   one line, affected range, fixed version, and the published date. With an input `version`, mark each as `affects` or
   not for that version. Then the practices: SECURITY.md, OpenSSF Scorecard score (and its date), signed releases or
   provenance, and any past compromise or malicious release. Never describe how to exploit anything.

6. **License.** The LICENSE file and the registry's license field, as SPDX ids; say if they disagree. Look for a license
   change (release notes, a LICENSE commit, an announcement) and a CLA. Compare with the license policy in your
   instructions: a match is `policy_conflict: true`. For copyleft, source-available or non-standard licenses, say what
   to check for commercial distribution and that counsel should review it. Not legal advice.

7. **Adoption.** Downloads from the registry's stats (with the period: "last week", "last month"), dependents from
   deps.dev or the registry, and well-known dependents only when a page you read names them.

8. **Breaking changes.** Major versions in the last 3 years, whether it follows semver, and any migration guide. With a
   `concern` about an upgrade, read that version's changelog and list what breaks.

9. **Alternatives** (unless the input turns them off). Two to four credible ones for the same job: the ones the
   project's own docs or a well-known comparison names first. For each, steps 2, 5, 6 and 7 in brief: last release,
   license, downloads, open advisories, and the tradeoff in one line.

10. **Verdict and answer.** Pick one:
    - `adopt`: maintained (a release in the last 12 months or a stable project with a stated reason it needs none), no
      unfixed high or critical advisory in the version in question, a license without a policy conflict, more than one
      active maintainer or an organization behind it.
    - `adopt_with_caution`: usable, with a named risk you can manage (one maintainer, slow security fixes, a license to
      review, an affected version with a fix available).
    - `keep_but_plan_exit`: fine for now where it is, but it is slowing or stopped (no release in 24 months, archived
      with no known flaw, maintainers asking for help) or a license change is coming.
    - `avoid`: deprecated, archived with known flaws, an unfixed high or critical advisory, a compromised release, or a
      policy conflict.
    - `unresolved`: the package could not be found or told apart.
    Give three to five reasons, each resting on a fact above. With a `concern`, answer it in the first reason.
    Then answer with one fenced `json` block matching the output schema. `report_markdown` holds, in order: bottom line
    (verdict and reasons, the identity you resolved), a snapshot table, maintenance and bus factor, issues, security
    (an advisory table and practices), license, breaking changes, alternatives (a table), risks and what you could not
    verify, and sources with the date each was read.

## Rules

- An event's date (a release, a fix) is never the date a page was published or read. Give each.
- Two sources disagree: report both and which you trust (the registry and the vendor's advisory win over aggregators).
- Label inference as inference ("one person made 91% of commits: a bus-factor risk, inferred").
- A number you could not get is null in the JSON and named in `gaps`, never estimated.
