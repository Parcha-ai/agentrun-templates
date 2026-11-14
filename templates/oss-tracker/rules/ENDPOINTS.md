# Endpoints

Pass `max_chars: 4000` on every fetch unless a row says otherwise. `<from90>` is today minus 90 days, `<from30>` today minus 30, as `YYYY-MM-DD`.

## Repository (GitHub)

No GitHub connection: everything is public GitHub, read anonymously with `web_fetch`. Feeds, raw files, deps.dev and
github.com pages have no hourly cap. `api.github.com` answers 60 anonymous requests an hour per IP address, shared by
every agent on the same AgentRun host, so it gets at most 3 calls per project (first response takes 2; open PRs take
1 only when the pulls page fails), and only for what nothing else serves.

| Metric | Read | Cost |
|---|---|---|
| stars, forks, license | `https://api.deps.dev/v3/projects/github.com%2F<owner>%2F<repo>` (`starsCount`, `forksCount`, `license`) | free |
| open issues | `https://github.com/<owner>/<repo>/issues` (the "Open" count). deps.dev's `openIssuesCount` counts open PRs too: use it only when the page fails, and say so | free |
| archived, default branch | `https://github.com/<owner>/<repo>` (the "archived" banner; the branch picker) | free |
| releases (versions, dates, notes) | `https://github.com/<owner>/<repo>/releases.atom` (no releases: `/tags.atom`) | free |
| commits, for contributors over 30 and 90 days and the top author's share | `https://github.com/<owner>/<repo>/commits/<default branch>.atom`, 20 newest per page; read on with `?page=2`, `3`... until an entry is older than `<from90>`, at most 25 pages (more: the counts are "at least", and `how_counted` says so). A page of 20 entries runs past 4000 characters: pass `max_chars: 12000` here | free |
| README, LICENSE, GOVERNANCE, CODEOWNERS, manifests | `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/<path>` | free |
| open PRs | `https://github.com/<owner>/<repo>/pulls` (the "Open" count), else `https://api.github.com/search/issues?q=repo:<owner>/<repo>+is:pr+is:open&per_page=1` (`total_count`) | free, else 1 API call |
| first response on new issues | `https://api.github.com/repos/<owner>/<repo>/issues?state=all&sort=created&direction=desc&per_page=10` (the newest 10, PRs dropped), then `https://api.github.com/repos/<owner>/<repo>/issues/comments?sort=created&direction=asc&since=<oldest one's created_at>&per_page=100`: each issue's first comment whose `author_association` is OWNER, MEMBER or COLLABORATOR, against the issue's `created_at` | 2 API calls |
| advisories | `https://github.com/<owner>/<repo>/security/advisories` | free |

`/contributors` counts all-time commits: never use it for 30- or 90-day counts. A `403` or `429` from the API, or a
`429` from a github.com page or feed, means GitHub's anonymous limit is spent: the metric is null, its `how_counted`
(or the project's `unreachable` entry) says "not counted: GitHub's anonymous limit", and after an API `403` no call
goes to the API for the rest of the run. Never guess the number. GitLab:
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
