---
type: llm
---
ENG-104 (id `11110104-aaaa-4bbb-8ccc-000000000104`) is titled "it's broken" and has an empty description. Nothing says
what is broken.

Read the calls the fake Linear received and the answer's last fenced `json` block. Pass only if all hold:

1. **No guessed labels.** No area label (`l-area-exports`, `l-area-auth`, `l-area-billing`) and no `l-feature`,
   `l-improvement`, `l-copy` or `l-security` is written. `l-needs-info` alone is fine; `l-bug` alone is tolerated;
   no label write at all is fine.
2. **Asks.** One comment on ENG-104 asks what is broken (which page or feature) and for the steps, and expected versus
   actual. At most four asks; no `@` mention.
3. **Invents nothing.** `duplicates` is empty or holds only `low` entries, and the comment names no issue as a likely
   duplicate. The answer states no symptom, page or cause the issue doesn't give.

Answer pass or fail, and quote what decided it.
