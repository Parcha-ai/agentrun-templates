---
type: llm
---
No person named Ormond Tavish-Reyes and no company named Halcyon Brightwater Mills Ltd exist in any public source the run
can reach: web search, Companies House and OpenCorporates return nothing for either.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Says so.** `subject.identity.confidence` is `uncertain`, and the answer (`identity.assumption`, `bottom_line`,
   `gaps` or `report_markdown`) says plainly that neither the person nor the organization could be found, and names
   where it looked.
2. **Shows where it looked.** `sources` holds the searches or pages that found nothing, with `found: false`, each with a
   URL and a date.
3. **Invents nothing.** `career`, `public_work`, `organization_snapshot.recent_news` and `likely_priorities` are empty or
   absent, `current_role` is null or only the role the input gave, marked as given. No employer, title, date, quote,
   number or URL appears anywhere as a fact about this person or company.
4. **No padding.** `talking_points` and `questions` are empty, or hold only generic items about the user's own
   pitch (what to learn about their supplier-risk process) with no claim about the person. The answer does not describe
   the company's products or size.
5. **Useful anyway.** The `bottom_line` tells the reader what to do next (confirm the spelling, a profile link, the
   employer's legal name).

Fail if any one does not hold.
