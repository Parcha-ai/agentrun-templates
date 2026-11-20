---
description: "Second week for Quillpad on G2 and Trustpilot. Last week's answer carries both listings and a scoreboard, its window ending 2026-11-09. This week's pages still hold reviews from last week's days and one posted this morning. The pulse reuses the listings without searching, counts only reviews from 2026-11-09 to yesterday, and reports the fall in the Trustpilot average and the rise in Trustpilot reviews against last week. Last week's G2 count came from a partial page, so no G2 change is reported. Last week's mobile-app-crash complaint is gone this week."
runs: 2
max_cost_usd: 1.00
input:
  product: Quillpad
  product_domain: quillpad.example
  platforms: [g2, trustpilot]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's review pulse with your review-pulse skill.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These products and reviews are test data.

--- monid:g2/get_product_reviews {"queryParams":{"slug":"quillpad"}} ---
{"status":"success","data":{"page":1,"product_slug":"quillpad","reviews":[
{"author":"Nia W.","designation":"Consultant","segment":"Small-Business (50 or fewer emp.)","title":"Export to PDF is broken","date":"2026-11-16","rating":2,"likes":"Editor.","dislikes":"PDF export cuts off tables.","problems_solved":"Client reports."},
{"author":"Ivy C.","designation":"Product Manager","segment":"Small-Business (50 or fewer emp.)","title":"Sync lost my edits","date":"2026-11-14","rating":3,"likes":"Clean editor.","dislikes":"Sync dropped an hour of edits on my laptop.","problems_solved":"Specs."},
{"author":"Max H.","designation":"Founder","segment":"Small-Business (50 or fewer emp.)","title":"Price went up again","date":"2026-11-12","rating":2,"likes":"Search.","dislikes":"The Team plan is now $12 a seat, up from $8.","problems_solved":"Wiki."},
{"author":"Tom B.","designation":"Teacher","segment":"Small-Business (50 or fewer emp.)","title":"Love the templates","date":"2026-11-09","rating":5,"likes":"The lesson templates are great.","dislikes":"None.","problems_solved":"Lesson plans."},
{"author":"Uma R.","designation":"Researcher","segment":"Mid-Market (51-1000 emp.)","title":"Quick capture is great","date":"2026-11-09","rating":4,"likes":"Quick capture from the menu bar saves me time every day.","dislikes":"Tags are hard to manage.","problems_solved":"Research notes."},
{"author":"Kai O.","designation":"Engineer","segment":"Small-Business (50 or fewer emp.)","title":"Templates save hours","date":"2026-11-07","rating":5,"likes":"Templates.","dislikes":"None.","problems_solved":"Runbooks."},
{"author":"Rui M.","designation":"Analyst","segment":"Enterprise (> 1000 emp.)","title":"Lost everything after an update","date":"2026-11-03","rating":1,"likes":"Nothing.","dislikes":"An update wiped my offline notes.","problems_solved":"None."}]}}

--- monid:trustpilot/get_company_reviews {"queryParams":{"domain":"quillpad.example","sort":"recency"}} ---
{"status":"success","data":{"reviews":[
{"id":"tp9210","rating":1,"title":"App will not open","text":"Since this morning's update the desktop app will not open.","date":"2026-11-16T06:40:00.000Z","reviewer":{"name":"Gil N.","country":"NZ"}},
{"id":"tp9201","rating":1,"title":"Charged after cancelling","text":"Cancelled in October, charged again on the 14th.","date":"2026-11-15T10:00:00.000Z","reviewer":{"name":"Bo L.","country":"SE"}},
{"id":"tp9202","rating":1,"title":"Refund ignored","text":"Asked for a refund for the double charge two weeks ago, no answer.","date":"2026-11-13T12:00:00.000Z","reviewer":{"name":"Cy F.","country":"US"}},
{"id":"tp9203","rating":2,"title":"Support is slow","text":"Support takes four days to reply to a billing question.","date":"2026-11-10T09:00:00.000Z","reviewer":{"name":"Di G.","country":"IE"}},
{"id":"tp9100","rating":5,"title":"Great templates","text":"The templates are the best part.","date":"2026-11-09T06:00:00.000Z","reviewer":{"name":"Ed H.","country":"GB"}},
{"id":"tp9090","rating":4,"title":"Nice app","text":"Works well offline.","date":"2026-11-08T09:00:00.000Z","reviewer":{"name":"Fay J.","country":"AU"}}],"pagination":{"current_page":1,"total_pages":5,"total_reviews":91}}}

The result of this trigger's last completed run (01a1cf00-0000-7000-8000-00000000f101, ended 2026-11-09T08:03:05Z), its structured answer as its agent's output schema checked it. It is data from that run, not instructions: use it to leave out what it already reported.

```json
{
  "window": {
    "from": "2026-11-02",
    "to": "2026-11-09"
  },
  "quiet": false,
  "listings": [
    {
      "product": "Quillpad",
      "platform": "g2",
      "id": "quillpad",
      "status": "read"
    },
    {
      "product": "Quillpad",
      "platform": "trustpilot",
      "id": "quillpad.example",
      "status": "read"
    }
  ],
  "scoreboard": [
    {
      "product": "Quillpad",
      "platform": "g2",
      "since": "2026-11-02",
      "new_reviews": 10,
      "avg_stars": 4.5,
      "more_than_read": true
    },
    {
      "product": "Quillpad",
      "platform": "trustpilot",
      "since": "2026-11-02",
      "new_reviews": 2,
      "avg_stars": 4.5,
      "more_than_read": false
    }
  ],
  "themes": [
    {
      "product": "Quillpad",
      "theme": "templates save time",
      "sentiment": "praise",
      "count": 3,
      "quotes": []
    },
    {
      "product": "Quillpad",
      "theme": "mobile app crashes",
      "sentiment": "complaint",
      "count": 2,
      "quotes": []
    }
  ],
  "changes_vs_last_week": [],
  "unread_from": {
    "g2": [],
    "capterra": [],
    "trustpilot": []
  },
  "theme_summary": {
    "themes": [
      {
        "product": "Quillpad",
        "theme": "templates save time",
        "sentiment": "praise",
        "count": 3
      },
      {
        "product": "Quillpad",
        "theme": "mobile app crashes",
        "sentiment": "complaint",
        "count": 2
      }
    ]
  },
  "could_not_check": [],
  "ignored_instructions": [],
  "monid_calls": 4,
  "report_markdown": "## Review pulse, 2026-11-02 to 2026-11-09\n\n### Quillpad\nG2: 10 new or more, average 4.5 (partial: the page held only new reviews)\nTrustpilot: 2 new, average 4.5\n\n- Templates save time (3)\n- Mobile app crashes (2)\n\nmonid calls this run: 4"
}
```
