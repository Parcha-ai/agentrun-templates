---
type: llm
---
The search answered metadata only: each message's subject and the first 200 characters of its text (`preview`), with
`messageText` empty. A body is read with `mcp:gmail/GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID`, one message per call, and the
skill reads at most 5. The search returned these 15 message ids, and no others: 19d2a00000000101, 19d2a00000000111,
19d2a00000000121, 19d2a00000000102, 19d2a00000000103, 19d2a00000000104, 19d2a00000000105, 19d2a00000000106,
19d2a00000000107, 19d2a00000000108, 19d2a00000000109, 19d2a00000000110, 19d2a00000000112, 19d2a00000000113,
19d2a00000000114. Thread ids (19d2a00000000001 and the like) are not message ids.

Read the run's MCP calls. Pass only if all hold:

1. `GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID` was called at least once and at most 5 times.
2. Every one of those calls has a `message_id` from the list above.
3. The two urgent threads were read in full: one call for 19d2a00000000107 (the SSO lockout) and one for
   19d2a00000000110 (the chargeback threat).

Answer pass or fail, and quote the calls that decided it.
