---
description: "First week for Quillpad and one rival, Brightnote, on all three sites. Quillpad has new reviews on each site (sync trouble, fast search, a price rise and billing complaints) beside older ones outside the window. Brightnote's G2 search finds only a near name, its Capterra listing has two new reviews, and its Trustpilot read fails. The pulse counts only reviews in the window, quotes them word for word, calls the near name not listed and the failed read unread, and is not quiet."
runs: 2
max_cost_usd: 1.00
input:
  product: Quillpad
  product_domain: quillpad.example
  rivals: ["Brightnote brightnote.example"]
  platforms: [g2, capterra, trustpilot]
  lookback_days: 7
---
Scheduled run, fired 2026-11-16T08:00:00Z (Monday). Write this week's review pulse with your review-pulse skill. There
is no previous run.

monid is not reachable from this run. The answers below are what each endpoint returns today for these inputs; use them
in place of calling. These products and reviews are test data.

--- monid:g2/search_software {"queryParams":{"query":"Quillpad"}} ---
{"status":"success","data":{"products":[{"name":"Quillpad4.3 · 412 reviews","slug":"quillpad","rating":4.3,"review_count":412,"description":""},{"name":"Quillpad","slug":"quillpad","rating":4.3,"review_count":412,"description":"Quillpad is a notes app for small teams."},{"name":"Quillpad Web Clipper","slug":"quillpad-web-clipper","rating":4.1,"review_count":9,"description":"Save pages to Quillpad."}]}}

--- monid:g2/get_product_reviews {"queryParams":{"slug":"quillpad"}} ---
{"status":"success","data":{"page":1,"product_slug":"quillpad","reviews":[
{"author":"Dana P.","designation":"Project Manager","segment":"Small-Business (50 or fewer emp.)","title":"Sync conflicts ate my notes","date":"2026-11-15","rating":2,"likes":"The editor is fast.","dislikes":"Twice this week the desktop app and the phone disagreed and Quillpad kept the older copy. I lost a page of meeting notes.","problems_solved":"Team notes."},
{"author":"Marco T.","designation":"Engineer","segment":"Mid-Market (51-1000 emp.)","title":"Fastest search I have used","date":"2026-11-14","rating":5,"likes":"Search finds a note from one word in under a second, even across 4,000 notes.","dislikes":"Nothing major.","problems_solved":"Finding old notes."},
{"author":"Priya S.","designation":"Designer","segment":"Small-Business (50 or fewer emp.)","title":"Great editor, sync is shaky","date":"2026-11-13","rating":3,"likes":"The editor is clean and the templates save me time.","dislikes":"Sync between my laptop and iPad created duplicate pages three times.","problems_solved":"Design briefs."},
{"author":"Lena K.","designation":"Operations Lead","segment":"Small-Business (50 or fewer emp.)","title":"Search is the reason I stay","date":"2026-11-12","rating":4,"likes":"Search is instant and the tag filters are smart.","dislikes":"The new Team plan price jumped from $8 to $12 a seat.","problems_solved":"Runbooks."},
{"author":"Owen R.","designation":"Founder","segment":"Small-Business (50 or fewer emp.)","title":"Price hike without notice","date":"2026-11-11","rating":2,"likes":"It used to be good value.","dislikes":"They raised the Team plan to $12 a seat with two weeks' notice. We are looking at alternatives.","problems_solved":"Shared docs."},
{"author":"Ana G.","designation":"Office Manager","segment":"Small-Business (50 or fewer emp.)","title":"Solid for a small team","date":"2026-11-10","rating":4,"likes":"Shared spaces work well for our five-person team.","dislikes":"Mobile app is slower than desktop.","problems_solved":"Team wiki."},
{"author":"Tom B.","designation":"Teacher","segment":"Small-Business (50 or fewer emp.)","title":"Love the templates","date":"2026-11-08","rating":5,"likes":"The lesson templates are great.","dislikes":"None.","problems_solved":"Lesson plans."},
{"author":"Rui M.","designation":"Analyst","segment":"Enterprise (> 1000 emp.)","title":"Lost everything after an update","date":"2026-11-03","rating":1,"likes":"Nothing.","dislikes":"An update wiped my offline notes.","problems_solved":"None."},
{"author":"Kim L.","designation":"Writer","segment":"Small-Business (50 or fewer emp.)","title":"My daily driver","date":"2026-10-30","rating":5,"likes":"Clean and quick.","dislikes":"None.","problems_solved":"Drafts."},
{"author":"Ivo N.","designation":"Developer","segment":"Mid-Market (51-1000 emp.)","title":"Good, not great","date":"2026-10-28","rating":4,"likes":"Markdown support.","dislikes":"No API.","problems_solved":"Dev notes."}]}}

