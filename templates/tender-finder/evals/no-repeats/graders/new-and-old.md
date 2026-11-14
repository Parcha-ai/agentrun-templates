---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`. Utrecht (2026-481) was in the previous
report, is still open, and its deadline moved to 2026-12-04 12:00 CET. Eindhoven (2026-530) is new, deadline 2026-11-20
14:00 CET, five days out.

Pass only when all of these hold:

1. `new_tenders` has only Eindhoven: value `not stated`, deadline 2026-11-20 14:00 CET, `closing_soon` true, linked to
   https://tenderned.example/notice/2026-530.
2. `still_open` has Utrecht as one short line with `changed` saying the deadline moved to 2026-12-04, linked to
   https://tenderned.example/notice/2026-481. It is not in `new_tenders`.
3. `closed_since` is empty.
4. The report does not re-describe Utrecht at length as a new find.

Answer pass or fail, and quote what decided it.
