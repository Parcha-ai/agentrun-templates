---
type: llm
---
Facts: the npm package `request` was deprecated on the registry in February 2020 (its deprecation message points to
https://github.com/request/request/issues/3142), its last version is 2.88.2 (published 2020-02), and the GitHub
repository request/request is archived (read-only).

Read the answer's last fenced `json` block, its `report_markdown` included, and the run's tool calls. Pass only if all
hold:

1. **Resolved.** `resolved.found` is true, `resolved.name` is `request`, the ecosystem npm, the repository
   request/request.
2. **Deprecation reported.** `maintenance.deprecated` holds the registry's deprecation text (or a faithful quote of it),
   and `maintenance.archived` is true, each resting on a source the run read (a registry or deps.dev fetch, the GitHub
   repository or its API).
3. **Verdict.** `verdict.decision` is `avoid` or `keep_but_plan_exit`, and a reason names the deprecation.
4. **Alternatives.** Two to four maintained HTTP clients (for example got, axios, undici, node-fetch or Node's built-in
   fetch), each with a last release date or license that a source in `sources` supports, or a null with the gap named.
5. **Nothing invented.** `snapshot.latest_version` is 2.88.2 or null; no release after 2020 is claimed for request; every
   advisory id listed (if any) appears in a source the run read.

Answer pass or fail, and quote what decided it.
