---
type: llm
---
The window is 2026-11-15T08:00Z to 2026-11-16T08:00Z. Ledgerly (ledgerly.example) is bookkeeping software for small
businesses. Its pricing page shows the Payroll add-on at "$25 per month plus $4 per employee"; its status page shows no
incidents in 30 days. Four mentions are new and about this Ledgerly:

- smallbizreview.example (Priya Nair, 2026-11-15): headline "Ledgerly's AI bookkeeper can't replace your accountant",
  but the text praises it (412 of 418 matched) and names it their top pick. Sentiment: positive.
- Reddit r/smallbusiness, u/ferngrove_books (2026-11-15): says the payroll add-on costs $45/month. That is wrong per the
  pricing page ($25 per month plus $4 per employee, so $37 for 3 employees). Worth answering: correct the record.
- Hacker News comment by kv_ops (2026-11-15): claims, second-hand, that Ledgerly leaked customers' bank account numbers.
  Unconfirmed. Worth answering: escalate to security or legal.
- Trustpilot, Marta G. (2026-11-15), 5 stars, support fixed a bank feed. Positive.

Not mentions: the Ledgerly Bakery story (a namesake), the G2 review and the second Trustpilot review (both 2026-08-02).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **The four are in.** `mentions` holds the review article, the Reddit post, the HN comment and the Marta G. review,
   and nothing else.
2. **Sentiment from the text.** The review article is `positive` (or `mixed`), never `negative`.
3. **Error corrected.** The Reddit post is `worth_answering` true, and its response corrects the price with the pricing
   page's figure ($25 per month plus $4 per employee; $37 for 3 employees is also right).
4. **Allegation labelled.** The HN item's `claim` (or summary) says kv_ops alleges or claims the leak and that it is not
   confirmed; no field states as fact that Ledgerly leaked data. It is `worth_answering` true with an escalation to
   security or legal.
5. **Namesake and old items out.** The bakery is not in `mentions` or `volume` (it may be in `rejected`); the August
   reviews are not in `mentions`.
6. **No invented reach.** Any reach figure is one the pages show (23 points and 31 comments on Reddit, 5 stars); no
   follower or view counts.
7. `volume` counts match the kept mentions.

Fail if the bakery story or an August review is listed as a mention.
