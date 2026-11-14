# Channels a plain fetch can read

No browser and no login: a channel behind a login is `not_covered`, and a site that answers a bot check is
`unreachable` with what it answered. Never say a channel had no mentions when you could not read it.

| Channel | Read this | Notes |
|---|---|---|
| News and blogs | `web_search` for `"<company>"` plus a product name or the domain, `n: 10`; open each candidate | the result's date is a lead; the article's own date decides |
| Hacker News | `https://hn.algolia.com/api/v1/search_by_date?query=<company>&tags=(story,comment)&numericFilters=created_at_i><unix from>&hitsPerPage=50` | JSON with `created_at`, `title` or `comment_text`, `author`, `points`, `num_comments`, `objectID`; the item URL is `https://news.ycombinator.com/item?id=<objectID>` |
| Reddit | `https://www.reddit.com/search.json?q=<company>&sort=new&t=week&limit=50` | often answers 403 or 429 to servers: then `unreachable`, and one `web_search` `site:reddit.com "<company>"` as a fallback lead |
| Trustpilot | `https://www.trustpilot.com/review/<domain>?sort=recency` | each review shows a date, a star rating and the reviewer's display name |
| G2, Capterra | `https://www.g2.com/products/<slug>/reviews`, `https://www.capterra.com/p/<id>/<slug>/reviews/` | G2 often answers a bot check: `unreachable` |
| App Store | `https://itunes.apple.com/us/rss/customerreviews/id=<app id>/sortBy=mostRecent/json` | JSON reviews with `updated`, `im:rating`, `title`, `content`, `author` |
| Google Play | the app's page `https://play.google.com/store/apps/details?id=<package>&hl=en` | shows a few recent reviews; dates may be missing: then not counted as new |
| YouTube, podcasts | `web_search` `site:youtube.com "<company>"`, or `"<company>" podcast` | the video or episode page's date decides |
| Status and legal checks | the company's status page; CourtListener `https://www.courtlistener.com/?q="<company>"` | only to check an outage or lawsuit claim, never as a mention on their own |
| X, LinkedIn, TikTok, Instagram, Facebook | none | `not_covered`: they need a login. Say so once in `channels_checked` |
| Glassdoor, Indeed | the company's reviews page | usually a bot check or login wall: `unreachable` |

## Telling the company apart

- A mention is about the company when it names the website or domain, a product name, a named executive, or describes
  what the company does as its site does. Same name, different business (a bakery called "Ledgerly", a crypto token
  "LEDGERLY"): rejected, with why.
- Unsure after reading it: leave it out and put it in `rejected` with "could not tie to <company>".

## What is new

- A mention is new when its own page dates it inside the window. A review site that shows only "3 months ago" or no
  date is not new. An old article that a new post links is not new; the new post is.
- A thread already in the last run is new again only when something developed: the company replied, a reporter picked it
  up, or a claim was confirmed or withdrawn. More points or comments alone is not a development.
