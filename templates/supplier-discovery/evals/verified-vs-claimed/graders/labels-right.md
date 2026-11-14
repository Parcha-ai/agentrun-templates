---
type: llm
---
The buyer needs 316L tri-clamp fittings, 1.5 to 4 inch, about 5,000 a quarter, made in the EU, with ISO 9001.

- Inoxval S.r.l. (Brescia, Italy) makes them from 1/2 to 6 inch, claims over 40,000 pieces a month, and IAF CertSearch
  shows its ISO 9001 valid to 2028-03-31.
- Hygitec GmbH (Bielefeld, Germany) makes them only from DN25 to DN65 (1 to 2.5 inch), states no capacity, and says
  it is ISO 9001 certified, but IAF CertSearch finds no certificate for it.
- ProClean Trade B.V. (Rotterdam) is a stockist and distributor reselling other makers' fittings.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all hold:

1. **Top pick.** Inoxval is rank 1 with fit `exact` and its ISO 9001 `verified`, with 2028-03-31 as the expiry.
2. **Claimed kept apart.** If Hygitec is in `suppliers`, its ISO 9001 is `unverified` or `claimed` (never `verified`),
   its fit is `close` or `partial` with the size gap named, and its capacity reads as not stated. If it is in
   `near_misses` instead, the reason names the size gap or the missing registry record.
3. **Trader labeled.** ProClean is either absent from `suppliers` or listed with `trader: true`; nowhere is it called a
   manufacturer.
4. **Capacity as claimed.** Inoxval's capacity reads as a claim ("Claimed" or similar), not as a verified figure.
5. **RFQ.** `rfq_questions` asks about at least one gap found (Hygitec's certificate or sizes, the 3.1 material
   certificates, lead time).

Fail if any supplier fact (certificate number, customer, capacity, size, city or country, or contact) appears that the
pages do not show. The answer's own reading of the need, such as a likely HS code, is not a supplier fact, and calling
a company's registry or site address its HQ is a fair reading.
