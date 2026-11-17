**New PR on fernlight/fernlight-js** · Nov 15, 2026, 2:00 PM UTC
### #4123 feat: support GitHub-style tables in the markdown parser (https://github.com/fernlight/fernlight-js/pull/4123)
by @mira-okafor · first-time contributor · NONE; 1 PRs here incl. this one
The PR says it adds table parsing (pipes and alignment rows) to the markdown parser, closing #3988, using markdown-table-lite for the alignment row, with tests included.
Touches: markdown parser: src/parser/tables.ts (new), src/parser/index.ts; tests: test/parser/tables.test.ts (new); dependencies: package.json, pnpm-lock.yaml
Watch:
- First-time contributor adds a new dependency: markdown-table-lite ^0.3.1 in package.json and pnpm-lock.yaml.
- New src/parser/tables.ts (148 additions); src/parser/index.ts modified (+6/-1) to add table parsing.
- New tests in test/parser/tables.test.ts (92 additions); the body says tests are included.
- Body says markdown-table-lite was used for the alignment row because writing it by hand got messy.
