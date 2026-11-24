---
type: llm
---
A live news-show run on the real fal, started by hand, topic "programming language releases", feeds
https://blog.rust-lang.org/feed.xml, https://blog.python.org/feeds/posts/default, https://www.php.net/feed.atom,
https://www.ruby-lang.org/en/feeds/news.rss and https://bun.sh/rss.xml, the anchor generated (Rowan, voice Aria),
max_fal_usd 4.

Read the run's calls (the pages it fetched, its `submit_job` calls) and the answer's last fenced `json` block. Pass
only if all hold:

1. **Stories.** Three stories, each a different event, each with the URL of a page the run read with `web_fetch`, each
   dated (by its feed item or its page) within 7 days before the run's date. When the run had fewer than three fresh
   ones from the feeds it searched the topic (at most 3 `web_search` calls).
2. **Only the pages' facts.** Every figure, version number, date, name and quote in a story's script, its
   `on_screen` items and its chyron is on that story's own page as written; no derived figure, no opinion, no
   prediction. Chyrons are at most 40 characters.
3. **Script.** Nine segments in order, each `script` equal to the `text` of its voice's `submit_job`, at most 245
   spoken words in all; the cold open's first or second sentence says the anchor or show is AI-generated and
   `disclosure.spoken_by_s` is at most 10; `disclosure.on_screen_from_s` is 0.
4. **Show.** `status` is `completed` (or `partial` naming a failed fal step in fal's words); `film.path` is
   `media/show.mp4`, 1920x1080, `film.seconds` between 80 and 115.
5. **Cost.** `fal_cost_usd.steps` lists each paid call with units and rates from `get_pricing` (Fabric's seconds the
   voices' lengths rounded up); `total` is their sum, between 2.3 and 3.4.
6. **Files and memory.** `files` names the show, its captions, the share card, the still, the nine voices and the
   animated clips; `stories_shown` is today's three dated the run's date; `report_markdown` embeds the show first and
   links each story's page.

Answer pass or fail, and quote what decided it.
