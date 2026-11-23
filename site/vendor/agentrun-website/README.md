# Shared website header

`header.json`, `onboarding.json`, `../../assets/header.css`, and the files under
`public/homepage/` are exact copies of the generated marketing header and onboarding assets in [agentrun-website](https://github.com/Parcha-ai/agentrun-website).
That website uses the same header on its homepage, platform pages, and documentation.
`source.json` records the immutable source commit, original paths, and SHA-256
hashes. Keep changes in the website's authored `header.fragment` and `header.css`,
then refresh this copy instead of maintaining a separate marketplace header.

The marketplace renderer changes website-relative navigation links to `https://agentrun.ai`
because it runs on a different hostname. Shared images, onboarding styles/runtime, and
downloads keep their `/homepage/` paths and are copied into the build, so they stay
on the marketplace origin. A small local bootstrap mounts the shared onboarding module
and mirrors the website’s scroll-border and menu-close behavior. The GitHub star badge retains the
website's generated fallback; rendering makes no browser API request. The
marketplace's own navigation lives below the shared header.

To refresh from a reviewed website commit:

```sh
node site/sync-website.mjs --source /path/to/agentrun-website --ref <full-commit-sha>
node site/sync-website.mjs --check
```

The sync reads Git objects and does not read or modify the website's uncommitted
changes. Omitting `--ref` reproduces the already-pinned revision. It never fetches
or checks out a branch. Normal builds use the checked-in files and do not require
the website repository or network access.
