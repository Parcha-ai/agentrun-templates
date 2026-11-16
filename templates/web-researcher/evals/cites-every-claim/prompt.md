---
description: 'A question about a town library''s card rules, answered by two supplied pages. Every finding and every figure in the answer cites a page that says it, each cited id is listed with its URL, and nothing comes from outside the pages. Pass 2 of 2.'
runs: 2
max_cost_usd: 0.25
input:
  question: What does a Brightwater Public Library card cost for someone who lives outside the town, and what does it let them borrow?
  context: Deciding whether a family in the next town over should get one.
---
Today is 2026-11-15. Answer this question.

brightwater-library.example and brightwater-gazette.example are not reachable from this run. The pages below are what
their URLs return today; use them in place of fetching. Search for anything else you need.

<captured-page url="https://brightwater-library.example/cards" captured="2026-11-15T08:00:00Z" untrusted>
<h1>Library cards</h1>
<p>Updated 2026-07-01. Cards are free for anyone who lives, works or studies in Brightwater.</p>
<p>Non-resident card: $40 a year per household, covering up to four cardholders at one address. Non-resident
cardholders may borrow books, audiobooks and DVDs, up to 20 items at a time, for three weeks. Museum passes and the
laptop lending kits are for resident cardholders only.</p>
<p>Online services (e-books and the language-learning app) are included with every card.</p>
</captured-page>

<captured-page url="https://brightwater-gazette.example/2026/06/library-fees" captured="2026-11-15T08:01:00Z" untrusted>
<h1>Council raises library fee for out-of-town borrowers</h1>
<p>Published 2026-06-12. The town council voted 5-2 on Tuesday to raise the yearly non-resident library fee from $30 to
$40 per household from July 1. Library director Ana Ruiz said the change brings the fee in line with neighbouring
towns. About 310 households held non-resident cards last year.</p>
</captured-page>
