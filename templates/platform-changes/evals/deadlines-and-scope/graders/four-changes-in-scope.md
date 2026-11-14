---
type: llm
---
The window is 2026-11-09 to 2026-11-16. The team runs a Node backend on Vercel Pro, Stripe Checkout and Billing,
OpenAI chat completions on gpt-6-luna and the Assistants API for a support bot. In the window the vendors' own pages
show:
- OpenAI (2026-11-10): gpt-6-luna-2026-03 shuts down on January 14, 2027 (59 days away), replacement
  gpt-6-luna-2026-10; the `gpt-6-luna` alias moves on December 2, 2026.
- OpenAI (2026-11-13): the Assistants API is deprecated for the Responses API, shutting down "later in 2027" with no
  exact date.
- Vercel (2026-11-11): Pro Fast Data Transfer overage rises from $0.15 to $0.20 per GB beyond the included 1 TB, from
  December 1, 2026.
- Stripe (2026-11-12): API version 2026-11-12.acacia drops `if_required` for `customer_creation` in subscription-mode
  Checkout Sessions, on upgrade to that version.
- Stripe (2026-11-10): Terminal BBPOS WisePad 2 end of support on March 31, 2027. The team does not use Terminal.
- Vercel (2026-11-14): the Ship 2026 recap, a marketing post.
Older entries (the embeddings shutdown of 2026-10-06, Node.js 24 default on Oct 30, the Billing option of 2026-10-28)
are outside the window.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **The snapshot shutdown, act now.** A change for the gpt-6-luna-2026-03 deprecation, `section` `act_now`, naming
   gpt-6-luna-2026-10 as the replacement and stating the January 14, 2027 shutdown. Its `deadline.date` is 2027-01-14,
   or 2026-12-02 (the alias move, the first date that reaches a team calling `gpt-6-luna`) when the change also states
   the January 14 shutdown.
2. **The vendor's words, no invented date.** A change for the Assistants API deprecation whose `deadline.date` is null
   and whose `deadline.wording` (or `what_changed`) says "later in 2027". No date in 2027 is given for it anywhere.
3. **The price, exactly.** A Vercel change stating $0.15 to $0.20 per GB, the Pro plan, from December 1, 2026
   (`deadline.date` 2026-12-01).
4. **The Stripe breaking change.** A Stripe change for the `customer_creation` / `if_required` removal tied to
   upgrading to 2026-11-12.acacia, with no calendar deadline date.
5. **Out of scope stays out.** No change for Terminal or WisePad 2 (a `left_out` mention is fine) and none for the Ship
   recap. No change for the out-of-window entries.
6. **Sourced.** Each change's first `source_urls` entry is a vendor page (platform.openai.com, vercel.com,
   docs.stripe.com).

Fail if any price, version or date appears that the pages do not show.
