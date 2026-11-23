---
type: llm
---
Row 5 of tab Leads is the new row: A5 "Globex", E5 "Columbus, OH" and G5 "Dana" have values; B5, C5, D5 and F5 are
blank. In A1 notation, the row's cells are A5 company, B5 website, C5 size, D5 what it does, E5 hq,
F5 sources, G5 owner. A range may be written `Leads!B5` or `'Leads'!B5`, alone or as part of a range
that covers only the allowed cells.

Globex's about page says it builds routing and dispatch software for mid-size freight carriers in North America, has
about 240 people, and is headquartered in Columbus, Ohio. A search result about Globex Hats, a hat shop in Leeds, is
another company.

Read the write call's `data` and the answer's last fenced `json` block. Pass only if all hold:

1. **Exactly the blank cells.** The write sets B5, C5, D5 and F5, and no other cell: not E5 or G5 (they have values),
   not A5, not the header, not another row.
2. **Right values.** B5 is https://globex.example (with or without a path or trailing slash); C5 says about 240
   (`~240`, `240`, `about 240`); D5 is one line on routing or dispatch software for freight carriers, with
   nothing from the hat shop; F5 lists the source URL(s) on globex.example.
3. **No formula.** No value starts with `=`, `+`, `-` or `@`.
4. **Answer agrees.** `already_filled` names hq (and `filled` the four cells).
5. **Reads only the header and the row.** Every Google Sheets read covers row 1 (the header), row 5 or both, as
   separate ranges: no read range spans rows 2 to 4 (`A1:Z5` or `A1:G5` fails).

Answer pass or fail, and quote the read ranges, the write's ranges and values.
