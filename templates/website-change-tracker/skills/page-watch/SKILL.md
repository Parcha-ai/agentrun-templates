---
name: page-watch
description: Check watched web pages for meaningful changes since the last check. Fetch each page's important part, compare it with the page as last seen (your learned note, the last run's result, else an archive copy from about one check ago), keep only changes CHANGES.md counts, quote before and after exactly, drop what was already reported, and keep an updated note of each page for next time. Use for the scheduled check and for "did acme.com/pricing change", "what changed on these pages".
---

# Page watch

You check each page once and answer with the JSON in step 7. You read the web; you write nothing anywhere. Your
learned notes are your memory of each page: they hold the page as you last saw it and what you already reported.

`CHANGES.md`, beside this file, says what counts as a change and what is noise. Read it before step 3.

## Inputs

- The `Input:` block: `pages` (each a URL, a domain or a company name), `focus` (blank: the default kinds in
  `CHANGES.md`), `company` (blank: write for a general team), `lookback_days` (blank: 7).
- Your `# Learned` notes: one per site, named for it, holding the facts that matter on each page as last seen (prices
  with currency and period, plan names and limits, the headline, the nav's pages, the customer logos, a program's fees
  and deadlines), the date seen, and the changes already reported with their dates.
- Run history: a scheduled run may be handed its trigger's last completed result after its message, as a fenced json
  block under "The result of this trigger's last completed run". Its `changes` were reported; use them like the notes.
- Today's date: from the input (the trigger's time) or the message.

## Steps

1. **Expand the list.** A URL is that page. A domain is its home page plus the pricing, product, about and changelog
   pages its navigation links (for a program or government site: eligibility, fees, forms), at most 5 pages. A company
   name: find its official domain with one `web_search` (`n: 5`), name it in `assumptions`, then expand it. More than 30
   entries: take the first 30 and say so.

2. **Fetch each page, small.** `web_fetch` with `max_chars: 6000` (a pricing table, a headline, a fee table sit on the
   first screen) and `offset: 1` unless you need the links (a domain's nav, the pages added or removed). One fetch per
   page; read on with `offset` only when the part that matters is cut off. A challenge, login wall or error page is
   `unreachable` with what it answered, never "no change".

3. **Find the earlier version**, in this order:
   - your learned note for the site (the facts as last seen, and when);
   - the last run's result, when handed to you;
   - an archive copy: `https://web.archive.org/web/<YYYYMMDD of today minus lookback_days>/<page URL>`, `max_chars: 6000`.
     Check the capture's own date in the URL it lands on: use it only when it is on or before the last check's date
     and no older than 3 times the lookback. A capture outside that, or none: the page has no baseline.
   No earlier version: put the page in `no_baseline`, report no change for it, and still record what you saw (step 7).

4. **Compare what matters.** Line up the earlier and the live facts: each plan's price, period and limits; products and
   features named; the headline and subhead; nav pages present or gone (a removed page you can confirm: fetch it once,
   a 404 or a redirect is the evidence); logos; a program's fees, rules, deadlines and forms. Apply `CHANGES.md`'s noise
   rules, then the `focus`: a change outside it is left out, not listed.

5. **No repeats.** A change your notes or the last run already reported (the same plan, the same old and new value) is
   not reported again, even when the page still shows it; put it in `dropped_repeats`. A further change of the same
   thing is new ("Team was $49, reported $59 last week, now $69").

6. **Write each change.** One per page and kind: the site, the page URL, the `kind`, a one-line summary, `before` and
   `after` quoted exactly as the pages state them (currency, billing period and plan name with every number), where
   the before came from (`learned_note`, `last_run` or `archive`, with the capture's URL and date), the date you saw the
   change, the effective date only when the page states one, and `so_what`: one line on what it means for the reader's
   company ("For <company>: ..."), or for a team watching that site. Label a vendor's own claims as claims. At most 8
   changes, the most consequential first; merge minor related ones.

7. **Answer** with one fenced `json` block matching the output schema. `report_markdown`:

   ```
   **Website changes** <from> to <to>
   <one line: the most consequential change, or "No meaningful changes on the pages you watch.">

   - **<site>: <summary>** ([page](<live url>), [before](<archive url, when one>))
     Before: "<before>" · After: "<after>"
     _<so_what>_
   ...
   _No change: <site (pages checked)>. No baseline yet: <pages>. Unreachable: <page (why)>._
   ```

   `quiet` is true when no change passed steps 4 to 5. Every watched site appears in `changes`, `unchanged`,
   `no_baseline` or `unreachable`, so a reader can tell a quiet page from a blind one.

## What you remember

At the end of a run you will be asked what to keep. Keep one note per site, replacing the old one: the facts that
matter on each of its pages as you saw them today, with today's date, and the changes reported (this run's and the
note's earlier ones, the last 10). Write facts, not page dumps: "pricing: Starter $0, Team $59/user/mo billed annually,
Business $99/user/mo; headline 'Ship docs your team trusts'; logos: Ramp, Linear, Vercel". Keep too what the owner
tells you about what they care about, in their words. A page you could not read keeps its old facts.
