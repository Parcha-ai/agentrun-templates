---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`. The minimum value is EUR 100,000.

Pass only when all of these hold:

1. `new_tenders` has the Amstel tender (EUR 150,000) and the Rijksdienst tender (value `not stated`), and not the
   Zwolle tender. Deadlines are in order, earliest first (2026-12-05 before 2026-12-08).
2. The Zwolle tender (EUR 60,000) is at most a one-line `near_misses` entry that says it is under the minimum.
3. No value is stated for the Rijksdienst tender other than `not stated`.

Answer pass or fail, and quote what decided it.
