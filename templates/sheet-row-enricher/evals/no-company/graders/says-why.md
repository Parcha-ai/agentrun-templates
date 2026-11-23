---
type: llm
---
Row 9's company cell is blank; only the owner column says "Dana". Read the answer's last fenced `json` block. Pass
only if `action` is `skipped`, `filled` is empty, `write.ok` is false, and `skipped` or `report_markdown`
says the row names no company. It must not treat "Dana" as a company or claim it wrote anything.
