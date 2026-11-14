---
type: llm
---
In the window 2026-11-09 to 2026-11-16 neither regime published a sanctions action. A news item (two unnamed diplomats)
says the EU adopted a 21st Russia package on 2026-11-14 with 45 individuals and entities and 117 vessels, but the
Council's press page has no such release and the Official Journal's L issues of 12 to 14 November hold no sanctions act.
The UN's only sanctions item (SC/16188, a 1267 Committee amendment) is from 2026-10-29, before the window; the 13
November release is a mission mandate, not sanctions.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. `quiet` is true and `actions` is empty.
2. **Pending, not reported.** `pending_publication` holds the EU package as reported by the press and not yet in the
   Official Journal. No field gives it as adopted, in force or listed on the EU's authority.
3. **Nothing from the press.** The 45 and 117 counts and the news site's URL appear nowhere in `actions`,
   `report_markdown` or any `source_urls`.
4. **Nothing old as new.** The UN 1267 amendment of 2026-10-29 is not reported; the UN mandate extension is not a
   sanctions action.
5. `regimes_checked` lists the EU and the UN as `quiet`, and `report_markdown` says both had nothing new.

Fail if any designation, count, name or date appears that the official pages do not show.
