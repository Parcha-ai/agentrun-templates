---
description: "Yesterday's run showed Lumen Health's Patient App designer, whose page is careers.example/careers?jobId=101. Today Lumen posts two more designer roles on the same careers page, ?jobId=102 and ?jobId=103 (the second linked with tracking parameters and a fragment). The query is what tells the jobs apart: both are new and listed, 101 is a repeat, and `watched` keeps all three urls with their jobId and without the tracking parameters."
runs: 3
max_cost_usd: 2.00
input:
  role: "Mid-level product designer"
  location: "Lisbon (hybrid or onsite) or remote within the EU"
  must_haves: ["Full-time", "Open to EU-based candidates"]
  nice_to_haves: ["Health or climate sector", "Pay listed"]
---
Scheduled run, fired 2026-11-18T07:00:00Z (Wednesday). Find the new matching postings with your job-watch skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching and searching. These sites are test data.

--- https://careers.example/careers?jobId=101 (fetched 2026-11-18) ---
<h1>Product Designer, Patient App</h1><p>Lumen Health · Lisbon, Portugal · Hybrid, 2 days a week in office · Full-time</p><p>Salary: EUR 50,000 to 58,000 per year. Posted November 16, 2026. Applications close December 10, 2026.</p>

--- https://careers.example/careers?jobId=102 (fetched 2026-11-18) ---
<h1>Product Designer, Clinician Tools</h1><p>Lumen Health · Lisbon, Portugal · Hybrid, 2 days a week in office · Full-time</p><p>Salary: EUR 50,000 to 58,000 per year. Posted November 17, 2026. Applications close December 15, 2026. 3 to 5 years designing for clinicians.</p>

--- https://careers.example/careers?jobId=103&utm_source=linkedin&utm_medium=social&gclid=Cj0KCQ9x#apply (fetched 2026-11-18) ---
<h1>Product Designer, Billing</h1><p>Lumen Health · Remote, EU · Full-time</p><p>Salary: EUR 48,000 to 56,000 per year. Posted November 18, 2026. Rolling applications. 3+ years of product design for payments or billing.</p>

The result of this trigger's last completed run (01a1cf00-0000-7000-8000-00000000e120, ended 2026-11-17T07:02:10Z):

```json
{"window":{"from":"2026-11-16","to":"2026-11-17"},"quiet":false,"interpretation":"Mid-level product design roles in Lisbon or remote EU, full-time.","postings":[{"rank":1,"title":"Product Designer, Patient App","employer":"Lumen Health","location_terms":"Hybrid, 2 days, Lisbon","pay":"EUR 50,000 to 58,000 per year","contract_type":"Full-time","posted":"2026-11-16","posted_note":"posted","deadline":"2026-12-10","fit_note":"Mid-level product design in health, Lisbon hybrid, pay listed.","flag":null,"url":"https://careers.example/careers?jobId=101","also_seen_on":[]}],"changes":[],"near_misses":[],"dropped_repeats":[],"watched":[{"url":"https://careers.example/careers?jobId=101","first_shown":"2026-11-17","deadline":"2026-12-10","pay_listed":true}],"watched_dropped":0,"unreachable":[],"ignored_instructions":[],"report_markdown":"**New Mid-level product designer postings** 2026-11-16 to 2026-11-17\n1 new match; none close within a week.\n\n1. **[Product Designer, Patient App](https://careers.example/careers?jobId=101)**, Lumen Health · Hybrid, 2 days, Lisbon · EUR 50,000 to 58,000 per year · full time · posted 2026-11-16, deadline 2026-12-10\n\n**Changes:** No changes to postings shown before.\n**Near misses:** none"}
```
