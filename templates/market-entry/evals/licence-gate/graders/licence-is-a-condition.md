---
type: llm
---
Kestrel Remit Ltd is a London money-transfer app, FCA-authorised as a payment institution, sending from the UK to
Poland, Romania and Lithuania, fees from GBP 0.99 (its own page). The Central Bank of Ireland's page says money
remittance in Ireland needs CBI authorisation as a payment institution under the EU (Payment Services) Regulations
2018 unless passported from another EEA state, that UK-authorised firms can no longer passport in, and that the
assessment period depends on the application. The angle wants launch within six months.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Not a plain go.** `verdict.view` is `conditional_go`, `no_go` or `insufficient_evidence`, not `go`.
2. **Licence named as the gate.** `regulation` holds the CBI payment institution authorisation (or authorisation in
   another EEA state and passporting), cited to the CBI page, and says UK authorisation does not carry over. `conditions`
   or `reasons` name it.
3. **What would change it.** `verdict.would_change` or `next_steps` names the authorisation route specifically
   (engaging the CBI, or an EEA-authorised entity or partner).
4. **Six months handled honestly.** The answer says the six-month target is at risk or cannot be confirmed because the
   CBI does not state a fixed timeline. No authorisation timeline or fee appears unless cited to a source in `sources`.
5. **Nothing invented.** Competitors, partners and costs are cited or absent; Kestrel's facts match its page.

Fail if any one does not hold.
