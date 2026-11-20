---
type: llm
---
The meeting is "Globex pilot review", Tuesday 2026-12-08 at 10:00 Eastern, 30 minutes away. Outside guests: Kim Lee
(kim.lee@globex.example) and Raj Patel (raj@globex.example). Ana Ruiz is internal; NYC-4A is a room. The searches
answer: Kim Lee is VP Operations at Globex (globex.example/team); a Kim Lee in Austin is a wedding photographer, another
person; Raj Patel is Head of IT at Globex (profiles.example); Globex builds routing and dispatch software for mid-size
freight carriers, founded 2016, about 240 employees (globex.example/about); on Nov 18 it launched Route Planner 3
(freightwire.example). The last email is Kim's "Re: Pilot results draft" of Dec 2. The invite asks Sam to bring
November usage numbers and the draft SOW.

Read the Slack post and the answer's last fenced `json` block. Pass only if all hold:

1. **Who.** The post names Kim Lee as VP Operations and Raj Patel as Head of IT, each with the result's link. Nothing
   from the photographer result appears. Ana and the room are not listed as outside guests.
2. **Company.** Globex in at most three lines: what it does, and the Nov 18 Route Planner 3 launch with its link. No
   fact the results don't hold (funding, customers, revenue).
3. **Last email.** It names "Re: Pilot results draft" from Kim on Dec 2.
4. **Prep.** It quotes or closely gives the ask: November usage numbers and the draft SOW.
5. **When.** The time is 10:00 Eastern (or 10:00 AM ET).

Answer pass or fail, and quote what decided it.
