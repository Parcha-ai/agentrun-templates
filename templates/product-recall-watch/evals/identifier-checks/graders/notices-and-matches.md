---
type: llm
---
The window is 2026-11-09 to 2026-11-16. Three notices match the watched entries:

- FDA recall F-0388-2027, Class II, Kestrel Foods, Inc., Kestrel Oat Crunch Granola Maple Almond 12 oz, UPC 0 12345 67890 1,
  "Lot 24-118, Lot 24-119, Lot 24-121", best by 2027-03-01 through 2027-03-20; undeclared peanut; 18,240 bags; reported
  2026-11-12, initiated 2026-11-05; do not eat, return for a refund, consumer line 1-800-555-0142.
- CPSC recall 27015 (2026-11-13), Brightwell BW-200 Video Baby Monitor parent units manufactured January 2025 through
  June 2025 (date inside the battery door); about 41,000 units; 14 overheating reports, 2 minor burns; stop using,
  free replacement battery pack, 888-555-0190 or www.brightwell.example/recall.
- NHTSA Preliminary Evaluation PE26-014, opened 2026-11-10, into liftgate struts on the 2024 Northline Roamer. It is an
  investigation; there is no recall (the recall lookup returned 0).

The reader holds "LOT 24-118" (an exact match on the Kestrel recall), "LOT 24-11" (a lookalike: not a listed lot) and
"BW-200 serial 2205-8812" (the CPSC notice defines the recalled units by a manufacture date printed inside the battery
door, not by serial, so the serial cannot settle it). A Pinecrest Kids dresser recall matches no entry.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Kestrel.** A notice from FDA for Kestrel with `status` `class_ii_recall`, recall number F-0388-2027, `affected`
   holding the three lots as printed (and the best-by range or UPC), and identifier checks: "LOT 24-118" `match`,
   "LOT 24-11" `no_match`.
2. **Brightwell.** A CPSC notice for the BW-200 that gives the January 2025 to June 2025 manufacture range, the counts as
   the notice states them (14 reports, 2 minor burns, about 41,000 units) and the free battery pack remedy. The serial
   check is `cannot_tell` (or plainly says the serial cannot settle it and the reader must read the date label); it is
   never `match`.
3. **Northline.** The Roamer item has `status` `investigation`, and neither the item nor `report_markdown` calls it a
   recall (saying "not a recall" or "investigation" is right).
4. **Scope.** No Pinecrest dresser notice.
5. **Sources.** Each notice's `source_url` is the regulator's page or API answer (fda.gov / api.fda.gov, cpsc.gov or
   CPSC's saferproducts.gov API, nhtsa.gov), never news.
6. `report_markdown` leads with the Kestrel lot match.

Fail if any count, lot or date appears that the notices do not print, or if "LOT 24-11" is called a match.
