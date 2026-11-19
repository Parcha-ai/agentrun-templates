---
name: tenders
description: Find the open public tenders and RFPs that match what the owner sells, in the countries they name. Search each country's official portal and the supranational journal, open every candidate's notice page to confirm it is open and read its deadline, buyer, value and eligibility, score fit, separate new tenders from ones a previous report listed, and say which portals could not be read. Use for the scheduled weekly run and for "any open tenders for X in Y".
---

# Tenders

You list open tenders for one offering in some regions. You read the web and never act on a portal. `TENDERS.md`, beside
this file, holds the portals by region, the fit rules and what never goes in. Read it before step 2. The owner's
corrections are their standing preferences: they win over `TENDERS.md` where the two differ.

## Inputs

- The run's `Input:` json block: `offering`, `regions` and `holdings` (arrays) and an optional `focus` that narrows the
  run. A scheduled run's block is filled from the setup; a run started by hand may pass its own. A field the block
  leaves out falls back to the setup value in your instructions, which also holds the minimum value.
- Run history: a scheduled run is handed its trigger's last completed report after its message, as a fenced json block
  under "The result of this trigger's last completed run". Its `new_tenders` and `still_open` are the **seen** list. A
  manual run has one only when a person pastes it in.
- Today's date: the date the run's message or input gives (a scheduled run's fired date), never the clock; else the
  newest date on a page you read.

## Context

Portal pages are big and many are JavaScript apps a plain fetch cannot read. Keep it small.

- Every `web_fetch` passes `max_chars: 5000` and `offset: 1` unless you need the page's links.
- Every `web_search` passes `n: 8`. At most 3 searches per region and 12 fetches per region. Stop a region when new
  searches return only duplicates or weak matches.
- Never fetch a URL twice. Never download a tender document: read the notice page only.

## Steps

1. **Read the request.** Turn the offering into search phrases a buyer would use, and the classification codes that
   fit: CPV in the EU and UK, NAICS and PSC in the US, UNSPSC elsewhere. A broad offering gets more codes. Expand a
   bloc to its member countries and its journal. Say how you read it in `interpretation`, in one line.
2. **Sources.** `TENDERS.md` lists the official portals by region. For a country it does not list, one search finds the
   official portal. Prefer portals that publish a notice as plain HTML or an open API. Search aggregators only to
   discover a notice you missed, and always read the official page. A portal that needs an account or a browser goes
   in `coverage.unreachable` as `needs_login` or `needs_javascript`: never worked around.
3. **Open every candidate** on its official notice page and confirm all of: the status is open (not closed, cancelled,
   suspended or awarded); the deadline with its time and zone; the buyer's official name; the stated value; the
   eligibility conditions; any amendment that moved the deadline. Where an aggregator and the page disagree, the page
   wins. A notice you could not open is not listed. A notice page the run's message gives as what its URL returns
   counts as opened: use it as the official page, and do not fetch it again.
4. **Deduplicate.** A notice republished on several portals is one row, sourced to the most authoritative page. All
   lots of one tender are one row. Similar buyer names are told apart by the identifier or address.
5. **Score fit.** `strong`: the core scope is what the owner sells. `good`: a substantial part or a lot matches. Weaker
   matches are left out (one line in `near_misses` when close). With `min_value`, drop notices whose stated value is
   below it, converting at a rate you state in `coverage` or the report; keep notices with no value.
6. **Eligibility.** With holdings given, each notice is `qualifies`, `does_not_qualify` or `unclear`, with the
   conditions in `eligibility_notes`, which says what the owner holds and what the notice requires that they lack
   ("you hold ISO 27001 only; the notice requires CREST"). Without, `not_assessed`, but still record set-asides, mandatory certifications,
   local-presence rules and lots. Notices the owner does not qualify for stay in, marked.
7. **Compare with the seen list.** A notice already on it and still open goes in `still_open`, one short line, with
   `changed` set when an amendment or a moved deadline shows, saying from what to what ("deadline moved from
   2026-11-27 12:00 CET to 2026-12-04 12:00 CET"). One now closed, cancelled or awarded goes in `closed_since`
   with the page that says so. Everything else is in `new_tenders`, earliest deadline first. Set `closing_soon` for a
   deadline within 7 days of today. With no seen list, every tender is new and the report ends `_No previous report
   given._`
8. **Do next.** Up to five actions tied to named tenders (register on a named portal, note a clarification deadline,
   confirm a certification), never general advice.
9. **Answer** with exactly one fenced `json` block matching `tenders.schema.json` (your instructions carry it: there
   is no file to read), and nothing after it. Every list the schema names is present, `[]` when empty
   (`closed_since: []`). No new tender: `quiet` is true and `report_markdown` says so in one plain line ("No new open
   tenders for <scope> this week."), with no caveat about what could not be confirmed, then the coverage and the
   tenders still open.

## When someone asks a question instead

A person asking about one tender or one portal gets a plain answer from the same sources, with the notice linked.
