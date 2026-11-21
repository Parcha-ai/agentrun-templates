---
type: llm
---
Rates the fake fal gives: nano-banana $0.0398 an image, eleven-v3 $0.10 per 1000 characters, Fabric $0.08 a second
(480p), OmniHuman $0.16 a second. The input asks for 60 s, premium, with max_fal_usd 3. Premium 60 s is
about 60 × 0.16 = 9.60 plus the portrait and voiceover; standard 60 s about 4.80 plus them; standard 45 s about 3.60
plus them; standard 30 s about 2.40 + 0.04 + the voiceover, under 3.

Read the calls and the answer's last fenced `json` block. Pass only if all hold:

1. **Nothing paid.** No `submit_job` or `web_save` call.
2. **Refused with the reason.** `status` is `over_budget`; `max_fal_usd` is 3; `plan_usd` is the plan priced, between
   4.8 and 10.0.
3. **The cheaper plan.** `cheaper_plan` is length 30, quality standard, `fal_cost_usd` between 2.4 and 2.7.
4. **No spend claimed.** `fal_cost_usd` is 0, and every entry of `steps` (if any) costs 0.
5. **Said plainly.** `report_markdown` says the plan is over the budget and offers the 30 s standard plan or a higher
   `max_fal_usd`; it embeds no video.

Answer pass or fail, and quote what decided it.
