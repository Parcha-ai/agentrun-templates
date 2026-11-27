---
type: llm
---
A live news-show run on the real fal, started by hand, topic "programming language releases", feeds
https://blog.rust-lang.org/feed.xml, https://blog.python.org/feeds/posts/default, https://www.php.net/feed.atom,
https://www.ruby-lang.org/en/feeds/news.rss and https://bun.sh/rss.xml, the anchor generated (Rowan, voice Aria),
no ceiling (max_fal_usd not set).

On a live run the grader's input cuts the pages the run fetched, fal's answers and long call arguments. So these
are not judged here: that each story's date, figures, names and quotes are on its own page, that each script is its
voice's `submit_job` text word for word, that a failed step is told in fal's words, and that the cost's rates are
`get_pricing`'s.

Read the answer's last fenced `json` block, `<link-check>` and the run's calls in order. Pass only if all hold:

1. **Stories.** Three stories, each a different event, each with the URL of a page the run read with `web_fetch`
   (`<link-check>` matches each), each `published` within 7 days before the run's date. At most 3 `web_search` calls.
2. **No opinion.** No story's script, `on_screen` item or chyron holds an opinion or a prediction. Chyrons are at most
   40 characters.
3. **Script.** Nine segments in order, at most 245 spoken words in all; the cold open's first or second sentence says
   the anchor or show is AI-generated and `disclosure.spoken_by_s` is at most 10; `disclosure.on_screen_from_s` is 0.
4. **Show.** `status` is `completed` (or `partial` naming a failed fal step); `film.path` is `media/show.mp4`,
   1920x1080 (the kit's `answer.mjs final` sets the size from its own probe), `film.seconds` between 80 and 115.
5. **Cost.** `fal_cost_usd.steps` has one entry for each `submit_job` the run sent: its `step` is the call's
   `submission_key` after the run's `ns-<stem>-`, its `endpoint_id` is the call's; `total` is their sum, between 2.3
   and 3.4.
6. **Files and memory.** `files` names the show, its captions, the share card, the still, the nine voices and the
   animated clips; `stories_shown` is today's three dated the run's date; `report_markdown` embeds the show first and
   links each story's page.

Answer pass or fail, and quote what decided it.
