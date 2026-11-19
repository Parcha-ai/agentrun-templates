# Status pages

## How to read each kind

- **Atlassian Statuspage** (footer "Powered by Atlassian Statuspage"): `<page>/api/v2/incidents.json` lists the last 50
  incidents with `created_at`, `resolved_at`, `impact`, `components` and every update's text and time, in one small
  JSON answer. Each incident's own page is `<page>/incidents/<id>`. Try the JSON first on any status page you don't
  know: a 404 means another provider.
- **incident.io** and **instatus** pages: `<page>/history` with `max_chars: 6000` and `offset: 1`; each incident has its
  own page.
- **The clouds** have their own feeds (below). Their post-incident reviews live apart from the status page.
- A status page with no history view: the vendor's engineering blog, support notices or changelog, searched once.

## Common vendors

| Vendor | Status and history | Postmortems |
|---|---|---|
| AWS | `https://health.aws.amazon.com/health/status` (current); history in the same dashboard | Post-Event Summaries: `https://aws.amazon.com/premiumsupport/technology/pes/` |
| Google Cloud | `https://status.cloud.google.com/incidents.json` (every incident, with `begin`, `end`, `affected_products`, `currently_affected_locations`) | each incident's page links its analysis |
| Azure | `https://azure.status.microsoft/en-us/status/history/` | Post Incident Reviews on the same page |
| Cloudflare | `https://www.cloudflarestatus.com/api/v2/incidents.json` | `https://blog.cloudflare.com/tag/post-mortem/` |
| GitHub | `https://www.githubstatus.com/api/v2/incidents.json` | monthly availability reports: `https://github.blog/tag/github-availability-report/` |
| GitLab | `https://status.gitlab.com` | incident issues linked from each incident |
| Atlassian (Jira, Confluence, Bitbucket) | `https://status.atlassian.com` and each product's page | `https://www.atlassian.com/engineering` |
| Datadog | `https://status.datadoghq.com/api/v2/incidents.json` (US1; other sites have their own page) | linked from the incident |
| Twilio | `https://status.twilio.com/api/v2/incidents.json` | linked from the incident |
| Stripe | `https://status.stripe.com` | linked from the incident |
| Okta | `https://status.okta.com` | root cause analyses linked from the incident |
| Slack | `https://slack-status.com/api/v2.0.0/history` | linked from the incident |
| Vercel | `https://www.vercel-status.com/api/v2/incidents.json` | linked from the incident |
| npm | `https://status.npmjs.org/api/v2/incidents.json` | linked from the incident |
| MongoDB Atlas | `https://status.mongodb.com/api/v2/incidents.json` | linked from the incident |

A vendor not listed: find its official status page once (the vendor's own domain or its hosted page linked from the
vendor's site), test `/api/v2/incidents.json`, and name what worked in `vendors_checked`.

## Corroboration, never the source

Cloudflare Radar's outage center (`https://radar.cloudflare.com/outage-center`), ThousandEyes outage reports,
Downdetector, StatusGator, IsDown, Hacker News, r/sysadmin and r/devops, and the trade press (The Register,
BleepingComputer, Data Center Dynamics). Use them to find an incident the status page underplays, then cite the
vendor's page for its facts and label anything else as a user report or as the outlet's claim.
