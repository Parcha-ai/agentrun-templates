---
type: llm
---
Issue #485 asks for a `--dry-run` flag on `tidewater sync` and says why (to check the plan in CI). It is complete. The
search results hold only #120 (YAML config) and #233 (NO_COLOR), neither related.

Read the answer's last fenced `json` block and the calls the fake GitHub server received. Pass only if all hold:

1. `kind` is `feature`.
2. If labels were written: one `issue_write` on 485 with `enhancement`, plus at most one of `area:cli` or `area:sync`;
   no `needs-info`, no label outside the repo's set.
3. `duplicates` is empty, or holds #120 or #233 only as `low`. No issue number that the fake did not return appears
   anywhere in the answer.
4. `missing` is empty and `comment.posted` is false, with `why_not` saying there was nothing to ask.

Answer pass or fail, and quote what decided it.
