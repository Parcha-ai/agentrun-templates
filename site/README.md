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

Node 24, git, and three pinned dependencies: `marked` for Markdown, and the website's fonts,
`@fontsource/jetbrains-mono` and `@fontsource/inter` (latin 400, 500 and 600, copied into
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
- `measured.json` beside a template's agent.md (`{runs, model, harness, measured_on, passed, live}`) gives the eval
  pass counts per harness. The site shows no cost: a run's cost depends on the owner's model and plan.
- What a template requires (the logo row on its card and page) is read off its agent.md by `requirements()` in
  `lib/describe.mjs`: email tools or an email trigger, Composio toolkits, the GitHub App, monid endpoints, web search
  (Exa), web fetch, a webhook, a schedule. Each logo is a file in `assets/` (`logo-*.svg`, black on transparent; the
  dark theme inverts it). A new toolkit with no logo file shows the generic plug.
- `site/proven-live.json` (`{"<template>": "YYYY-MM-DD"}`) lists the templates someone has run against real accounts.
  A listed template shows a shield logo whose line says against which accounts and when. A template whose tools come
  through Composio and that isn't listed says "Integration not yet proven live" on its page. A name not in the index fails the build.
- The sample output is `samples/<template>/<name>/output.md` when there is one, else the `contentMediaType: text/markdown`
  field (`report_markdown`) of `samples/<template>/<name>/output.json`.
- `samples/<template>/<name>/media/` holds the files a sample run made, with no subfolders: images (.jpg .jpeg .png
  .webp .gif), video (.mp4, H.264), audio (.mp3 .m4a .wav .ogg), captions (.vtt, for the .mp4 with the same
  name), and documents (.md .txt). Any other file there fails the build. A document is a link only: a link to it
  opens the copy, an image token naming it stays text, and one the report never names follows it as its name. The
  server sends it as `text/plain` with `nosniff`, so a browser shows the text and never renders it. The build copies them to `/templates/<template>/samples/<name>/`.
  An image or link in the report whose target is `media/<file>` plays that file on the page: an image, a video
  player with its captions, or an audio player. Files the report never names follow it, each under its name. The
  Markdown twin lists every file by its full URL, and its links, images and reference definitions to `media/<file>`
  point there too. A link may name the captions file; an image token naming it stays text. `check.mjs` holds a template's media to 8 MiB in all and its
  videos to 720p (the shorter side 720 px or less, read from the mp4's `tkhd` box).

`--offline` builds from the cache only. A broken manifest or index entry fails the build with the file and the line.

## Pages

| Path | Page |
| --- | --- |
| `/` | every template, under the tabs (All, Free, each category) and search |
| `/free/` | the templates that prefer a free model (only when there are any) |
| `/templates/<name>/` | one template: install, sample output, what it does, what starts it, inputs, what it needs, evals, source. On a wide screen Install stays in view beside the page |
| `/categories/<category>/` | the templates in one category, same tabs and search (only categories with templates get a page) |
| `/list-your-template/` | how the one-line index pull request works, and the bar |
| `<path>.md` | the Markdown twin of each page |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/search.json`, `/404.html` | |

Package text (instructions, skills, sample reports) is third-party: raw HTML in it renders as text, links keep only
http(s), mailto and in-page targets, and images become links, except a sample's own media files. The server sends a Content-Security-Policy that allows
only this site's own scripts, styles, fonts, images and media, nothing inline, and no framing.

Structured data is `SoftwareApplication` per template: a template is one installable, versioned, licensed package
from a publisher, which is what that type describes. `HowTo` was the other option; Google stopped showing HowTo
results in 2023, and a template page is not a list of steps. Category pages are `CollectionPage` with an `ItemList`,
and every page below the home has a `BreadcrumbList`.

## Look

The site uses agentrun.ai's dark graphite surfaces, orange accents, Inter headings and prose, JetBrains Mono
controls, square marketplace cards and controls, and footer wordmark. Shared onboarding controls keep the website’s styling. It stays dark regardless of the system preference, like the website.
Search matches a template's name, description, tags and what it requires ("slack", "free"); `/` focuses it and
Escape clears it.

Every page renders the same marketing header as the website, including its Platform dropdown, GitHub, Docs,
Blog, Changelog and Cloud links, plus the Get started agent picker. The website owns its markup and CSS; a pinned copy lives in
`vendor/agentrun-website/header.json` and `assets/header.css`. The marketplace renderer only makes website-relative
links absolute so they work from template/category pages. The navigation uses static HTML; the Get started picker and setup dialog use the website’s shared native module.
The logo, agent icons, setup instructions, onboarding styles and module are also pinned and served locally.
The website's optional GitHub stars badge retains its generated hidden state; no third-party runtime request is added.
Gallery pages put “List your template” beside the page title, with category tabs below. Template and listing pages use breadcrumbs, so no second navigation row repeats the marketplace title.

To refresh the shared header from a reviewed website commit:

```sh
node site/sync-website.mjs --source /path/to/agentrun-website --ref <commit>
node site/sync-website.mjs --check
```

The source commit and file hashes are saved in `vendor/agentrun-website/source.json`. Builds verify these hashes,
so edit the website source and sync it instead of independently changing the marketplace header. Regular builds
need no sibling checkout or network access for the header. The sync command reads committed files and leaves
uncommitted website work alone.

No small caps label sits above a page title, and section headings are sentence case at a readable size. A template
page keeps its breadcrumb; no other page has one.

## Install button

It asks once for the reader's AgentRun address (kept in this browser's localStorage under
`agentrun.marketplace.address`, sent nowhere) and opens `<address>/#/templates/install?src=<source>@<sha>`.
Addresses without a scheme use HTTPS, except loopback addresses such as `localhost:7340` and `127.0.0.1:7340`,
which use HTTP. Explicit HTTP or HTTPS is preserved. Use **Change address** to repair an older saved address.

Each template also has an **Install with your agent** dropdown, with its own pinned install prompt. It opens
supported coding apps or copies the prompt for terminal agents, and offers instructions you can read and copy
manually. This uses the shared website's menu styles and icons with a separate marketplace runtime, so the
header's Get started prompt still sets up AgentRun. Without JavaScript the prompt and
`npx @parcha/agentrun template install <source>@<sha> --trust` remain readable.

## Deploy

`site/Dockerfile` (built from the repository root) runs the tests, builds the site at the commit it is given as
`NF_GIT_SHA`, checks it, and serves `dist` with `serve.mjs --prod` on port 8080. The host builds it from main on every
push and routes marketplace.agentrun.ai to it.

The server (`lib/server.mjs`) sends these on every answer, 404s and redirects included:

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; object-src 'none'; frame-ancestors 'none'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, payment and usb off |
| `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy` | `same-origin` |
| `X-Frame-Options` | `DENY` |

Pages are cached 5 minutes, and `/assets/` and sample media a day (CSS and JS carry a `?v=` of their content). It
answers GET and HEAD only, streams files, and answers a single `Range: bytes=` with 206 or 416, which Safari needs
to play video and audio. `.github/workflows/site.yml` runs the same tests, build and check on every pull request and deploys nothing.
