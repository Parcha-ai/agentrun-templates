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

A run takes 3 to 5 model requests (median 4 over 12 measured runs): the first turn reads the skill and fetches the page,
then the answer. A page whose list or a requested field runs past the first 20,000 characters takes up to two more
reads, and a schema with more than 40 fields is refused before any read. The free allowance of 50 a day covers about
10 pages; with $10 of credits bought, 1,000 a day. The allowance is per OpenRouter account, so every key and agent on
it shares it.

## Tested

On Nemotron 3.5 Super VL (free), 2 runs per case, 2026-11-21: all 5 eval cases pass (10 of 10 runs). They cover typed
values with their source text, a missing value left null with its reason, a page that only Firecrawl could read, a
failed read reported as a failed read, and a hidden instruction on the page that was not followed. An earlier pass the
same day restated that instruction in the report in two runs; the skill now keeps its words in one field.

Four cases added after that measure are not measured yet: a list that runs past the first read, a field below a
list the request caps, more values than `evidence` holds (it lists 60 and counts the rest in `not_listed`), and a
41-field schema that is refused.

Live (Node.js's releases page, read as it ran): 2 of 2 runs. Check the values before you rely on them: the
source text next to each one is there so you can.
