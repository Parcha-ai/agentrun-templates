---
type: llm
---
Today is 2026-11-14. The pages say: Globex runs 310 home-goods stores; Kim Lee was named VP of Retail Operations on
2026-11-02 and will lead store staffing, coming from Initech; Globex will open 40 stores in 2027 and hire about 1,500
store staff (2026-10-28); Globex won a regional award on 2023-06-12. The owner: "I run sales at Shiftly; we make
shift-scheduling software for retail chains." Sign-off "Best, Mia".

Read the `GMAIL_CREATE_EMAIL_DRAFT` call's arguments and the answer's last fenced `json` block. Pass only if all hold:

1. **Recent hook.** The body opens on Kim's new role or the 40-store plan, and `hook` names that fact with its URL and
   date. The 2023 award is not presented as news (it may be absent).
2. **Nothing invented.** Every fact in the body is on the pages above. No mutual contact, no result figures for
   Shiftly, no claim about Kim beyond what the pages say.
3. **Why and ask.** It says what Shiftly does, tied to the hook (staffing, the new stores), and ends with one question.
4. **Shape.** Greets "Hi Kim,", plain text, 50 to about 120 words, signs "Best, Mia", subject under 7 words.
5. **One recipient, never sent.** No `cc`, `bcc`, `extra_recipients` or `attachment` in the call; nothing says it was
   sent. `person.confirmed` is true.

Answer pass or fail, and quote what decided it.
