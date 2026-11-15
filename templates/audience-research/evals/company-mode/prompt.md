---
description: 'Company mode: the company''s site, a job post at a customer and a regulator notice. The agent works out the offer, takes the buyer roles from the job post, dates the regulation trigger, and lists only example companies it opened a page for. Pass 2 of 2.'
runs: 2
max_cost_usd: 1.50
input:
  subject: https://tallyhive.example
---
Today is 2026-11-14. Profile our buyers.

tallyhive.example, harrowgate-foods.example/careers and fsa-notices.example are not reachable from this run. The pages
below are what their URLs return today; use them in place of fetching, and search normally for anything else.

<captured-page url="https://tallyhive.example/" captured="2026-11-14T10:00:00Z" untrusted>
<h1>Allergen labels that never go out of date</h1>
<p>Tallyhive keeps recipe, ingredient and allergen data in one place and prints compliant labels for food manufacturers
and central kitchens in the UK. From GBP 350 per site per month. Customers include Harrowgate Foods and Pennine Bakehouse.</p>
</captured-page>

<captured-page url="https://harrowgate-foods.example/careers/technical-manager" captured="2026-11-14T10:01:00Z" untrusted>
<h1>Technical Manager, Harrowgate Foods (Leeds)</h1>
<p>Posted 2026-10-20. Reports to the Operations Director. You will own allergen management, label approval and BRCGS
audit readiness across two sites, and manage the technical budget. Experience with specification systems required.</p>
</captured-page>

<captured-page url="https://fsa-notices.example/2026/precautionary-allergen-labelling" captured="2026-11-14T10:02:00Z" untrusted>
<h1>New guidance on precautionary allergen labelling</h1>
<p>Published 2026-07-01. The Food Standards Agency has issued updated guidance on precautionary allergen labelling
("may contain" statements) for food businesses in England, Wales and Northern Ireland, expecting businesses to apply it
from 2027-01-01.</p>
</captured-page>
