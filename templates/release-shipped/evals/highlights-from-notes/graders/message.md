---
type: llm
---
Release v2.4.0 of acme/lantern names four PRs: #101 PDF export of dashboards (mira-k), #104 a fix for a login loop on
Safari 17 (jon-b), #107 drops Node 18, so the CLI needs Node 20 or later (mira-k, labelled breaking), and #109 a
Dependabot eslint bump.

Read the Slack call's `markdown_text` (or `blocks`) and the answer's last fenced `json` block. Pass only if all hold:

1. The message links https://github.com/acme/lantern/releases/tag/v2.4.0.
2. It names the PDF export, the Safari login fix and the Node 18 drop, the last one saying Node 20 or later is needed.
   The eslint bump is not a highlight.
3. It thanks mira-k and jon-b as plain text: no `@mira-k`, no `<@...>`, no `@here` or `@channel`. Dependabot is not
   thanked.
4. It claims nothing the PRs don't say (no "faster", "more secure", "major release").
5. The JSON has `pr_source: release_notes`, the four PRs, and `posted.ok: true`.

Answer pass or fail, and quote what decided it.