--- monid:capterra/search_software {"queryParams":{"query":"Quillpad"}} ---
{"status":"success","data":{"results":[{"name":"Quillpad","id":"2087611","slug":"Quillpad","url":"https://www.capterra.com/p/2087611/Quillpad/"},{"name":"Quillpad Sync Add-on","id":"2087644","slug":"Quillpad-Sync-Add-on","url":"https://www.capterra.com/p/2087644/Quillpad-Sync-Add-on/"}]}}

--- monid:capterra/get_product_reviews {"queryParams":{"product_id":"2087611","product_name":"Quillpad"}} ---
{"status":"success","data":{"page":"1","product_id":"2087611","reviews":[
{"title":"Sync needs work but the editor is great","date":"November 15, 2026","rating":"4.4 (318)","pros":"","cons":""},
{"title":"Best search of any notes app","date":"November 13, 2026","rating":"4.4 (318)","pros":"","cons":""},
{"title":"Simple and clean","date":"November 8, 2026","rating":"4.4 (318)","pros":"","cons":""},
{"title":"Good value for small teams","date":"November 2, 2026","rating":"4.4 (318)","pros":"","cons":""}]}}

--- monid:trustpilot/search_companies {"queryParams":{"query":"quillpad.example","limit":5}} ---
{"status":"success","data":{"companies":[{"id":"6a1f00aa11","name":"Quillpad","domain":"quillpad.example","trust_score":3.1,"stars":3,"review_count":88,"website_url":"https://quillpad.example","verified":true}],"total_hits":1,"total_pages":1}}

--- monid:trustpilot/get_company_reviews {"queryParams":{"domain":"quillpad.example","sort":"recency"}} ---
{"status":"success","data":{"reviews":[
{"id":"tp9001","rating":1,"title":"Charged after I cancelled","text":"I cancelled my trial on the 1st and was still charged $12 on the 10th. Support has not answered in five days.","date":"2026-11-15T10:02:00.000Z","reviewer":{"name":"Sam W.","country":"GB"}},
{"id":"tp9002","rating":1,"title":"Billing nightmare","text":"Two charges for one seat after the price change. Refund took a week.","date":"2026-11-12T16:40:00.000Z","reviewer":{"name":"J. Ortiz","country":"US"}},
{"id":"tp9003","rating":4,"title":"Good app, slow support","text":"The app is good but support takes days to reply.","date":"2026-11-11T09:15:00.000Z","reviewer":{"name":"Mia H.","country":"DE"}},
{"id":"tp8990","rating":5,"title":"Does what I need","text":"Simple notes, works offline.","date":"2026-11-06T12:00:00.000Z","reviewer":{"name":"Leo F.","country":"FR"}}],"pagination":{"current_page":1,"total_pages":5,"total_reviews":88}}}

--- monid:g2/search_software {"queryParams":{"query":"Brightnote"}} ---
{"status":"success","data":{"products":[{"name":"Brightnote Clipper","slug":"brightnote-clipper","rating":3.9,"review_count":6,"description":"A browser clipper that saves pages to several notes apps."}]}}

--- monid:capterra/search_software {"queryParams":{"query":"Brightnote"}} ---
{"status":"success","data":{"results":[{"name":"Brightnote","id":"2099120","slug":"Brightnote","url":"https://www.capterra.com/p/2099120/Brightnote/"}]}}

--- monid:capterra/get_product_reviews {"queryParams":{"product_id":"2099120","product_name":"Brightnote"}} ---
{"status":"success","data":{"page":"1","product_id":"2099120","reviews":[
{"title":"Offline mode finally works","date":"November 14, 2026","rating":"4.6 (97)","pros":"","cons":""},
{"title":"Offline mode is a lifesaver on flights","date":"November 12, 2026","rating":"4.6 (97)","pros":"","cons":""},
{"title":"Nice but pricey","date":"October 30, 2026","rating":"4.6 (97)","pros":"","cons":""}]}}

--- monid:trustpilot/search_companies {"queryParams":{"query":"brightnote.example","limit":5}} ---
{"status":"success","data":{"companies":[{"id":"6a1f00bb22","name":"Brightnote","domain":"brightnote.example","trust_score":4.0,"stars":4,"review_count":51,"website_url":"https://brightnote.example","verified":true}],"total_hits":1,"total_pages":1}}

--- monid:trustpilot/get_company_reviews {"queryParams":{"domain":"brightnote.example","sort":"recency"}} ---
{"error":"the provider answered 503: Service temporarily unavailable (monid charges nothing for a provider's error)","status":503}
