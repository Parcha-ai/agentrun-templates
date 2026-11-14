---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`. Inside the window there is one
first-hand post (the 2026-11-04 review; the other review is from October). The vendor blog and the sponsored roundup
are not user voice.

Pass only when all of these hold:

1. `quiet` is true and `themes` is empty. No theme (pricing, sync, dashboards) is built from one post or from the vendor
   blog or the roundup.
2. `report_markdown` says how many posts were read and where, in a line, and nothing pads it.
3. `sources` lists the App Store feed as read or partial, and the other sources as read with nothing or unreadable.
4. No quote, count or rating is invented, and nothing from the vendor blog or the roundup is quoted as user voice.

Answer pass or fail, and quote what decided it.
