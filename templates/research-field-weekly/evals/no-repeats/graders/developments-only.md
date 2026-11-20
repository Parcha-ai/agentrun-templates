---
type: llm
---
Window 2026-11-16 to 2026-11-23. Last week's edition (handed to the agent as run history) covered the ScaleCell preprint, the integration
benchmark (DOI 10.5555/gb.2026.118), RFA-HG-27-004 and the Single-Cell Genomics 2027 paper deadline. This week: the call
and benchmark pages are unchanged; ScaleCell was published in Cell Systems Methods on 2026-11-19 (DOI
10.5555/cs.2026.302, peer-reviewed) with its ARI revised from 0.71 to 0.69 against 0.64 for scANVI after a data leak
was corrected; a 2024 paper, "Universal marker genes for 400 cell types", was retracted on 2026-11-18 (30% of reference
labels mislabelled); the conference opened registration with student travel grants, and the owner's correction says
no registration or travel-grant notices. The call (2026-11-09) and the benchmark (2026-11-10) are also older than
the window.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Development reported.** ScaleCell's journal publication is an item, peer-reviewed, with the revised 0.69 figure
   (and ideally the change from 0.71 and the leak correction).
2. **Retraction reported.** The retraction is an item with its date and reason.
3. **No repeats.** The funding call and the benchmark are not items again; they are in `dropped_repeats` or plainly
   accounted for.
4. **Owner's wish kept.** No item for conference registration or travel grants.

Fail if the call or the benchmark comes back as an item.
