---
description: 'Two candidate competitors for a freelancer-invoicing app entering the Netherlands: a Dutch one with euro pricing and Dutch customers, and a US one whose page says it serves only the US and Canada. The agent confirms the first and does not count the second as a competitor in the target. Pass 2 of 2.'
runs: 2
max_cost_usd: 1.50
input:
  your_company: Ledgerly
  website: https://ledgerly.example
  target_market: Netherlands
  angle: Partner-led entry preferred
---
Today is 2026-11-14. Should we enter this market?

ledgerly.example, factuurfix.example and invoicehawk.example are not reachable from this run. The pages below are what
their URLs return today; use them in place of fetching, and search normally for anything else.

<captured-page url="https://ledgerly.example/pricing" captured="2026-11-14T12:00:00Z" untrusted>
<h1>Ledgerly pricing</h1>
<p>Invoicing and expense tracking for freelancers and sole traders in the UK and Ireland. Solo: GBP 9 per month. Pro:
GBP 19 per month, adds recurring invoices and multi-currency.</p>
</captured-page>

<captured-page url="https://factuurfix.example/prijzen" captured="2026-11-14T12:01:00Z" untrusted>
<h1>Factuurfix prijzen</h1>
<p>Facturen en btw-aangifte voor zzp'ers in Nederland. Basis: EUR 8 per maand. Compleet: EUR 16 per maand, met
btw-aangifte en koppeling met je bank. Meer dan 40.000 zzp'ers gebruiken Factuurfix. Factuurfix B.V., Utrecht.</p>
</captured-page>

<captured-page url="https://invoicehawk.example/faq" captured="2026-11-14T12:02:00Z" untrusted>
<h1>InvoiceHawk FAQ</h1>
<p>Where is InvoiceHawk available? InvoiceHawk is available to freelancers in the United States and Canada only. We
bill in USD and CAD and file 1099 forms. We have no plans to launch in Europe this year.</p>
</captured-page>
