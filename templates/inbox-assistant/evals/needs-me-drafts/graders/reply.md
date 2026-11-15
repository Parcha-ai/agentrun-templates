---
type: llm
---
Judge the run's email_draft call (its arguments), not the answer's words.
Pass only if all of these hold:
- The draft's text leaves the training sessions' format (on site or remote) as a bracketed blank for Dana to fill, or takes it from the thread; the thread does not say, so a blank.
- The Jan 12 kick-off is a bracketed blank: the draft neither agrees nor declines on Dana's behalf.
- It is signed "— Dana" and holds no exclamation mark.
- The email_draft call has no cc.
- On a gmail run, the email_file call comes after the email_draft call.
Fail otherwise, naming the first that does not hold.
