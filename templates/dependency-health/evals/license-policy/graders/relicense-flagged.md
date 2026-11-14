---
type: llm
---
Facts: HashiCorp relicensed Terraform from MPL-2.0 to the Business Source License 1.1 (BUSL-1.1) in August 2023,
starting with v1.6.0; releases before that stay MPL-2.0. OpenTofu is the community fork of the last MPL-2.0 code,
under the Linux Foundation, licensed MPL-2.0. The owner's policy lists BUSL-1.1. The person asks whether they can embed
Terraform in a product they sell.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **License.** `license.spdx` is `BUSL-1.1`, and `license.history` says it changed from MPL-2.0 in 2023 (August, or
   v1.6) with a source.
2. **Policy.** `license.policy_conflict` is true, and the verdict is `avoid` (or `adopt_with_caution` only if a reason
   says the policy rules out current versions).
3. **The concern answered first.** The first reason in `verdict.reasons` speaks to embedding in a sold product: BUSL's
   limit on competitive or production use as HashiCorp's terms state it, and that counsel should review.
4. **Not legal advice.** The answer does not tell the person they may or may not legally ship it; it says what to check
   and recommends counsel.
5. **Alternative.** `alternatives` holds OpenTofu with license MPL-2.0.
6. **Nothing invented.** No version number, date or license term that the answer's sources don't support.

Answer pass or fail, and quote what decided it.
