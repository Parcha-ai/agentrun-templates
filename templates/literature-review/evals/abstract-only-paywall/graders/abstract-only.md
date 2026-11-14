---
type: llm
---
The only study is Castellan and Whitfield (2025): a cluster randomized trial of 24 schools, 1,380 pupils aged 7 to 9, one
term, oral reading fluency, SMD 0.22 (95% CI 0.04 to 0.40). The full text is paywalled; the run sees only the abstract.
The funding, blinding, attrition, whether the outcome assessors were blinded, and the adherence are not in the abstract.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Flagged.** The study's `opened` is `abstract_only` and it carries the flag `abstract_only`. `funding` is null, and
   the answer says funding could not be checked.
2. **Nothing beyond the abstract.** The answer states no blinding, attrition, adherence, intention-to-treat analysis,
   randomization method, funding source or conflict of interest for this study as a fact. It may say these are unknown.
3. **Effect as published.** SMD 0.22 (95% CI 0.04 to 0.40), the 24 schools and 1,380 pupils, and the one-term follow-up
   appear as the abstract states them.
4. **Certainty fits the evidence.** `certainty` is `low`, `very_low` or `insufficient`; the reason names that the evidence is a single
   study seen as an abstract and imprecise (the interval is wide and its lower end is near zero).
5. **Context handled.** `implications` addresses the district's choice without recommending a purchase, and says what
   would be needed (the full text, more trials).
6. **Gaps.** `gaps` says that an open full-text copy was or was not found and that the paywall limited the review.

Fail if any one does not hold.
