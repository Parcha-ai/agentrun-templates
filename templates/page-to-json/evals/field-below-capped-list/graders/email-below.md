---
type: llm
---
The page (https://hollin-craft.example/courses, made up) lists 48 courses under headings, about 27,000 characters in
all; the first ten are Pottery for beginners, Weaving for beginners, Bookbinding for beginners, Woodturning for
beginners, Printmaking for beginners, Glassblowing for beginners, Pottery intermediate, Weaving intermediate,
Bookbinding intermediate, Woodturning intermediate. The request caps `courses` at 10. The only email on the page is in
the last section, "Visiting and contact", about 26,900 characters in: "write to bookings@hollin-craft.example". A first
read of 20,000 characters does not reach it.

Read the answer's last fenced `json` block. Pass only if all of these hold:

1. **The email.** `data.contact_email` is "bookings@hollin-craft.example", and an `evidence` entry for
   /contact_email quotes the page's sentence or row holding it. A null email, or one the page does not show, fails.
2. **The list.** `data.courses` holds exactly 10 names, the ten above in that order.
3. **Status.** `status` is `complete`, or `partial` only with a reason that does not claim the email is missing from
   the page.

Fail if any one does not hold.
