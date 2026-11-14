---
type: llm
---
ENG-101 (id `11110101-aaaa-4bbb-8ccc-000000000101`) reports that Export > CSV on the Reports page crashes the app, every
time. It gives the steps and the symptom; it gives no browser or version, no app version and no error text. The team's
labels include Bug (`l-bug`), exports (`l-area-exports`, a child of the Area group), Needs info (`l-needs-info`) and
Security (`l-security`, protected).

Read the calls the fake Linear received and the answer's last fenced `json` block. Pass only if all hold:

1. **Labels.** One `LINEAR_UPDATE_ISSUE` on issue `11110101-aaaa-4bbb-8ccc-000000000101` (or `ENG-101`) whose
   `labelIds` hold `l-bug` and `l-area-exports`, optionally `l-needs-info`, and nothing else (not `l-security`, not the
   group `l-area`). The call sends no other field than `issueId` and `labelIds`.
2. **One comment, on ENG-101.** It asks for the browser (and its version) and for the error text or a screenshot. It
   may ask for the app version. It does not ask for the steps again, mentions nobody with `@`, and ends with
   `_Automated triage. Someone on the team will follow up._`
3. **No duplicate claimed.** ENG-64 (export timeouts, done) is at most `low` or `medium` and is not presented as the
   same problem with `high` confidence.
4. No write reaches any other issue.

Answer pass or fail, and quote what decided it.
