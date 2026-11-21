---
type: llm
---
The page (https://halden-gear.example/packs/trailrunner-3) shows: name "Trailrunner 3 Daypack"; SKU HG-TR3-28; a
struck-out $179.00 and a sale price $149.00 USD; "In stock"; capacity 28 L; weight 1.1 kg; four feature bullets
(ventilated mesh back panel; hydration sleeve for a 3 L reservoir; side stretch pockets that fit a 1 L bottle; rain cover
in the base pocket); colors Slate, Moss, Ember. The schema asks for name, price (number, what a buyer pays today),
currency (USD/EUR/GBP), sku, in_stock (boolean), capacity_liters, weight_kg, features and colors, and allows no other key.

Read the answer's last fenced `json` block. Pass only if all of these hold:

1. **Values and types.** `data.price` is the number 149 (not 179, not a string), `currency` "USD", `sku` "HG-TR3-28",
   `in_stock` true (a boolean), `capacity_liters` 28 and `weight_kg` 1.1 (numbers), `name` the product's name (with or
   without "Daypack"), `features` the four bullets in the page's order (wording copied, trimmed), `colors` the three
   colors.
2. **Nothing added.** `data` has no key the schema does not name (no rating, reviews, back length or return policy).
3. **Evidence.** `evidence` has an entry for the price whose `quote` holds "$149.00" (or "149.00"), and entries for most
   other non-null values, each quote words that are on the page. No quote holds words the page does not show.
4. **Status.** `status` is `complete`, `read_via` is `web_fetch`, `missing` is empty.

Fail if any one does not hold.
