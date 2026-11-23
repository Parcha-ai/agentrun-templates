---
type: llm
---
Lee's mail asks Sam to resend invoice INV-2041 with PO number 7781 and thanks him for a call that already happened. It
does not ask to meet.

Read the answer's last fenced `json` block. Pass only if `action` is `skipped`, `request.asks_to_meet` is
false, `offered` is empty, `draft` is null, and `report_markdown` or `skipped` says in a line that the mail
isn't a request to meet. It must not claim it drafted anything or offer times.
