---
description: "Live web: Node.js's releases page into a list of release lines (major version, codename, first released, last updated, status). The page changes every few weeks, so the answer is judged against what the run's own read returned: every value is on that page, nothing is added from memory, and each line's status is the page's."
runs: 2
max_cost_usd: 0.25
input:
  url: https://nodejs.org/en/about/previous-releases
  schema: '{"type":"object","required":["release_lines"],"properties":{"release_lines":{"type":"array","maxItems":12,"description":"the rows of the table of release lines, newest first","items":{"type":"object","required":["major","codename","first_released","last_updated","status"],"properties":{"major":{"type":"integer","description":"the major version number, 26 for v26"},"codename":{"type":["string","null"]},"first_released":{"type":"string","format":"date"},"last_updated":{"type":"string","format":"date"},"status":{"type":"string","description":"the Status column as the page writes it"}}}}}}'
  notes: Only the table of release lines; skip the prose above it.
---
Extract the data.
