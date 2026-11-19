---
name: outage-watch
description: Write the weekly vendor outage brief, or, for one status-feed item, say whether it is an incident. Map each vendor to its official status page, read its incident history for the window through the status page's JSON where it has one, keep incidents with customer impact, postmortems, security incidents that forced customer action and reliability patterns, drop maintenance, blips and repeats, and give each its times per the status page, confirmed impact, root cause once published and an on-call takeaway. Use for the scheduled weekly run, for a status-feed alert, and for "did Stripe have an outage this week", "any incidents at our vendors".
---

# Outage watch

You write one brief and answer with the JSON in step 7. You read the web; you write nothing anywhere.

A run whose trigger payload is one status-feed item (the `incident-alert` trigger) reads `ALERT.md`, beside this file,
and follows it instead of the steps below. Every other run is the weekly brief.

`STATUS-PAGES.md`, beside this file, maps the common vendors to their status pages and says how to read each kind.
Read it before step 2.

## Inputs

- The `Input:` block: `vendors` (each a vendor, a product or a component; "AWS us-east-1" limits AWS to that region,
  "GitHub Actions" limits GitHub to Actions, "AWS" alone is all of it) and `lookback_days` (blank: 7).
- Run history: a scheduled run may be handed its trigger's last completed brief after its message, as a fenced json
  block under "The result of this trigger's last completed run". Its `incidents` are the **reported** list for step 5.
- The owner's corrections from earlier runs, in their words ("ignore Azure regions outside West Europe", "we don't use
  Stripe Terminal"). They win over this file where they differ.
- Today's date: from the input (the trigger's time) or the message, never the clock.
- Pages the message gives as what their URLs return are those pages: read them there, do not fetch them again, and when
  the message says the search tools are not reachable, search nothing.

## Steps

1. **Window.** `to` is today, `from` is today minus `lookback_days`; an event is in it when `from` < date <= `to`,
   comparing UTC calendar dates, not times: fired 2026-11-16, an incident that started 2026-11-09 at 22:00 is last
   week's. The
   date that counts is the incident's start, or a postmortem's publication: a postmortem published this week for an
   incident three weeks ago is new.

2. **Map each vendor to its status page.** From `STATUS-PAGES.md` or a correction, else one `web_search` (`n: 5`) for
   "<vendor> status page", keeping only the vendor's own domain or its official hosted page. An ambiguous name ("Atlas"):
   take the likeliest from the rest of the list and say so in `assumptions`. A vendor with no public status page: say so
   in `vendors_checked`, and use its engineering blog or support notices instead.

3. **Read the incident history, small.** Prefer the status page's JSON (`/api/v2/incidents.json` on Atlassian
   Statuspage, the provider's feed for the clouds) with `max_chars: 8000`; else its history page with `max_chars: 6000`
   and `offset: 1`. At most 3 fetches per vendor: the history, one incident's own page when the history lacks its times
   or updates, and a postmortem. Then for each vendor one `web_search` (`n: 5`) for a postmortem or a widely reported
   outage in the window that the status page may not show. Community sources (Downdetector, forums, social posts) are
   corroboration only, never the source of an incident.

4. **Keep what counts.** In:
   - an incident at a listed vendor (inside the entry's scope) that degraded or stopped a service customers use;
   - a postmortem or root-cause analysis published in the window;
   - a security incident that took a service down or made customers act (rotate credentials, revoke tokens);
   - a third-party outage (DNS, CDN, a cloud) that took a listed vendor down;
   - a pattern: three or more incidents on one component in the window that are each in by the rules above, or a
     changed SLA or status-page policy.
   Out: planned maintenance that ran as announced; an incident resolved within 15 minutes with no stated customer
   impact; an incident outside the entry's scope (another region, another product: "GitHub Actions" leaves out
   Codespaces and Pages); anything a correction rules out. What is out never appears in `incidents`, and never
   counts toward a pattern. An incident that started before `from` or after `to` is out, however it was found.

5. **No repeats.** Before writing any incident, look it up on the reported list by vendor, service and start date.
   Drop an incident on the reported list unless it developed: it was ongoing and is now resolved, a
   postmortem or root cause came out, its impact was restated. A kept development says what changed. Each one you drop
   goes in `dropped_repeats` in one line and nowhere else: not in `incidents`, not in the report's list.

6. **Write each incident.** Vendor, service and region exactly as the status page names them. Start and end in UTC
   with "per status page" or "per postmortem" (`time_source`); no end posted: `status` ongoing, `resolved_at` null.
   `duration_minutes` only when both ends are posted. Impact as the vendor confirmed it (error rates, features,
   regions), never inflated: a single-region degradation is not a global outage. Community reports, when you use them,
   labelled as user reports with when they were read. `root_cause`: the vendor's published cause, or null with
   `root_cause_status` `not_published` (`preliminary` when the vendor called it that). `so_what`: one line for the
   on-call ("check your failover to us-west-2", "rotate the tokens the notice names", "check your SLA for a credit"). At
   most 8 incidents, the most consequential first. SLA credits: what the vendor's notice says, and "check your own
   agreement", nothing more.

7. **Answer** with one fenced `json` block matching the output schema. `report_markdown`:

   ```
   **Outage watch** <from> to <to>
   <one line: the most consequential incident, or "No confirmed incidents at your vendors this week.">

   - **<Vendor> <service> (<region>)**: <what broke>. <start> to <end> UTC per status page (<duration>). <impact>.
     Root cause: <cause, or "not published yet">. _For your on-call:_ <so_what>. [incident](<url>)
   ...
   _Checked: <vendor (status page)>, ...  Unreachable: <page (why)>_
   ```

   A quiet week: `quiet` true, `incidents` empty, the report is the header, the quiet line and the checked line.

## Rules

- Every incident's first source URL is the vendor's own incident page or postmortem, never a status page's front page,
  a search page or an aggregator.
- Never state a number, a time or a cause the vendor's pages don't give. A blocked status page is `unreachable`, not a
  quiet vendor.
- Community posters stay anonymous: "users on r/sysadmin reported".

## Between runs

Nothing you write is kept for the next run. A scheduled run is handed the last run's answer as its run history, so what
you reported travels in your answer; what the owner tells you after a run is kept as one of their corrections.
