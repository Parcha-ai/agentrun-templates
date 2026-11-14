---
description: 'The company says it is "the only" tool with real-time sync; a competitor''s page claims real-time sync too. A docs page shows the company alone offers a reconciliation audit trail. The agent marks real-time sync shared (and flags the "only" claim), the audit trail real, and builds options on the real one. Pass 2 of 2.'
runs: 2
max_cost_usd: 1.50
input:
  website: https://pipewright.example
  competitors: ["Flowmason", "Ductly"]
  angle: Mid-market finance teams
---
Today is 2026-11-14. Review our positioning.

The sites below are not reachable from this run. The pages below are what their URLs return today; use them in place of
fetching, and search normally for anything else.

<captured-page url="https://pipewright.example/" captured="2026-11-14T11:00:00Z" untrusted>
<h1>The only finance data pipeline with real-time sync</h1>
<h2>Every journal, payment and invoice, reconciled and audit-ready.</h2>
<p>Pipewright keeps a line-by-line reconciliation audit trail your auditors can open directly.</p>
</captured-page>

<captured-page url="https://pipewright.example/docs/audit-trail" captured="2026-11-14T11:01:00Z" untrusted>
<h1>Reconciliation audit trail</h1>
<p>Updated 2026-09-30. Each synced record keeps its source system, timestamp, transformation and the user who approved
the match. Auditors get read-only access with an export to PDF and CSV.</p>
</captured-page>

<captured-page url="https://flowmason.example/" captured="2026-11-14T11:02:00Z" untrusted>
<h1>Real-time sync for every pipeline</h1>
<h2>Stream changes from 300+ sources to your warehouse in seconds.</h2>
</captured-page>

<captured-page url="https://ductly.example/features" captured="2026-11-14T11:03:00Z" untrusted>
<h1>Ductly features</h1>
<p>Real-time change data capture. Scheduled batch loads. Warehouse-native transformations. Role-based access.</p>
</captured-page>
