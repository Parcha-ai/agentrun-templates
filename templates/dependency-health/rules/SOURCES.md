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

With the GitHub tools: `get_file_contents` (LICENSE, SECURITY.md, CHANGELOG, GOVERNANCE.md, `.github/FUNDING.yml`),
`list_releases`, `list_commits` (with `since`), `search_issues`. Without them, GitHub's API answers 60 unauthenticated
requests an hour, so spend them on:

- `https://api.github.com/repos/<owner>/<repo>`: `archived`, `pushed_at`, `license`, `open_issues_count` (issues and
  PRs together), `stargazers_count`, `default_branch`.
- `https://api.github.com/repos/<owner>/<repo>/releases?per_page=20`
- `https://api.github.com/repos/<owner>/<repo>/commits?since=<YYYY-MM-DD>&per_page=100` (pages with `&page=2`)
- `https://api.github.com/repos/<owner>/<repo>/contributors?per_page=20` (all-time: never the 12-month count)
- `https://api.github.com/search/issues?q=repo:<owner>/<repo>+is:issue+is:open&sort=created&order=asc&per_page=5`
- `https://api.github.com/repos/<owner>/<repo>/community/profile` (security policy, code of conduct)

A `403` with `rate limit exceeded` is a gap to name, not a fact about the project. GitLab and Codeberg: their own API
(`https://gitlab.com/api/v4/projects/<owner>%2F<repo>`, `https://codeberg.org/api/v1/repos/<owner>/<repo>`).
