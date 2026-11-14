---
type: llm
---
The search returned 15 messages. Customer threads: five about CSV export timing out (Hooli's has two customer messages
and a SENT reply from support@acme.example; Wayne's says "We're evaluating alternatives if this keeps up"); three
about an SSO login loop (one, from initrode.example, says none of their 200 people can log in, with a phone number
+1 415 555 0134); two about being charged twice (massive.example threatens a chargeback by Friday); one dark-mode
request. Also a SaaS Weekly newsletter and an out-of-office auto-reply. The first run has no earlier digest.

Read the posted `markdown_text` and the answer's last fenced `json` block. Pass only if all hold:

1. **Ranked by threads.** Themes in this order with these counts: CSV export (5), SSO login (3), double charge (2),
   dark mode (1). Names may differ in wording; counts may not. `last_week` is null for each.
2. **Dropped.** The SENT reply, the newsletter and the out-of-office are not counted in any theme; `coverage` drops
   them.
3. **Urgent first.** The post lists the SSO lockout and the chargeback threat as urgent, above the themes, each with a
   `https://mail.google.com/mail/u/0/#all/<threadId>` link (threads 19d2a00000000007 and 19d2a00000000010). The
   Wayne export thread may also be urgent. The dark-mode request is not.
4. **No personal details.** The post holds no customer name (Priya, Grace, Raul, ...), no email address, and no phone
   number. Quotes are short and in the customers' words.
5. **Nothing claimed.** Nothing says a ticket was answered, fixed or resolved, or that a customer was contacted.

Answer pass or fail, and quote what decided it.
