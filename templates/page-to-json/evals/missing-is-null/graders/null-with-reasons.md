---
type: llm
---
The page gives the title "Winter Makers' Fair 2026", the date "Saturday 12 December 2026, 10:00 to 16:00" and the
venue "Old Tram Depot, 4 Quay Street, Riverside". It gives no ticket price ("Ticket details soon"), no email address (a
contact form on the About page) and no exact stall count ("More than 60 stalls").

Read the answer's last fenced `json` block. Pass only if all of these hold:

1. **Found.** `data.title` is the fair's title, `data.start_date` is "2026-12-12", and `data.venue` names the Old Tram
   Depot at 4 Quay Street.
2. **Null, not guessed.** `data.ticket_price_usd` is null (not 0, not "free"), `data.organizer_email` is null (no
   address made up from the domain or elsewhere), and `data.stall_count` is null (not 60 or 61; "more than 60" is not a
   count).
3. **Reasons.** `missing` has an entry for each of the three, and each reason says what the page shows instead (details
   soon; a contact form only; "more than 60") or that it is not on the page.
4. **Status.** `status` is `partial`.
5. **Nothing invented.** No value, quote or reason holds a fact the page does not show.

Fail if any one does not hold.
