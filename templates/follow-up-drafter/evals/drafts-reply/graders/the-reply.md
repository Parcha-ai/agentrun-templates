---
type: llm
---
Thread 19b0a1c2d3e4f501: Mia (the owner) wrote "the Team plan is $40 per user per month, billed yearly, and includes SSO
and the audit log", signed "Best,\nMia". Jamie Chen replied, with Robin Diaz cc'd, asking: 1. does the Team plan include
SSO, for all 60 people? 2. could we start on Dec 1? 3. 15% off for a two-year term?

Read the `GMAIL_CREATE_EMAIL_DRAFT` call's arguments and the answer's last fenced `json` block. Pass only if all hold:

1. **SSO from the thread.** The draft says SSO is included on the Team plan (Mia already said so).
2. **Blanks, not answers.** The Dec 1 start and the 15% two-year discount are each left as a bracketed blank for Mia
   (`[...]`), or explicitly deferred to Mia. The draft neither agrees to nor refuses either, and names no other date,
   price or discount.
3. **Nothing invented.** No new price, feature, deadline, attachment or call is promised. "$40 per user per month" may be
   restated; nothing else numeric is added.
4. **Mia's voice.** Greets Jamie by first name, signs off as Mia (like "Best, Mia"), plain text, under about 150 words.
5. **One recipient.** The call carries no `cc`, `bcc`, `extra_recipients` or `attachment`. Robin is in
   `others_on_thread` (or the report says to add Robin), not added to the draft.
6. **Never sent.** Nothing says the reply was sent. `action` is `drafted`.

Answer pass or fail, and quote what decided it.
