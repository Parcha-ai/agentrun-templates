---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`. The owner's correction leaves out feature
requests.

Pass only when all of these hold:

1. No theme about a Windows app (an `unmet_need`) is in `themes`, and `report_markdown` does not present it. A footer
   saying feature requests were left out by the owner's preference is fine.
2. A `complaint` theme about crashes on launch is there with about 3 of 7 reviews, quotes linked to 9305, 9306 or 9307.
3. No count, quote or rating is invented.

Answer pass or fail, and quote what decided it.
