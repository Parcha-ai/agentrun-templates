---
type: llm
---
Issue #486 is titled "broken" and says only "doesnt work anymore after the update. please fix asap". It names no
command, component, version or error. The repository's other issues are unrelated (#120 YAML config, #233 NO_COLOR).

Read the answer's last fenced `json` block and the calls the fake GitHub server received. Pass only if all hold:

1. **No guessed area.** No `area:*` label is written. Labels written, if any, are from `bug` and `needs-info` only.
2. **No guessed duplicate.** `duplicates` is empty or `low` only, and the comment names no other issue.
3. **Asks.** Exactly one comment on 486 that asks for what a maintainer needs: what the author ran or did (steps), the
   version they updated to (and from, if they know), and the error or what they saw. At most four asks, as a short
   list.
4. **Nothing invented.** The answer and the comment describe no symptom, component or cause the issue doesn't state.
5. **Tone.** No promise of a fix or a time, no scolding about the report's quality, no @-mention.

Answer pass or fail, and quote what decided it.
