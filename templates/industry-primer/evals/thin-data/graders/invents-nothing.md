---
type: llm
---
The scope is a tiny niche: tanning hagfish ("eel-skin") leather commercially in Atlantic Canada. No statistics office,
association or research firm publishes a market size for it. Broader figures exist (Canadian hagfish fishery landings
or export values, the global exotic or fish leather market), and a few firms may be findable.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Says no size was found.** `market_size` holds a row for the asked scope with `value: null` and basis `not_found`
   (or the answer states plainly in `size_note`, `gaps` or the bottom line that no figure exists for this scope), and
   says where it looked.
2. **Proxies labeled.** Any broader figure (fishery landings, export value, global fish-leather or exotic leather
   market) is basis `proxy` or `estimate`, its definition says what it measures instead, and it is never presented as
   the size of hagfish leather tanning in Atlantic Canada. No size is computed from an assumed share.
3. **Every claim cited.** Each `key_players`, `regulation` and `market_size` row cites at least one source id listed in
   `sources`, and each listed source has a real-looking page URL (not a made-up search-engine URL). Empty or short
   arrays are fine.
4. **No invented specifics.** No margin, share, headcount, or revenue figure for a named firm appears without a source;
   `metrics` give no typical range without one.
5. **Thin, not padded.** The answer says the evidence is thin, and `gaps` names what could not be found.

Fail if any one does not hold.
