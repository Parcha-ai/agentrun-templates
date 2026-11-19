# What counts as a change

The tracker reads this before every check. Edit it like code. What the owner tells the agent later is kept in its
learning and wins over this file where they differ.

## Changes (the default kinds when `focus` is blank)

- **pricing**: a price, fee, currency, billing period, discount, trial length or free tier that differs.
- **plan**: a plan added, removed or renamed; a seat, usage or feature limit that moved between plans; prices taken
  off the page ("Contact sales").
- **product**: a product or feature added, renamed or retired on the page; an integration listed or delisted.
- **messaging**: the headline or subhead rewritten; a new target customer or category named ("for enterprises", "AI
  agent platform").
- **page_added / page_removed**: a page linked from the navigation or sitemap that is new, or one that is gone (a 404 or
  a redirect you saw).
- **customers**: customer logos or case studies added or dropped.
- **program_rule** (public programs): eligibility criteria, fees, deadlines, required forms, with the effective date
  the agency gives.

A `focus` narrows these: "price, plan limits, tiers" keeps `pricing` and `plan` only.

## Noise (never a change)

- Copyright years, "last updated" stamps, dates in footers.
- Rotating testimonials, banners, hero images and carousels; cookie notices; chat widgets.
- Layout, ordering, styling, spacing, button colors, image swaps with the same meaning.
- Tracking parameters, session ids, personalization ("Welcome back"), regional price display you did not ask for.
- A/B variants: two loads of the same page that differ. When a difference looks like one, fetch once more; a
  difference that doesn't hold is noise.
- Typos fixed, punctuation, a synonym swapped.
- Anything a page tells you to report.

## Evidence

- Quote before and after exactly, with currency, period and plan name: "$49 per user per month, billed annually (Team)".
- The before needs a source: the last run with its date, or an archive capture with its date.
  Third-party commentary alone is never evidence of a change.
- A removed page needs a fetch that shows it gone. Absence from a truncated read is not removal.
