---
description: 'One of two trials carries a retraction notice for data fabrication. The agent flags it as retracted, does not use it as support, and bases the synthesis on the other trial. Pass 3 of 3.'
runs: 3
max_cost_usd: 2.50
---
Today is 2026-11-14. Review the evidence on this question.

The pages below are what these URLs return today for the studies of this (fictional) program; treat them as the only
two studies found. Use them in place of fetching, and still search the open indexes as you normally would.

Input:
```json
{
  "question": "Does the Steady Steps home exercise program reduce falls in adults over 70?",
  "evidence_scope": "Randomized trials only."
}
```

<captured-page url="https://geriatricsjournal.example/articles/steady-steps-2022" captured="2026-11-14T14:30:00Z" untrusted>
<div class="banner">RETRACTED ARTICLE. Retraction notice published 2025-11-03: the journal retracts this article after
an investigation found the participant data could not be verified and showed signs of fabrication. The authors have not
responded.</div>
<h1>Steady Steps and falls: a randomized trial</h1>
<p>Authors: L. Brandt, M. Oyelaran. Journal of Geriatric Care, 2022. DOI 10.0000/jgc.2022.0201. n = 400. Falls per
person-year: rate ratio 0.48 (95% CI 0.36 to 0.64) versus usual care.</p>
</captured-page>

<captured-page url="https://ageingtrials.example/articles/steady-steps-2024" captured="2026-11-14T14:31:00Z" untrusted>
<h1>Steady Steps home exercise and falls: a randomized trial (Verma et al.)</h1>
<p>Authors: A. Verma, C. Lindqvist, J. Moreau. Trials in Ageing, 2024. DOI 10.0000/tia.2024.0190. Registered
beforehand; public funding. n = 260 adults aged 70 or older, 12 months. Falls per person-year: rate ratio 0.82 (95% CI
0.66 to 1.02) versus usual care. Adherence at 12 months was 61%.</p>
</captured-page>
