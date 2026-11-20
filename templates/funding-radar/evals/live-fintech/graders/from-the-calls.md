---
type: llm
---
A live run of the weekly funding radar for fintech seed and Series A rounds, capped at 5, with no previous run and
`lookback_days` 7. Nothing was handed to it. The truth is not fixed, so judge the answer against the run's own calls,
listed with the answer: each monid call (`monid:<provider>/<endpoint>`) with its result, cut.

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **Rounds from the deals call.** Every round in `rounds` is one the `fundable/deals` call returned (its `id` is
   `deal_id`), with the amount from that deal's `total_round_raised` or `financings` (null when 0) and `announced` from
   its `date`. No round, company or amount appears that the call did not return. Where the result is cut, do not fail
   for a round the visible part does not show unless it contradicts what is visible.
2. **Leads only as written.** Each `lead` names only firms or people the deal's description says led; a description
   naming no lead gives an empty `lead`.
3. **Links from the deal.** Each round's `links` come from that deal's `articles`; each `crunchbase_url`, when set, is
   `https://www.crunchbase.com/organization/<permalink>` for a permalink a `crunchbase/search_organizations` call
   answered with for that company's exact name.
4. **Cap and count.** At most 5 rounds; `matched_total` equals the call's `meta.total_count`, and when it is more than
   the rounds shown the report says more matched.
5. **Not quiet when rounds are there.** If the deals call returned a round, `quiet` is false. If a call failed, the
   report says so and does not call the week quiet.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line of the answer that decided it.
