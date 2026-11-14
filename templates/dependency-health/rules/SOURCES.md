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
| Advisories against a package | `https://github.com/advisories?query=type%3Areviewed+ecosystem%3A<npm\|pip\|rust\|maven\|go\|nuget\|rubygems\|composer>+affects%3A<name>` (the public database page, not the API), then `https://osv.dev/list?ecosystem=<Ecosystem>&q=<name>` |
| Project: stars, forks, license, Scorecard | `https://api.deps.dev/v3/projects/<project key>` (`starsCount`, `forksCount`, `license`, `scorecard`; its `openIssuesCount` counts PRs too) |
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

No GitHub connection: everything is public GitHub, read anonymously with `web_fetch`. Feeds, raw files, pages and
deps.dev have no hourly cap. `api.github.com` answers 60 anonymous requests an hour per IP address, shared by every
agent on the same AgentRun host, so the whole check (package and alternatives together) gets at most 2 API calls, and
only for what nothing else serves.

- Stars, forks, license, Scorecard: deps.dev's project endpoint (above).
- Archived, default branch: `https://github.com/<owner>/<repo>` (the "archived" banner; the branch picker).
- Releases: `https://github.com/<owner>/<repo>/releases.atom` (versions, dates, notes; no releases: `/tags.atom`).
- Commits: `https://github.com/<owner>/<repo>/commits/<default branch>.atom`, 20 newest per page (authors and dates;
  pass `max_chars: 12000`); read on with `?page=2`, `3`... until an entry is older than 12 months, at most 10 pages
  (more: the committer count is "at least").
- Files: `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/<path>` for LICENSE, SECURITY.md, CHANGELOG,
  GOVERNANCE.md, `.github/FUNDING.yml`, manifests and lockfiles.
- Open issues and PRs: the "Open" counts on `https://github.com/<owner>/<repo>/issues` and `/pulls`. The oldest open
  issues: `https://github.com/<owner>/<repo>/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-asc`.
- API, only when a page above fails: `https://api.github.com/search/issues?q=repo:<owner>/<repo>+is:issue+is:open&sort=created&order=asc&per_page=5`
  for the oldest open issues (1 call), and `https://api.github.com/repos/<owner>/<repo>` for `archived` and
  `default_branch` (1 call). `/contributors` counts all-time commits: never the 12-month count.

A `403` or `429` from the API, or a `429` from a github.com page or feed, means GitHub's anonymous limit is spent: the
fact is a gap, named "not counted: GitHub's anonymous limit" in `gaps`, never a guess and never a fact about
the project. After an API `403`, no more API calls this run. GitLab and Codeberg: their own API
(`https://gitlab.com/api/v4/projects/<owner>%2F<repo>`, `https://codeberg.org/api/v1/repos/<owner>/<repo>`).
