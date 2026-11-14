# Endpoints

Pass `max_chars: 4000` on every fetch. `<from90>` is today minus 90 days, `<from30>` today minus 30, as `YYYY-MM-DD`.

## Repository (GitHub)

GitHub's public API, read with `web_fetch`. It answers 60 unauthenticated requests an hour, so spend them on these:

| Metric | Call |
|---|---|
| stars, forks, archived, license, open issues + PRs together, pushed_at | `https://api.github.com/repos/<owner>/<repo>` |
| releases | `https://api.github.com/repos/<owner>/<repo>/releases?per_page=20` (no releases: `/tags?per_page=20`, dated by their commits) |
| commits for contributors and bus factor | `https://api.github.com/repos/<owner>/<repo>/commits?since=<from90>&per_page=100`, then `&page=2` while full |
| open issues alone | `https://api.github.com/search/issues?q=repo:<owner>/<repo>+is:issue+is:open&per_page=1` (`total_count`) |
| open PRs alone | `https://api.github.com/search/issues?q=repo:<owner>/<repo>+is:pr+is:open&per_page=1` |
| newest issues, for first response | `https://api.github.com/repos/<owner>/<repo>/issues?state=all&sort=created&direction=desc&per_page=10`, then each one's `comments_url` only when needed |
| advisories | `https://api.github.com/repos/<owner>/<repo>/security-advisories` or `https://github.com/<owner>/<repo>/security/advisories` |

`/contributors` counts all-time commits: never use it for 30- or 90-day counts. A `403` with "rate limit exceeded" is
an `unreachable` entry (reason `rate_limited`) for the metrics it cost, not a fact about the project. GitLab:
`https://gitlab.com/api/v4/projects/<owner>%2F<repo>` and `/repository/commits?since=`. Codeberg:
`https://codeberg.org/api/v1/repos/<owner>/<repo>`.

## Registries

| Ecosystem | Downloads | Daily series |
|---|---|---|
| npm | `https://api.npmjs.org/downloads/point/last-week/<name>` | `https://api.npmjs.org/downloads/range/last-month/<name>` |
| PyPI | `https://pypistats.org/api/packages/<name>/recent` | `https://pypistats.org/api/packages/<name>/overall?mirrors=false` |
| crates.io | `https://crates.io/api/v1/crates/<name>` (`recent_downloads` is 90 days) | `https://crates.io/api/v1/crates/<name>/downloads` |
| RubyGems | `https://rubygems.org/api/v1/gems/<name>.json` (all-time) | none |
| Packagist | `https://packagist.org/packages/<vendor>/<name>/stats.json` | in the same answer |
| Maven, Go | none published: say so | |

deps.dev ties a package to its repository and gives dependents and the Scorecard:
`https://api.deps.dev/v3/systems/<system>/packages/<name>` and `https://api.deps.dev/v3/projects/github.com%2F<owner>%2F<repo>`.

## Spikes

Hacker News: `https://hn.algolia.com/api/v1/search?query=<project>&tags=story&numericFilters=created_at_i>=<unix from>`.
Reddit and social: one `web_search` (`n: 5`), cited only for when and where the spike started.
