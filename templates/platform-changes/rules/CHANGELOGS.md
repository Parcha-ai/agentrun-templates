# Where vendors publish changes

The log reads this before every run. Edit it like code. A URL that stopped working is replaced here by the one that
works; until then the run finds it again and says so in `platforms_checked`.

## How to read each kind of page

- **A changelog with dated entries** (most APIs): read the newest entries first and stop at the first one older than
  the window. Each entry's own page carries the detail (versions, deadlines, the plans it reaches).
- **A deprecation or sunset table** (model APIs, cloud services): each row has an announcement date, a shutdown date
  and a replacement. A row whose shutdown date changed since the reported list is a development.
- **A feed** (RSS or Atom, `/feed`, `/rss`, `.atom`): smaller than the page; prefer it when the vendor has one.
- **An open source project**: `https://github.com/<owner>/<repo>/releases.atom` for releases, the LICENSE file's
  history (`https://github.com/<owner>/<repo>/commits/<branch>/LICENSE`) for relicensing, and the project's blog or
  foundation announcements for governance.
- **A package registry** (npm, PyPI, crates.io): a deprecation flag or a yanked version, read from the registry's JSON
  (`https://registry.npmjs.org/<pkg>`, `https://pypi.org/pypi/<pkg>/json`).

## Common vendors

| Platform | Changelog | Deprecations, pricing, policy |
|---|---|---|
| Stripe API | `https://docs.stripe.com/changelog` (each API version and its breaking changes) | `https://docs.stripe.com/upgrades`; pricing `https://stripe.com/pricing` |
| OpenAI API | `https://platform.openai.com/docs/changelog` | `https://platform.openai.com/docs/deprecations`; policies `https://openai.com/policies` |
| Anthropic API | `https://docs.anthropic.com/en/release-notes/api` | `https://docs.anthropic.com/en/docs/about-claude/model-deprecations` |
| AWS | What's New `https://aws.amazon.com/new/` (feed `https://aws.amazon.com/about-aws/whats-new/recent/feed/`) | each service's "end of support" page; Lambda runtimes `https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html` |
| Google Cloud | `https://cloud.google.com/release-notes` | `https://cloud.google.com/terms/deprecation` |
| Azure | `https://azure.microsoft.com/en-us/updates/` (retirements are tagged) | the service's retirement notice |
| Vercel | `https://vercel.com/changelog` | pricing `https://vercel.com/pricing` |
| Cloudflare | `https://developers.cloudflare.com/changelog/` | API deprecations `https://developers.cloudflare.com/fundamentals/api/reference/deprecations/` |
| GitHub | `https://github.blog/changelog/` (feed `/feed/`) | deprecations are tagged "deprecation" there |
| Twilio | `https://www.twilio.com/en-us/changelog` | product end-of-life notices on its support site |
| Supabase | `https://supabase.com/changelog` | `https://supabase.com/pricing` |
| Shopify | `https://shopify.dev/changelog` | API versions `https://shopify.dev/docs/api/usage/versioning` |
| Google Maps Platform | `https://developers.google.com/maps/deprecations` | pricing changes announced on the same site |
| Apple / Google Play | `https://developer.apple.com/news/` and `https://android-developers.googleblog.com/` | store policy update pages |

These are starting points, not a promise every page is reachable. A page that answers with a login wall or a bot
challenge is `unreachable` with what it answered.
