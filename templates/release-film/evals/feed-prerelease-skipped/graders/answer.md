---
type: llm
---
A release-film run started by the release feed trigger on acme/quarry, with include_prereleases off (the default). The
feed item is v3.3.0-rc.1, "Release candidate for 3.3"; GitHub's API marks it `prerelease: true`.

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. `status` is `skipped`, and the answer says v3.3.0-rc.1 is a pre-release that the triggers leave out (or that
   include_prereleases is off).
2. `release.tag` is `v3.3.0-rc.1` and `release.prerelease` is true (or null when the run decided from the feed item
   alone without reading the release).
3. Nothing was made or paid: no `submit_job` call, `film.path` null, `fal_cost_usd.total` 0, no `hyperframes render`.

Answer pass or fail, and quote what decided it.
