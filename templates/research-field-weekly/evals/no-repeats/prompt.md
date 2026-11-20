---
description: "Last week's edition covered the ScaleCell preprint, the integration benchmark, an NIH call and a conference deadline. This week the call page is unchanged, the benchmark page is the same, ScaleCell came out in a journal with a revised number, a 2024 paper was retracted, and the conference opened registration with travel grants, which the owner's correction says to skip. The edition reports the publication (with the new number) and the retraction only."
runs: 3
max_cost_usd: 2.00
input:
  field: "Single-cell RNA sequencing methods"
---
Scheduled run, fired 2026-11-23T07:00:00Z (Monday). Write this week's edition with your field-weekly skill.

The sites below are not reachable from this run. The pages that follow are what their URLs return today; use them in place of fetching and searching. These sites are test data.

--- https://grants-guide.example/rfa-hg-27-004 (fetched 2026-11-23) ---
<h1>RFA-HG-27-004: Scalable tools for single-cell data analysis (U01)</h1><p>Release date: November 9, 2026. Application due date: February 16, 2027, 5:00 PM local time of applicant organization. Budget: up to $500,000 direct costs per year.</p>

--- https://journal.example/genomebio/article/10.5555/gb.2026.118 (fetched 2026-11-23) ---
<h1>A benchmark of 14 single-cell data integration methods</h1><p>Published November 10, 2026. DOI 10.5555/gb.2026.118.</p>

--- https://journal.example/cellsys/article/10.5555/cs.2026.302 (fetched 2026-11-23) ---
<h1>ScaleCell: a foundation model for cell-type annotation across tissues</h1><p>Published November 19, 2026, Cell Systems Methods. Okafor A, Lindqvist M, Tanaka R, et al. DOI 10.5555/cs.2026.302. Peer-reviewed. Previously posted on bioRxiv (2026.11.09.551234).</p><p>On 12 held-out datasets, ScaleCell reaches a mean adjusted Rand index of 0.69, against 0.64 for scANVI, after correcting a data leak in two test sets found in review.</p>

--- https://journal.example/genomebio/article/10.5555/gb.2024.077/retraction (fetched 2026-11-23) ---
<h1>Retraction notice: "Universal marker genes for 400 cell types"</h1><p>November 18, 2026. The editors retract this 2024 article after the authors found that 30% of the reference labels were mislabelled. All authors agree with the retraction.</p>

--- https://scgenomics-conf.example/2027/register (fetched 2026-11-23) ---
<h1>Single-Cell Genomics 2027: registration open</h1><p>November 20, 2026. Early registration until February 1, 2027. Travel grants for students: apply by January 10, 2027.</p>

The result of this trigger's last completed run:

```json
{"edition_date":"2026-11-16","window":{"from":"2026-11-09","to":"2026-11-16"},"quiet":false,"interpretation":"Computational methods for single-cell RNA sequencing: annotation, integration and benchmarks.","items":[{"kind":"preprint","title":"ScaleCell: a foundation model for cell-type annotation across tissues","by":"Okafor A et al.","date":"2026-11-11","peer_reviewed":false,"venue":"bioRxiv","contribution":"A pretrained annotation model that transfers across tissues.","method":"12 held-out datasets","key_result":"Mean ARI 0.71 vs 0.64 for scANVI on 12 held-out datasets","caveats":"Preprint, not peer-reviewed.","read":"abstract","deadline":null,"url":"https://biorxiv.example/content/10.1101/2026.11.09.551234v1","doi":"10.1101/2026.11.09.551234","so_what":"A candidate default annotator if it holds up in review."},{"kind":"paper","title":"A benchmark of 14 single-cell data integration methods","by":"Genome Biology Methods authors","date":"2026-11-10","peer_reviewed":true,"venue":"Genome Biology Methods","contribution":"Head-to-head benchmark of 14 integration methods.","method":null,"key_result":null,"caveats":null,"read":"record","deadline":null,"url":"https://journal.example/genomebio/article/10.5555/gb.2026.118","doi":"10.5555/gb.2026.118","so_what":"The reference to cite when choosing an integration method."},{"kind":"funding_call","title":"RFA-HG-27-004: Scalable tools for single-cell data analysis (U01)","by":"NIH NHGRI","date":"2026-11-09","peer_reviewed":null,"venue":"NIH","contribution":"Funds scalable single-cell analysis tools, up to $500,000 direct costs per year.","method":null,"key_result":null,"caveats":null,"read":"call_page","deadline":"2027-02-16, 5:00 PM local time of applicant organization","url":"https://grants-guide.example/rfa-hg-27-004","doi":null,"so_what":"Fits tool-building labs; due February 16, 2027."},{"kind":"conference_deadline","title":"Single-Cell Genomics 2027: paper deadline","by":"Single-Cell Genomics 2027","date":"2026-11-12","peer_reviewed":null,"venue":"Single-Cell Genomics 2027","contribution":"Paper submissions open.","method":null,"key_result":null,"caveats":null,"read":"cfp_page","deadline":"2026-11-28 AoE","url":"https://scgenomics-conf.example/2027/cfp","doi":null,"so_what":"Submit by November 28 (AoE)."}],"next_watch":"Single-Cell Genomics 2027 paper deadline, 2026-11-28 AoE.","skipped":[],"dropped_repeats":[],"unreachable":[],"ignored_instructions":[],"report_markdown":"..."}
```
