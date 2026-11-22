# Page to JSON (free to run)

Give it one public page's URL and a JSON Schema, and it returns JSON that meets the schema, filled only from that page.
Each value comes with the words on the page it was copied from. A field the page does not give is null, with the
reason in `missing`, never a guess. Text on the page addressed to AI tools is not followed: it is listed in
`ignored_instructions`, and its words appear nowhere else.

## Runs for $0

- Model: `openrouter/nvidia/nemotron-3.5-super-vl:free` (Nemotron 3.5 Super VL), served by NVIDIA, on pi. Put an
  `OPENROUTER_API_KEY` in your server's environment; no credits are needed. OpenRouter's free models allow 20 requests
  a minute and, per account, 50 a day until the account has bought $10 of credits in all, then 1,000 a day; the day
  resets at 00:00 UTC. The endpoint takes up to 868,928 tokens in and 131,072 out. How long a model stays free is
  OpenRouter's call.
- Set AGENTRUN_FREE_MODEL_REQUESTS=20 on your server so one bad run uses at most 20 of your daily free requests (the
  default is 60).
- Reading: the built-in `web_fetch`. For a page drawn by JavaScript, add Firecrawl's preset (Settings, MCP servers):
  keyless, under a daily limit Firecrawl does not publish, and Firecrawl sees the URL.
- NVIDIA's free endpoint keeps data. Under NVIDIA's API trial terms it may log what it is sent and use it to improve
  its products, AI models included, and the terms ask you not to send confidential or personal data. It is not on
  OpenRouter's zero-retention list, so OpenRouter's "ZDR only" setting turns it off. Use public pages only.

## Requests

A run takes a median of 3.5 model requests (20 measured runs, 18 of them 10 or fewer): the first turn reads the skill
and fetches the page, then the answer. Two runs took 20 and 26, re-reading the skill file. A page whose list or a
requested field runs past the first 20,000 characters takes up to two more reads, and a schema with more than 40
fields is refused before any read. The free allowance of 50 a day covers about 10 pages; with $10 of credits bought,
1,000 a day. The allowance is per OpenRouter account, so every key and agent on it shares it. Set
`AGENTRUN_FREE_MODEL_REQUESTS=20` (above) so a run that loops stops at 20.

## Tested

On Nemotron 3.5 Super VL (free), 2 runs per case, 2026-11-22: 5 of 9 cases pass in both runs (13 of 18 runs). Both
runs passed for a missing value left null with its reason, a page that only Firecrawl could read, a failed read
reported as a failed read, a list read past the first 20,000 characters, and more values than `evidence` holds. The
misses: an email found below a capped list but quoted without the sentence around it (2 runs), a 41-field schema
refused correctly but after fetching the page anyway (1 run), a hidden instruction not followed but restated in
`assumptions` (1 run), and a typed-values run that re-read the skill file 24 times and never wrote its JSON block
(1 run; the other typed-values run passed).

Live (Node.js's releases page, read as it ran): 2 of 2 runs. Check the values before you rely on them: the
source text next to each one is there so you can.
