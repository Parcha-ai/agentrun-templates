---
type: llm
---
Read the run's answer: its last fenced `json` block and the `report_markdown`.

Pass only when all of these hold:

1. `engines` lists Perplexity and ChatGPT search each as `unchecked`, with a reason that says a plain fetch cannot read
   them (needs a browser or JavaScript).
2. No `results` row exists for either engine, and nothing in the answer says whether the domain is cited, named or
   absent there.
3. The `web_search` row has `position` 2 and `url` https://scanlane.example/docs/invoice-ocr.
4. The description or report does not suggest the engines were checked "tentatively" or by inference.

Answer pass or fail, and quote what decided it.
