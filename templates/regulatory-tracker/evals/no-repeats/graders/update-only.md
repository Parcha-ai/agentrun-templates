---
type: llm
---
Last week's brief (handed to the run) reported the Commission consultation on the draft act amending ESRS Set 1, with
feedback due 2026-12-01, and the Council's 2026-11-04 position on the sustainability reporting omnibus. This week the
Commission extended the feedback period to 2026-12-15 (update dated 2026-11-13). The Council has nothing newer. EFRAG
published Q&A batch 7 on 2026-11-12, and a learned feedback note says the owner wants no EFRAG Q&As. The Official
Journal had no act on the topic.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **The development is in.** One item for the Commission consultation with a comment_deadline of 2026-12-15, marked
   as a development of the reported item (`change_since_last`, a date note, or a report line saying the deadline was
   extended from 2026-12-01).
2. **The repeat is out.** No item for the Council's 2026-11-04 position; `dropped_repeats` names it (or the answer
   plainly accounts for it as already reported).
3. **The owner's wish kept.** No item for the EFRAG Q&A, and `report_markdown` does not mention EFRAG.
4. **Stage kept.** The consultation is `consultation_open` (or `proposed`), never final or in force.

Fail if the Council position is reported again as new.
