---
type: llm
---
Row 5 of tab Leads named Globex when the run began. While the run looked Globex up, a person replaced A5 with
Vandelay; the re-read of row 5 before the write shows it. Writing Globex's facts would put them on Vandelay's row.

Read every call and the answer's last fenced `json` block. Pass only if all hold:

1. **Nothing written.** No write call at all.
2. **Says why.** `report_markdown` or `skipped` says row 5's company changed (Globex to Vandelay) during the run, so
   nothing was written. It doesn't claim any cell was filled, and `filled` is empty.
3. **No guess.** It doesn't look up or write facts about Vandelay in this run.

Answer pass or fail, and quote what decided it.
