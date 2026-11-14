# marketplace.agentrun.ai

The static site for the templates in this repository. It reads `.agentrun/marketplace.json` and the packages it
lists, nothing else, and writes plain HTML pages a crawler can read, each with a Markdown twin.

```sh
npm ci --prefix site
node site/build.mjs          # writes site/dist
node site/check.mjs          # titles, descriptions, canonicals, JSON-LD, links, sitemap, llms.txt
node site/serve.mjs          # http://127.0.0.1:7420/, with the production server and headers
npm test --prefix site
```

Node 24, git, and three pinned dependencies: `marked` for Markdown, and the console's fonts,
`@fontsource/jetbrains-mono` and `@fontsource/schibsted-grotesk` (latin 400 and 600, copied into
`dist/assets/fonts` with their OFL licence). A page loads nothing from another origin; `check.mjs` fails the build if
one does.

## What it reads

- A `./templates/<name>` entry comes from disk. Its install link pins the commit the site is built from
  (`--sha`, else `SITE_SHA`, else `git rev-parse HEAD`).
- A `github:<owner>/<repo>[/<path>][@<ref>]` entry (the bundled templates in Parcha-ai/agentrun) comes from GitHub.
  The ref, or the default branch when there is none, resolves to a commit sha with `git ls-remote`, and the files are
  read at that sha through a shallow, blobless git fetch. The install link pins that sha.
- Stars and forks come from the GitHub API at build time, with `GITHUB_TOKEN` when set (the workflow passes it),
  anonymously otherwise. Results are cached in `site/.cache/` for six hours; when
  the API is rate-limited or down the build uses the last cached numbers, or shows none. It never fails on them.
- `measured.json` beside a template's agent.md (`{median_usd, runs, model, harness, measured_on}`) sets the cost per
  run. Without it the page says "Not measured yet" and shows the budget cap.
- `site/proven-live.json` (`{"<template>": "YYYY-MM-DD"}`) lists the templates someone has run against real accounts.
  A template whose tools come through Composio and that isn't listed says "Integration not yet proven live" on its
  page. A name not in the index fails the build.
- The sample output is `samples/<template>/<name>/output.md` when there is one, else the `contentMediaType: text/markdown`
  field (`report_markdown`) of `samples/<template>/<name>/output.json`.

`--offline` builds from the cache only. A broken manifest or index entry fails the build with the file and the line.

## Pages

| Path | Page |
| --- | --- |
| `/` | every template, with search, and the categories |
| `/templates/<name>/` | one template: what it does, what starts it, inputs, setup, what it needs, sample output, cost, evals, source, install |
| `/categories/<category>/` | the templates in one category (only categories with templates get a page) |
| `/list-your-template/` | how the one-line index pull request works, and the bar |
| `<path>.md` | the Markdown twin of each page |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/search.json`, `/404.html` | |

Package text (instructions, skills, sample reports) is third-party: raw HTML in it renders as text, links keep only
http(s), mailto and in-page targets, and images become links. The server sends a Content-Security-Policy that allows
only this site's own script, styles, fonts and images, nothing inline, and no framing.

Structured data is `SoftwareApplication` per template: a template is one installable, versioned, licensed package
from a publisher, which is what that type describes. `HowTo` was the other option; Google stopped showing HowTo
results in 2023, and a template page is not a list of steps. Category pages are `CollectionPage` with an `ItemList`,
and every page below the home has a `BreadcrumbList`.

## Install button

It asks once for the reader's AgentRun address (kept in this browser's localStorage under
`agentrun.marketplace.address`, sent nowhere) and opens `<address>/#/templates/install?src=<source>@<sha>`. Without
JavaScript the page still shows `agentrun template install <source>@<sha>`.

## Deploy

`site/Dockerfile` (built from the repository root) runs the tests, builds the site at the commit it is given as
`NF_GIT_SHA`, checks it, and serves `dist` with `serve.mjs --prod` on port 8080. The host builds it from main on every
push and routes marketplace.agentrun.ai to it.

The server (`lib/server.mjs`) sends these on every answer, 404s and redirects included:

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'; frame-ancestors 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, payment, usb and interest-cohort off |
| `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` | `same-origin` |
| `X-Frame-Options` | `DENY` |

Pages are cached 5 minutes and `/assets/` a day (CSS and JS carry a `?v=` of their content). It answers GET and HEAD
only. `.github/workflows/site.yml` runs the same tests, build and check on every pull request and deploys nothing.
