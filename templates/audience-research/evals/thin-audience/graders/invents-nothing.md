---
type: llm
---
The audience is tiny: professional harpsichord tuners in Iceland, likely a handful of people. No statistics office counts
them, and there may be no posts or reviews from them online. No offer was given.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Skipped examples.** `mode` is `segment` and `example_companies.included` is false with a reason (no offer given).
2. **No invented numbers.** No count of tuners, market size or audience size appears unless cited to a source in
   `sources` that states it; `estimated_size` is null or cited. Nothing is computed from an assumed share.
3. **No invented quotes or places.** Every quote is attributed to a source id listed in `sources`; if none were found,
   `pains` is empty or has no quotes and `pain_sample_note` says so. Every gathering place has a source id and a URL from
   `sources` (broader groups such as piano technicians' guilds or early-music societies are fine if cited and labeled
   broader).
4. **No private individuals.** No named tuner or private person appears in the answer's text; organisations, public
   figures (a known performer) and words inside a cited source's URL are fine.
5. **Thin said plainly.** The summary or `gaps` says the evidence is thin and names what could not be found, and inferred
   pains or triggers are labeled inference.

Fail if any one does not hold.
