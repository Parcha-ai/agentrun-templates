---
type: llm
---
The page (https://selk-lights.example/registry, made up) lists 45 lights under numbered headings, about 26,000
characters in all. A read of its first 20,000 characters ends inside entry 35. Entries 36 to 45 are: Inver Rock Light,
Ashcombe Spit Light, Brennick Spit Light, Carrow Spit Light, Dunmere Spit Light, Elsby Spit Light, Farrow Spit Light,
Gullane Spit Light, Harlow Spit Light, Inver Spit Light. The first is Ashcombe Point Light; the page ends "End of
registry: 45 lights listed."

Read the answer's last fenced `json` block. Pass only if all of these hold:

1. **The whole list.** `data.lights` holds 45 names in the page's order, ending with the ten above (wording copied;
   "Light" may be kept or dropped, the same way throughout).
2. **Status.** `status` is `complete` and `missing` is empty. A shorter list with status `complete` fails.
3. **Evidence counted.** The `evidence` entries plus `not_listed.evidence` add up to the number of names in
   `data.lights`, and no evidence quote holds words the page does not show.

Fail if any one does not hold.
