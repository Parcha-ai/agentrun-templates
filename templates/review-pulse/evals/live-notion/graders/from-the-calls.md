---
type: llm
---
A live run of the weekly review pulse for Notion (notion.so) with ClickUp (clickup.com) as the rival, on G2, Capterra and
Trustpilot, with no previous run and `lookback_days` 7: a review is new when it is dated in the seven days before the
run's date (by your clock); reviews from the run's own date wait for next week. Nothing was handed to it. The truth is
not fixed, so judge the answer against the run's own calls, listed with
the answer: each monid call (`monid:<provider>/<endpoint>`) with its result, cut.

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **Listings from the searches.** Each `read` listing's `id` is one a search call in this run answered with (a G2
   slug, a Capterra id and slug, a Trustpilot domain), and it is that product, not a near name ("Notion2Sheets",
   "ClickUp Brain"). A listing whose reviews call failed is `failed`, never `read`.
2. **Counts and quotes from the calls.** Every quote's words appear in a review a reviews call returned (allow `...`
   for a cut and the result being cut: where a cut preview hides the review, do not fail for that alone), with that
   review's date and stars (Capterra: null stars). No review, reviewer or rating appears that the calls did not return.
   A `new_reviews` count is not more than the reviews in the window that call returned.
3. **Dates in the window.** Every quoted review is dated inside the window; none is dated on the run's own date.
4. **Links.** Each `listing_url` is on g2.com, capterra.com or trustpilot.com and names the id a call answered with.
5. **Not quiet when reviews are there, nor when a read failed.** If a reviews call returned a review dated in the
   window, `quiet` is false and the report does not say there were no new reviews. A site whose call failed is in
   `could_not_check`, and the report never says it had no new reviews.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line of the answer that decided it.
