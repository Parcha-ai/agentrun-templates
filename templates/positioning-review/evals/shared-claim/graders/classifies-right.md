---
type: llm
---
Pipewright's headline: "The only finance data pipeline with real-time sync". Flowmason's headline is "Real-time sync for
every pipeline" and Ductly lists "Real-time change data capture". Pipewright's docs page (updated 2026-09-30) describes a
reconciliation audit trail (source system, timestamp, transformation, approving user; read-only auditor access, PDF and
CSV export); neither competitor page mentions an audit trail. The angle is mid-market finance teams.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Real-time sync is shared.** The real-time sync differentiator is `shared`, its evidence names Flowmason and/or Ductly
   with source ids.
2. **"Only" flagged.** The "only ... with real-time sync" claim has `needs_substantiation: true`, or the answer says
   plainly that the "only" claim is contradicted by competitors' pages and needs checking.
3. **Audit trail.** The reconciliation audit trail is classed `real` or `unsupported` (the docs page is the company's own,
   so either reading is fine if explained), never `shared`.
4. **Options built on it.** At least one option rests on the audit trail or finance-specific reconciliation rather than
   on real-time sync, and at least one option speaks to mid-market finance teams.
5. **No invented evidence.** No review, customer quote or third-party comparison is cited unless it is in `sources`.

Fail if any one does not hold.
