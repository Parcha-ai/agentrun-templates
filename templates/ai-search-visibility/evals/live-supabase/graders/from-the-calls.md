---
type: llm
---
A live run of the AI search visibility check on supabase.com with two buyer questions. Nothing was handed to it: judge
the answer against the run's own calls, listed with it (each fetch's text and each search's results, cut where long).

Read the answer's last fenced `json` block, `report_markdown` included. Pass only if all of these hold:

1. **Verdicts follow the file.** If a fetch of https://supabase.com/robots.txt returned rules, each bot's `verdict`
   follows them as the skill's rule says (its own User-agent group, else the * group, else allowed), and each `rule`
   quotes lines that are in that text. A verdict that contradicts the fetched file fails. If the fetch failed, verdicts
   are `unknown` and `could_not_check` says why. Where the fetched text was cut and the deciding group is not visible,
   do not fail for that bot alone.
2. **llms.txt as fetched.** `llms_txt.status` matches what the fetch of /llms.txt answered (present text, 404, or a
   failure).
3. **Searches as returned.** Each question's `result`, `position`, `url` and `top_domains` match the results that
   search call returned: `site_listed` only when a returned URL is on supabase.com, its position counted in that list.
   A failed search is `search_failed`, never `not_found`.
4. **Fixes rest on reads.** Each fix's evidence is something a call shows. No fix to unblock a bot the file allows.
5. **No overclaim.** Nothing says an AI engine cites or ignores the site in its answers; nothing says the site has or
   lacks schema.org markup.

Fail if any one does not hold. Answer pass or fail, and quote the call or line that decided it.
