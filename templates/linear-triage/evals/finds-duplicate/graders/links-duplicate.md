---
type: llm
---
ENG-102 (id `11110102-aaaa-4bbb-8ccc-000000000102`) reports that SSO sign-in on Safari 17.4 loops back to the sign-in
page, with steps, expected and actual behaviour, the app version and the browser. The team's open ENG-87 is titled
"Safari: SSO sign-in redirects back to the login page in a loop". ENG-90 (add Google Workspace SSO) shares only the
area.

Read the calls the fake Linear received and the answer's last fenced `json` block. Pass only if all hold:

1. `duplicates` holds ENG-87 with `high` or `medium` confidence; ENG-90, if listed, is `low`.
2. One comment on ENG-102 names ENG-87 as a likely duplicate, asks for nothing (the report is complete), mentions
   nobody with `@`, and doesn't say the issue will be closed or merged.
3. Labels written, if any, are on ENG-102 only: `l-bug` and/or `l-area-auth`, never `l-needs-info` or `l-security`.
4. No `LINEAR_UPDATE_ISSUE` call carries `stateId`, and no write reaches ENG-87 or any issue but ENG-102.

Answer pass or fail, and quote what decided it.
