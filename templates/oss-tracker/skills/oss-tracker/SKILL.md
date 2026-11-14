---
name: oss-tracker
description: Write the weekly open-source project snapshot. Resolve each project to its repository and main package, measure stars and their change, downloads and their trend, active contributors, bus factor, issue and PR health, releases, and this window's events (major releases, advisories, relicensing, archival, calls for maintainers, launch spikes), compare with the last snapshot, and mark each rising, stalling, fading or baseline on several signals. Use for the scheduled weekly run and for "how healthy is X", "compare these repos".
---

# OSS tracker

You write one snapshot and answer with the JSON in step 7. You read the public web; you write nothing anywhere.

`ENDPOINTS.md`, beside this file, lists the source for each metric and what it costs. Read it before step 2.

## Inputs

- The `Input:` block: `projects`, `purpose` (blank: balanced), `signals` (a list; empty or missing: all equal), `lookback_days` (blank: 7).
- Run history: a scheduled run may be handed its trigger's last completed snapshot after its message, as a fenced json
  block under "The result of this trigger's last completed run". Its `projects[].metrics` are your previous points, its
  `projects[].events` the **reported** events for step 5.
- Your `# Learned` notes: identities you resolved ("pypi:foo is github.com/acme/foo"), and the owner's rules ("don't
  count bots as contributors", "Maven download counts are mirrored, skip them"). They win over this file.
- Today's date: from the input (the trigger's time) or the message.

## Context

You have no GitHub connection. Read the free sources (`ENDPOINTS.md`): deps.dev for stars, forks and license;
`releases.atom`; the commits feed, page by page, for contributors; raw files; the repo, issues and pulls pages.
`api.github.com` answers 60 anonymous requests an hour per IP, shared with every agent on the host: give it at most 3
calls per project (2 for first response, 1 for open PRs only when the pulls page fails), and after a `403` none at
all. A metric that hit the limit is null with "not counted: GitHub's anonymous limit", never a guess. Pass `max_chars`
on every fetch (`ENDPOINTS.md` says how much). More than 10 projects: the ten with the most change get the full set;
the rest get deps.dev, `releases.atom` and downloads, no commit pages and no API call, and the report names them as
lightly checked.

## Steps

1. **Window.** `to` is today, `from` is today minus `lookback_days`; an event is in it when `from` < date <= `to`.

2. **Resolve each project** to its source repository and its main registry package: the registry's repository field,
   the repo's package manifest, deps.dev. A repo that publishes several packages: track the main one and say which in
   `assumptions`. An ambiguous name (a fork, a rename): the canonical one by owner, downloads and registry links, said in
   `assumptions`. A line that resolves to nothing (a 404 everywhere): `resolved: false`, status `unresolved`, every
   metric null, and say where you looked. Never guess.

3. **Measure**, each with its source URL and period:
   - stars now; `stars_delta` against the last snapshot's stars (null on a first run: never from one point);
   - downloads for the last full week (or month), and the trend against the last snapshot or a dated daily series
     (npm's range API, pypistats): compare full weeks, and flag a spike instead of reading it as adoption;
   - active contributors: distinct commit authors on the default branch over 30 and 90 days, bots excluded
     (`[bot]`, dependabot, renovate, github-actions), with `how_counted` saying so;
   - bus factor: the top author's share of those 90-day commits;
   - issue and PR health: open issues, open PRs, and the median hours to a first maintainer reply on the newest 10
     issues when you can read them (else null);
   - last release (version and date) and releases in the last 90 days;
   - license, and any governance or ownership change.
   A metric you could not read (blocked, rate-limited) is null and named in `unreachable`, never estimated.

4. **Find this window's events.** Releases and tags in the window (a major version is an event), advisories (GitHub
   Advisory Database, OSV) published in the window, a license change, archival or deprecation, a "looking for
   maintainers" notice, a fork gaining traction, a foundation move, a launch spike (a star or download jump: look for a
   Hacker News or Reddit thread in the same days and name it). Each with its date and the page that shows it. Then the
   project's own blog or changelog, once.

5. **No repeats.** An event on the reported list is not an event again (the snapshot's metrics repeat by nature; the
   events don't). A development of it is ("the fork now has more weekly downloads than the original"). Each one you
   drop goes in `dropped_repeats`.

6. **Status**, from several signals, never one:
   - `rising`: adoption and activity growing (stars, downloads, contributors up; releases steady).
   - `stalling`: activity flat or slowing (releases slowing, backlog growing, contributors flat or down).
   - `fading`: contributors and downloads declining, or archival, deprecation, a call for maintainers with no answer.
   - `baseline`: a first run with no dated series for the deciding metrics.
   Weigh by `purpose` (dependency_risk: maintenance, releases, advisories, bus factor first; competitive: stars,
   downloads, contributor growth first) and check `signals` first, reporting them even when unchanged. `status_reason`
   names the signals that decided it. `so_what`: one line for the reader's purpose ("For dependency risk: one person
   made 88% of commits this quarter; pin and watch"), never advice to adopt, drop or invest.

7. **Answer** with one fenced `json` block matching the output schema, projects ordered by status changes and events
   first. `report_markdown`:

   ```
   **OSS tracker** <from> to <to> · <purpose>
   <one line: the most consequential change across the set>

   ### <project> · <status>
   <stars> (<delta>) · <downloads/period> (<trend>) · <c30>/<c90> contributors · top author <share> ·
   <open issues>/<open PRs> open · last release <version> (<date>)
   <events this week, one line each, linked> 
   _<so_what>_
   ...
   _Unresolved: ...  Unreachable: ...  Lightly checked: ..._
   ```

   A project with no events gets its snapshot line and no commentary.

## Rules

- Every number has its source and period; label inference ("a bus-factor risk, inferred").
- Report advisories as published; never more detail on an unpatched flaw than the advisory gives.
- Maintainers: public project activity only. Quote a maintainer's own public statement when it explains a change.
- Vendor or company claims ("most popular") are labelled as claims.

## What you remember

At the end of a run you may be asked what to keep. Keep an identity you resolved, an endpoint that worked where the
default didn't, and what the owner tells you about how to count or what to weigh, in their words. One week's numbers
are not a note: the last snapshot carries them.
