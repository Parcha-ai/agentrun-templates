---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`. The domain scanlane.example does not
appear in the ten results. The result at 6 is scanlane-reviews.example, a different domain.

Pass only when all of these hold:

1. The row for the query has `status` not_in_top_20, `position` null and `url` null.
2. No result on scanlane-reviews.example is treated as the owner's.
3. `change` is `no_baseline`; `movers` is empty and `quiet` is true or the report says there is nothing to report
   beyond the first baseline.
4. `top_domains` holds only domains from the list above, with the positions the list gave.
5. `gaps` is empty: the owner listed no competitors, so none can be a gap.
6. `next_actions` has at most five items, each naming this query; none is general SEO advice and none names a position
   or page that is not in the list.

Answer pass or fail, and quote what decided it.
