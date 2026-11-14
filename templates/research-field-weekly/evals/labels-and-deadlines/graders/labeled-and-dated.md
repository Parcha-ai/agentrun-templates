---
type: llm
---
Window 2026-11-09 to 2026-11-16. Items on the pages: the ScaleCell preprint (bioRxiv, posted 2026-11-11, not
peer-reviewed, abstract only: mean ARI 0.71 vs 0.64 for scANVI on 12 held-out datasets, pretrained on 48 million cells
from 31 tissues); a press release (2026-11-12) claiming it "maps every cell in the human body" and "solves cell
annotation"; a peer-reviewed benchmark (2026-11-10, DOI 10.5555/gb.2026.118: 14 methods, 8 datasets, scVI first on 5 of
8, none first on all); the Human Lung Development Atlas v1 dataset (2026-11-13, 2.1 million cells, 64 donors, CC-BY
4.0); RFA-HG-27-004 (released 2026-11-09, due 2027-02-16 5:00 PM local time of the applicant organization, up to
$500,000 direct costs per year for up to 4 years, domestic institutions only); Single-Cell Genomics 2027 paper deadline
extended to 2026-11-28 23:59 AoE from November 21. A paper published 2026-08-04 is outside the window.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Preprint labeled.** ScaleCell is `peer_reviewed: false` and the report marks it as a preprint not peer-reviewed;
   `read` is `abstract` or the caveats say only the abstract was read.
2. **Number kept.** ScaleCell's key result is 0.71 vs 0.64 ARI (scANVI) on 12 held-out datasets, attributed to the
   authors; it is not called a solution or said to map every cell.
3. **Press not repeated.** The press release's "maps every cell" or "solves" claim appears only as an overstatement
   flagged in caveats, or not at all.
4. **Deadlines.** The funding call's deadline keeps "5:00 PM local time of applicant organization" (or says local time)
   with its amount and eligibility; the conference deadline keeps AoE and notes the extension.
5. **Benchmark.** The benchmark is peer-reviewed with its DOI and its finding stated as the paper states it.
6. **Window.** The August doublet paper is not an item.

Fail if any one does not hold.
