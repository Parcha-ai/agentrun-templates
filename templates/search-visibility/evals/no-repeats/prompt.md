---
description: The previous report is handed in; this week one query dropped from 5 to 9 and nothing else moved. The report names that mover and does not restate last week's table as news.
runs: 3
max_cost_usd: 0.60
---
Scheduled weekly run, fired 2026-11-16T07:00:00Z (Monday). Check the search visibility of scanlane.example for the
watch list with your visibility skill.

The search tools are not reachable from this run. What `web_search` returns today is below; use it in place of
searching. The previous report is below.

--- The result of this trigger's last completed run ---
```json
{"run_date":"2026-11-09","domain":"scanlane.example","locale":"en-US","quiet":false,"engines":[{"engine":"web_search","status":"checked"}],"results":[{"query":"invoice ocr api","engine":"web_search","status":"ranked","position":5,"url":"https://scanlane.example/docs/invoice-ocr","features":[],"top_domains":[{"domain":"readwise-ocr.example","url":"https://readwise-ocr.example/invoice-api","position":1}],"change":"no_baseline","change_by":null,"evidence_url":"web_search:invoice ocr api"},{"query":"invoice ocr pricing","engine":"web_search","status":"ranked","position":3,"url":"https://scanlane.example/pricing","features":[],"top_domains":[{"domain":"readwise-ocr.example","url":"https://readwise-ocr.example/pricing","position":1}],"change":"no_baseline","change_by":null,"evidence_url":"web_search:invoice ocr pricing"}],"movers":[],"gaps":[],"next_actions":[],"report_markdown":"First baseline."}
```

--- web_search "invoice ocr api" (2026-11-16) ---
1. https://readwise-ocr.example/invoice-api  Invoice OCR API.
2. https://docparse.example/ocr  DocParse.
3. https://invoicekit.example/api  InvoiceKit API docs.
4. https://blog.example/best-invoice-ocr-apis  Best invoice OCR APIs.
5. https://devto.example/invoice-ocr  Invoice OCR in Python.
6. https://github.example/awesome-ocr  Awesome OCR.
7. https://stackqa.example/q/123  Invoice totals.
8. https://docparse.example/pricing  DocParse pricing.
9. https://scanlane.example/docs/invoice-ocr  Scanlane invoice OCR API reference.
10. https://scanlane.example/blog/invoice-ocr  How Scanlane reads invoices.

--- web_search "invoice ocr pricing" (2026-11-16) ---
1. https://readwise-ocr.example/pricing  Readwise pricing.
2. https://docparse.example/pricing  DocParse pricing.
3. https://scanlane.example/pricing  Scanlane pricing.
4. https://invoicekit.example/pricing  InvoiceKit pricing.
