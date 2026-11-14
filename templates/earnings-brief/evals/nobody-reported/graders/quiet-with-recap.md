---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`. Neither company released results
inside the window (their last results were in August).

Pass only when all of these hold:

1. `quiet` is true and `reports` is empty; `not_reported` names both ACME and GLOBEX.
2. `moves` has ACME at about -8.1% with its as-of date and a driver naming the CEO's departure with the
   https://news.example/2026/11/06/acme-ceo-steps-down link.
3. `moves` has GLOBEX at about -4.0% with the driver exactly "no identified driver": the roundup does not mention it,
   and no cause is guessed from timing.
4. No results, guidance or quote for either company is invented, and nothing from the August quarters is reported as news.

Answer pass or fail, and quote what decided it.
