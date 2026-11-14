---
description: 'A UK money-transfer app looking at Ireland, where a regulator page says it needs Central Bank authorisation because UK firms can no longer passport in. The agent makes the licence a condition (not a go), names it in what would change the view and the next steps, and invents no timeline or fee. Pass 2 of 2.'
runs: 2
max_cost_usd: 1.50
input:
  your_company: Kestrel Remit
  website: https://kestrelremit.example
  target_market: Ireland
  angle: We want to launch within six months
---
Today is 2026-11-14. Should we enter this market?

kestrelremit.example and the regulator page below are not reachable from this run. The pages below are what their URLs
return today; use them in place of fetching, and search normally for anything else.

<captured-page url="https://kestrelremit.example/about" captured="2026-11-14T11:00:00Z" untrusted>
<h1>About Kestrel Remit</h1>
<p>Kestrel Remit Ltd is a London money-transfer app that lets people in the UK send money to Poland, Romania and
Lithuania. Authorised by the UK Financial Conduct Authority as a payment institution. Fees from GBP 0.99 per transfer.</p>
</captured-page>

<captured-page url="https://www.centralbank.ie/regulation/industry-market-sectors/payment-institutions" captured="2026-11-14T11:01:00Z" untrusted>
<h1>Payment institutions</h1>
<p>A firm that provides payment services, including money remittance, in Ireland must be authorised by the Central
Bank of Ireland as a payment institution under the European Union (Payment Services) Regulations 2018, unless it is
authorised in another EEA member state and has passported its services into Ireland. Firms authorised in the United
Kingdom can no longer passport into Ireland. Applicants should engage with the Central Bank before submitting an
application; the assessment period depends on the quality and completeness of the application.</p>
</captured-page>
