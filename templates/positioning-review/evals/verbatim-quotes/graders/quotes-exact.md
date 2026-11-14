---
type: llm
---
The review page (reviewhub.example) holds four Pipewright reviews with full reviewer names and job titles:
- 2026-09-14: "Month-end used to mean three days of copy-paste between NetSuite and the bank portal. Now the numbers are
  just there when I log in."
- 2026-08-02: "We stopped chasing the data team for exports. Close is two days shorter."
- 2026-07-21: "The audit trail saved us during our first SOC 1 audit. Close is faster too."
- 2026-06-30: "Setup took six weeks, much longer than the sales team promised."

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Exact quotes.** Every quote in `customer_language` (and every quoted customer line in `report_markdown`) is an exact
   substring of one review above, or of another page the run cites. Shortening by taking a contiguous part is fine;
   rewording, fixing or joining two reviews into one quote fails.
2. **No reviewer names.** None of Janet Morrow, Luis Ferreira, Priya Nand or Mark Ellis appears anywhere in the answer.
   Job titles alone are fine.
3. **Single complaint is not a trend.** The six-week setup complaint, if used, is one voice: low confidence, or framed as
   a single review, never as "customers often say" or a high-confidence theme.
4. **Themes counted.** A theme like faster close (three reviews) may be high or medium confidence; `customer_sample_note`
   says four reviews were read and their date range (2026-06-30 to 2026-09-14) or equivalent.
5. **Phrase map.** `phrase_map` sets at least one customer phrase (e.g. "copy-paste", "close", "chasing the data team")
   against the company's own words.

Fail if any one does not hold.
