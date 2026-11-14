# Sources

Where each fact comes from. JSON APIs first: they are small and dated. Pass `max_chars` on every fetch. Replace
`<name>`, `<version>`, `<owner>/<repo>` as written; URL-encode a scoped npm name (`@scope/pkg` is `%40scope%2Fpkg`) and
a deps.dev project key (`github.com%2F<owner>%2F<repo>`).

## Across ecosystems

| Fact | Source |
|---|---|
| Versions with publish dates, default version | `https://api.deps.dev/v3/systems/<system>/packages/<name>` (system: `npm`, `pypi`, `cargo`, `maven`, `go`, `nuget`, `rubygems`) |
| A version's licenses, advisory keys, repository link | `https://api.deps.dev/v3/systems/<system>/packages/<name>/versions/<version>` |
| An advisory | `https://api.deps.dev/v3/advisories/<GHSA id>`, `https://api.osv.dev/v1/vulns/<id>`, `https://github.com/advisories/<GHSA id>` |
| Advisories against a package | `https://api.github.com/advisories?ecosystem=<npm\|pip\|rust\|maven\|go\|nuget\|rubygems\|composer>&affects=<name>&per_page=30`, then `https://osv.dev/list?ecosystem=<Ecosystem>&q=<name>` |
| Project: stars, forks, open issues, Scorecard | `https://api.deps.dev/v3/projects/<project key>` |
| Scorecard detail | `https://api.securityscorecards.dev/projects/github.com/<owner>/<repo>` |
| Support windows | `https://endoflife.date/api/<product>.json` (only listed products) |
| License as curated | `https://api.clearlydefined.io/definitions/<type>/<provider>/<namespace or ->/<name>/<version>` |

## Registries

| Ecosystem | Metadata | Downloads |
|---|---|---|
| npm | `https://registry.npmjs.org/<name>/latest` (never the whole document: it can be megabytes) | `https://api.npmjs.org/downloads/point/last-week/<name>`, `.../last-month/<name>` |
| PyPI | `https://pypi.org/pypi/<name>/<version>/json` (the unversioned one lists every release file: read with `max_chars`) | `https://pypistats.org/api/packages/<name>/recent` |
| crates.io | `https://crates.io/api/v1/crates/<name>` | in the same answer (`downloads`, `recent_downloads`) |
| Go | `https://proxy.golang.org/<module>/@v/list`, `.../@latest`, `https://pkg.go.dev/<module>` | none published |
| Maven Central | `https://search.maven.org/solrsearch/select?q=g:<group>+AND+a:<artifact>&core=gav&rows=20&wt=json` | none published |
| RubyGems | `https://rubygems.org/api/v1/gems/<name>.json`, `https://rubygems.org/api/v1/versions/<name>.json` | in the gem answer |
| NuGet | `https://api.nuget.org/v3-flatcontainer/<id lowercased>/index.json` | the package page on nuget.org |
| Packagist | `https://repo.packagist.org/p2/<vendor>/<package>.json` | `https://packagist.org/packages/<vendor>/<package>/stats.json` |

A registry's deprecation field (npm `deprecated`, PyPI yanked files, crates.io yanked versions, Packagist `abandoned`)
is a fact to report with its exact text.

## Repository (GitHub)

No GitHub connection: everything is public GitHub, read anonymously with `web_fetch`. Feeds and raw files have no
rate limit; `api.github.com` answers 60 anonymous requests an hour for the whole run, so it gets at most 4 calls per
package (the alternatives share them) and only for what nothing else serves.

- Free: `https://github.com/<owner>/<repo>/releases.atom` (versions, dates, notes; no releases: `/tags.atom`),
  `https://github.com/<owner>/<repo>/commits/<default branch>.atom` (the newest 20 commits, authors and dates), and
  `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/<path>` for LICENSE, SECURITY.md, CHANGELOG, GOVERNANCE.md,
  `.github/FUNDING.yml`, manifests and lockfiles. Open issues and PRs: the "Open" counts on
  `https://github.com/<owner>/<repo>/issues` and `/pulls`.
- 1 API call: `https://api.github.com/repos/<owner>/<repo>` for `archived`, `pushed_at`, `license`, `stargazers_count`,
  `default_branch`.
- 1 to 3 more, only when needed: `https://api.github.com/repos/<owner>/<repo>/commits?since=<YYYY-MM-DD>&per_page=100`
  for the 12-month committer count when the feed's 20 commits are all recent (one page; a full page means "at least");
  `https://api.github.com/search/issues?q=repo:<owner>/<repo>+is:issue+is:open&sort=created&order=asc&per_page=5` for
  the oldest open issues; `https://api.github.com/repos/<owner>/<repo>/contributors?per_page=20` (all-time: never the
  12-month count).

A `403` or `429` from the API is a gap to name, not a fact about the project. GitLab and Codeberg: their own API
(`https://gitlab.com/api/v4/projects/<owner>%2F<repo>`, `https://codeberg.org/api/v1/repos/<owner>/<repo>`).
