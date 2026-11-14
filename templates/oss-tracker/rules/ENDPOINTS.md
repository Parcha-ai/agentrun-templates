# Endpoints

Pass `max_chars: 4000` on every fetch. `<from90>` is today minus 90 days, `<from30>` today minus 30, as `YYYY-MM-DD`.

## Repository (GitHub)

No GitHub connection: everything is public GitHub, read anonymously with `web_fetch`. Feeds and raw files have no
rate limit; `api.github.com` answers 60 anonymous requests an hour for the whole run (its search, 10 a minute), so it
gets at most 3 calls per project and only for what nothing else serves.

| Metric | Read | Cost |
|---|---|---|
| releases (versions, dates, notes) | `https://github.com/<owner>/<repo>/releases.atom` (no releases: `/tags.atom`) | free |
| recent commits, their authors and dates | `https://github.com/<owner>/<repo>/commits/<default branch>.atom` (the newest 20) | free |
| README, LICENSE, GOVERNANCE, CODEOWNERS, manifests | `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/<path>` | free |
| stars, forks, archived, license, default branch, pushed_at | `https://api.github.com/repos/<owner>/<repo>` | 1 API call |
| contributors over 30 and 90 days, when the feed's 20 commits all fall inside 30 days | `https://api.github.com/repos/<owner>/<repo>/commits?since=<from90>&per_page=100` (one page; more is a lower bound: "at least") | 1 API call |
| open issues and open PRs | `https://github.com/<owner>/<repo>/issues` and `/pulls` (the "Open" counts on the page), else `https://api.github.com/search/issues?q=repo:<owner>/<repo>+is:issue+is:open&per_page=1` (`total_count`) | free, else 1 search call |
| newest issues, for first response | `https://github.com/<owner>/<repo>/issues?q=is:issue+sort:created-desc` | free |
| advisories | `https://github.com/<owner>/<repo>/security/advisories` | free |

`/contributors` counts all-time commits: never use it for 30- or 90-day counts. A `403` or `429` from the API is an
`unreachable` entry (reason `rate_limited`) for the metrics it cost, not a fact about the project. GitLab:
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
