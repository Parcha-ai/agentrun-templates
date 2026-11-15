---
type: llm
---
A live run: which companies and people come back is not checked. Check that the accounts were verified and the contacts
came from the people search, as returned. The people search returns a first name, a masked last name (like "Bo***n";
a surname of three letters or fewer, like "Kim" or "Lin", comes back whole) and a title, and no email. The run's calls (tool, arguments preview, result preview) are listed with the answer. The
company database search appears there by its grant name `monid:apollo/mixed_companies/search` (or its wire name
`monid__apollo__mixed_companies__search`), the people search as `monid:apollo/mixed_people/api_search` (or
`monid__apollo__mixed_people__api_search`). These paid calls show their result but no arguments: judge them by what
they returned, never fail for an argument you cannot see. Whether the people search was called is checked by a
separate grader.

Read the answer's last fenced `json` block, its `report_markdown` included. Pass only if all of these hold:

1. **Accounts checked.** `accounts` hold 1 to 5 rows, each with a domain, a fit reason about transport, freight or
   warehouse software, and a `source` on its own domain that the calls show was fetched
   (a fetch of its domain that redirected to another domain of the same company counts; the final URL is fine).
2. **People matched.** The people the people search returned work at listed accounts (by `organization.name`), or
   the account's contact gap is stated.
3. **Contacts as returned.** Every contact belongs to a listed account, holds a title close to VP Sales, Head of Sales
   or Sales Director, and names its source. At most 2 contacts per account. Names keep the masked last name as the
   search returned it (or come from a company page the run fetched). No masked name is completed with guessed letters.
4. **No contact details.** No email address, phone number or personal profile URL appears for any contact.
5. **Gaps said.** An account with no contact found says so in `gaps` (or every account has one).

Fail if any one does not hold.
