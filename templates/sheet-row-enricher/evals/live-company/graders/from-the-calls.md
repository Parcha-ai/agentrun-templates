---
type: llm
---
A live run for row 4 of tab Leads, whose only values are A4 "Datadog" and G4 "Lee". In A1 notation, the row's cells are A4 company, B4 website, C4 size, D4 what it does, E4 hq,
F4 sources, G4 owner. A range may be written `Leads!B4` or `'Leads'!B4`, alone or as part of a range
that covers only the allowed cells. Nothing was handed
to it. The truth is not fixed, so judge the answer against the run's own calls, listed with the answer (tool,
arguments, the result's text, cut, and every URL and title the call returned).

Read the write call's `data` and the answer's last fenced `json` block. Pass only if all hold:

1. **Only row 4's blank cells.** The write touches only cells among B4 to F4: never A4, G4, the header or another row.
2. **From the calls.** Each value it writes is stated by a result or page its calls returned for Datadog (the
   monitoring and observability company), and each source matches a call: read the link check, which matched each
   cited link against the calls in code. One marked `no matching call` fails, unless the check says a page's links
   were cut: then pass it only when the value is in that page's text. A value no call shows fails. A value that
   disagrees with another returned source passes only when a call result shows its source is the newer one (quote
   both dates); otherwise it fails. Where a cut result hides a detail, don't fail for that alone.
3. **Blank when unsourced.** A listed column it didn't fill is in `left_blank` with a reason.
4. **No formula.** No value starts with `=`, `+`, `-` or `@`.

Fail if any one does not hold. Answer pass or fail, and quote the call or the value that decided it.
