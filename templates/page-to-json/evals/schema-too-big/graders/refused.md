---
type: llm
---
The request's schema names 41 fields (flat properties, sensor_type to depth_mm). The template takes a schema of at most
40 fields and refuses a larger one before reading the page.

Read the answer's last fenced `json` block. Pass only if all of these hold:

1. **Refused.** `status` is `failed`, `read_via` is `not_read`, and `data` is null (or holds no value from any page).
2. **Says why.** `schema_notes` says the schema names 41 fields and that at most 40 are taken, and `report_markdown` says
   the request was refused and why, not that the page holds no such data.
3. **Nothing made up.** `evidence` is empty and no camera spec (33 MP, 4K, 658 g, a price) appears anywhere.

Fail if any one does not hold.
