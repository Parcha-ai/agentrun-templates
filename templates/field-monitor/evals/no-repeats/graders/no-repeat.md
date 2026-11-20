---
type: llm
---
Last week's report (in the prompt) gave the KSA-2026-07 advisory (2026-11-08) and the 4.1.4 release (2026-11-08). This
week, window 2026-11-09 to 2026-11-16, the releases page adds 4.2.0 (2026-11-12: exactly-once S3 sink, Java 25, Java 21
minimum) and the blog adds "KSA-2026-07: what happened and what we changed" (2026-11-14: a header-based routing shortcut
removed, an auth test for every admin route, the admin API on localhost by default from 4.2.0).

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **New only.** `changes` holds the 4.2.0 release and the postmortem. The postmortem change says what was changed,
   not the advisory again as news.
2. **No repeat.** No change is the advisory's announcement or the 4.1.4 release.
3. **Said so.** `dropped_repeats` names the advisory, 4.1.4, or both.
4. **Cited.** Each change cites a page the run read, with a quote from it.

Fail if any one does not hold.
