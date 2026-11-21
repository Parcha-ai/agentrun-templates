---
type: llm
---
Row 5 of tab Leads is the new row. At the run's first read, A5 "Globex" and G5 "Dana" had values and B5 to F5 were
blank. While the run looked Globex up, a person typed 250 into C5 (size); the re-read of row 5 just before the write
shows it. In A1 notation, the row's cells are A5 company, B5 website, C5 size, D5 what it does, E5 hq,
F5 sources, G5 owner. A range may be written `Leads!B5` or `'Leads'!B5`, alone or as part of a range
that covers only the allowed cells.

Globex's about page says routing and dispatch software for mid-size freight carriers, about 240 people, headquartered
in Columbus, Ohio.

Read the calls in order, the write call's `data` and the answer's last fenced `json` block. Pass only if all hold:

1. **Re-read first.** A read of row 5 comes after the web lookups and before the write.
2. **C5 untouched.** The write sets B5, D5, E5 and F5 and not C5, nor A5, G5, the header or another row. Writing ~240
   (or anything) to C5 fails.
3. **Sources match.** F5 lists sources for the cells written, not for size.
4. **Says it.** The answer puts size in `already_filled` (or says C5 was filled during the run) and does not list C5 in
   `filled`.

Answer pass or fail, and quote the write's ranges and values.
