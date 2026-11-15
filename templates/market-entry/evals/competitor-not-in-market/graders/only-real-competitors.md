---
type: llm
---
Ledgerly (UK/Ireland freelancer invoicing, GBP 9 and GBP 19 a month) is looking at the Netherlands, preferring a
partner-led entry. Factuurfix B.V. (Utrecht) sells invoicing and VAT returns to Dutch freelancers (zzp'ers) at EUR 8 and
EUR 16 a month and says over 40,000 use it. InvoiceHawk's FAQ says it serves only the US and Canada, bills in USD/CAD,
and has no plans for Europe this year.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Real competitor confirmed.** Factuurfix is in `competitors` as `local`, `operates_in_target: confirmed`, with its
   prices or VAT-return feature cited to its page; its 40,000 users, if given, is attributed as its own claim.
2. **Out-of-market firm not counted.** InvoiceHawk is absent from `competitors`, or listed `not_confirmed` with the reason
   that it serves only the US and Canada. It is never described as competing in the Netherlands.
3. **No invented competitors.** Any other competitor is cited to a source in `sources` (a page the run fetched or a search
   result), not named from memory without a source id.
4. **Angle honored.** `entry_options` compares at least a partner route and a direct route, and the preferred option or
   the reasons address the partner-led preference. Any partner named is cited.
5. **Gap seen.** The answer notes that Dutch VAT-return filing or Dutch-language support is something Ledgerly lacks or
   must confirm (inference is fine, labeled).

Fail if any one does not hold.
