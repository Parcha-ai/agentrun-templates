# Matching postings

The job-watch skill reads this before every run. Edit it like code. What the person tells the agent later is kept in its
learning and wins over this file where they differ.

## Role

Match on duties, not titles alone: a different title counts when the responsibilities match. Seniority and posting type
named in the role (mid-level, internship, contract) are scope: a senior or junior posting for a mid-level search is a
near miss, not a match.

## Location

A city means onsite or hybrid there, plus remote roles open to that location. A remote role limited to countries or time
zones the person is outside ("Remote, US only") is out. Sponsorship is noted only as the posting states it.

## Filters

- `must_haves` are hard filters: a posting that fails one is a near miss naming that one criterion. A must-have the
  posting does not address (no pay listed against a pay floor) is not a pass: near miss, "not stated".
- `nice_to_haves` change the ranking only.
- No filters: match on role and location; rank by closeness of duties, recency and pay clarity.

## Where postings live

Applicant tracking systems first (boards.greenhouse.io, jobs.lever.co, jobs.ashbyhq.com, apply.workable.com,
myworkdayjobs.com, SmartRecruiters), searched with `site:` queries; then the companies' own career pages; then public
boards (general, remote, niche, government, university). A board copy is a pointer: the row links the employer's or
ATS page.

## Same posting, many places

One row per job: same employer, same title and same location on several boards is one posting, linked to the
employer's page, with the copies in `also_seen_on`. A recruiter posting for an unnamed client is "Recruiter for
undisclosed client", never guessed.

## Fresh, stale, closed

- New: the skill's step 3 rule, and only that one: posted, reopened or refreshed inside the window, with its real date.
  A posting dated before the window's start is not new.
- Shown before: only what the last run's `watched` holds: the postings shown in the last 14 days, at most 150. When an
  answer is too large to hand on whole, the next run gets its carried fields alone, the earliest shown dropped first to
  fit; a posting not in `watched` is not known, and when it is reopened or re-dated inside the window it is reported
  again.
- Stale: older than about 30 days with no refresh. Dropped.
- Closed: "no longer accepting applications", a 404 or a redirect to the jobs index. Never listed; a closed posting you
  reported before gets a line in `changes`.

## Scam signs

Upfront fees, requests for ID, passport or bank details before an interview, an employer you cannot find anywhere,
messaging-app-only contact, pay far above the role. A clear scam is not listed: it goes in `near_misses` with
"scam signs: ..." as the reason. A borderline one may be listed with `flag` set, and is never ranked first.
