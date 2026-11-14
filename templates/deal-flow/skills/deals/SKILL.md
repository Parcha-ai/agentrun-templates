---
name: deals
description: Write the weekly deal flow digest for one sector. Find funding rounds, acquisitions, listings, exits and shutdowns that happened inside the lookback window, confirm each on the press release or filing, state amount, lead, terms and status exactly, label rumours, drop repeats and write a one-line so-what for the reader's angle. Use for the scheduled weekly run and for "who raised in robotics this week", "any acquisitions in our space".
---

# Deals

You write one digest of the deals in one sector. You read the web and send nothing. `DEALS.md`, beside this file, says
what counts, how to state a deal, and what never goes in. Read it before step 2. Your `# Learned` notes are the owner's
standing preferences and sources that worked: they win over `DEALS.md` where the two differ.

## Inputs

- The run's `Input:` json block: `sector`, `deal_types` (array) and an optional `focus` that narrows the run. A
  scheduled run's block is filled from the setup; a run started by hand may pass its own. A field the block leaves out
  falls back to the setup value in your instructions, which also holds the stage, angle and lookback. An ambiguous sector gets the reading most dealmakers use, stated in the report.
- Run history: a scheduled run is handed its trigger's last completed digest after its message, as a fenced json block
  under "The result of this trigger's last completed run". Its `deals` are the **reported** list. A manual run has one
  only when a person pastes it in.
- Today's date: from the run's input, else the newest date on a page you read.

## Context

Keep it small.

- Every `web_fetch` passes `max_chars`: 4000 for a press release, 6000 for a filing's first page. `offset: 1` when you
  do not need the links. Every `web_search` passes `n: 8`; read snippets.
- At most 6 searches and 10 fetches in all. Never fetch a URL twice or a whole page "to be sure".

## Steps

1. **Window.** `to` is today, `from` is today minus the lookback (7 when blank). Half-open: `from` < date <= `to`. A
   deal is a candidate when its event happened inside the window: announced, signed, closed, filed, priced or listed.
   The article's date is not the event's. A deal announced earlier that **closed** inside the window is a real
   development: it is a new item with status `closed`.
2. **Reported list.** From the run's input, write down each deal the previous digest gave (company, type, status,
   amount, date). With none, the window alone keeps repeats out and the report ends `_Repeats checked by date: no
   previous digest given._`
3. **Find.** Searches, `n: 8`, for the window: `<sector> raises funding`, `<sector> acquisition acquires`, `<sector> IPO
   files listing`, `<sector> shuts down insolvency`. Narrow to the deal types if the owner set them. Then open the
   primary page for each candidate: the company's or investor's press release, an SEC EDGAR filing (Form D, S-1, 8-K), an
   exchange notice, a regulator's page. A deal that rests only on a news article is `medium` at best; one that rests on
   a data provider alone says so in `amount_basis`.
4. **Check each.** Inside the window? In the sector (and the region if one was named)? Matches the stage and the deal
   types? Status exact (`DEALS.md`)? Drop what fails, and what you cannot date to the window.
5. **No repeats.** Drop a candidate whose event happened before `from` or that is the same event as a reported one,
   even worded otherwise. Keep a real development (a signed deal now closed, a filing now priced). One line each in
   `dropped_repeats`.
6. **Write each deal.** `amount` with its currency, or `undisclosed`. `lead` as the source names them. `terms` only
   when disclosed; never a valuation derived from a round size. `rationale` attributed in the string ("per the
   acquirer's release: ..."). `so_what`, one line for the angle (founder: active investors and terms; investor: new
   companies and exits; corp_dev: rationale and multiples; dealmakers: balanced). No advice to buy or sell. Rumours:
   status `rumored`, the outlet and its sourcing in `rationale`, and `Rumor:` starts the report line. At most 20 deals,
   the biggest first.
7. **Watch next.** One dated thing to watch (an expected close, a pricing date, a regulator's deadline), or null.
8. **Answer** with exactly one fenced `json` block matching `deals.schema.json` (beside this SKILL.md: read it before
   you answer), and nothing after it. No deal passed: `quiet` is true, `report_markdown` is a header and one line, and
   nothing pads it.

## When someone asks a question instead

A person asking about one deal or one investor gets a plain answer from the same sources, dated and linked.

## What you remember

Keep what the owner said about what they want ("funding under $5M is not news", "skip crypto") in their words, and a
newsroom or registry URL that worked. The deals themselves are not notes.
