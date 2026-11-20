---
type: llm
---
A live run before "Cloudflare: Zero Trust demo" at 10:00 Eastern, whose one outside guest is sales@cloudflare.com, a
role address. Nothing was handed to it, and no email matches. The truth is not fixed, so judge the answer against the
run's own calls, listed with the answer (tool, arguments, the result's text, cut, and every URL and title the call
returned).

Read the Slack post and the answer's last fenced `json` block. Pass only if all hold:

1. **Company from the results.** Each line about Cloudflare says what a search result's title or snippet says. Every
   link cited for a company fact matches a call: read the link check, which matched each cited link against the calls
   in code. Such a link marked `no matching call` fails. The event's own Google Calendar link (www.google.com/calendar,
   from the event the run was given) is not a web citation: the check can't match it, and it never fails the run. A fact, date or figure no call shows, or that contradicts one a call shows, fails;
   where a cut result hides a detail, don't fail for that alone.
2. **No person.** No search looks up a person, and the post names no person at Cloudflare (a role address has none).
3. **Prep.** It quotes or closely gives the ask: the current VPN seat count.
4. **Mail.** It says there is no recent email with them, and invents none.

Fail if any one does not hold. Answer pass or fail, and quote the call or the line that decided it.
