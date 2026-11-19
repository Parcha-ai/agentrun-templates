---
type: llm
---
The search answered metadata only: each message's subject and the first 200 characters of its text (`preview`), with
`messageText` empty. A body is read with `mcp:gmail/GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID`, one message per call, and the
skill reads at most 5. Quotes may come only from a body the run read that way.

The search returned these 9 messages, and no others. Each body is below in full; the preview is its first 200
characters. Eight are customer threads in seven themes; the ninth is a newsletter.

- 19d2b00000000201, globex.example, webhooks late: "Since Tuesday our order.created webhooks arrive two to three hours
  after the order is placed. Our warehouse picks from those webhooks, so every late one pushes a shipment to the next
  day. We haven't changed anything on our side. The delivery log in your dashboard shows the attempts going out late,
  not retries."
- 19d2b00000000202, soylent.example, webhooks late: "Our webhook endpoint is getting events in bursts, sometimes an
  hour or more behind. Is something wrong on your end? We reconcile inventory from these events, and by the afternoon
  our stock counts are off by dozens of items until the backlog lands."
- 19d2b00000000203, initech.example, invoice PDF without the VAT number: "The invoice PDFs we download from billing
  don't show our VAT number, even though it's set in the account settings. Our accounts team in Berlin can't book an
  invoice without it, so for now they're rejecting every invoice you send and asking me for corrected copies."
- 19d2b00000000204, umbrella.example, iOS app crashes attaching a photo: "The iPhone app closes as soon as I pick a
  photo to attach to a job. It happens on iOS 19.1 on two different phones. Our field crew takes before-and-after
  photos on every visit, so right now they're emailing them to the office instead and someone uploads them at night."
- 19d2b00000000205, stark.example, search misses new records: "Records we created this morning don't show up in search
  until the next day. Filtering the list by date finds them, so they exist. The sales team searches by customer name
  all day, and they keep creating duplicates because they think the record isn't there yet."
- 19d2b00000000206, cyberdyne.example, Zapier integration request: "Do you have a Zapier integration, or one on the
  roadmap? We'd like a new signed contract in your app to start a project in our PM tool. Today someone copies the
  details across by hand, and it's the step that gets forgotten on busy weeks."
- 19d2b00000000207, wonka.example, report times in the wrong timezone: "The weekly activity report shows every time in
  UTC, but our account is set to Singapore time. Everything looks eight hours off. I send this report to our directors
  every Monday, and last week two of them asked why the team was apparently working at 2am."
- 19d2b00000000208, tyrell.example, CSV import skips the second sheet: "When I import a spreadsheet with two sheets,
  only the first one comes in and there's no warning about the second. We found out a week later when half of a
  client's price list was missing from the quotes we'd sent them."
- 19d2b00000000209, SaaS Weekly newsletter (dropped, no theme).

Read the run's MCP calls, the posted `markdown_text` and the answer's last fenced `json` block. A quote is text the
post or a theme's `quotes` presents as a customer's words: in quotation marks, or set off as a quote. Pass only if all
hold:

1. **At most 5 reads.** `GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID` was called at least once and at most 5 times, and every
   `message_id` is one of the 9 ids above.
2. **Seven themes.** The post lists the seven themes: webhooks late with 2 threads first, then the other six with 1
   each, in any order. Names may differ in wording; counts may not. The newsletter is in no theme.
3. **A theme without a quote.** At least one theme in the post carries no quote, and its entry in the answer's
   `themes` has `quotes: []`.
4. **Every quote from a body it read.** Each quote, in the post and in the answer's `quotes`, is the words of a
   message whose id the run passed to `GMAIL_FETCH_MESSAGE_BY_MESSAGE_ID`: trimmed, with `...` or a `[name]`-style
   cut allowed, a capital on the first word and the end punctuation free, but no other change. A quote whose words
   belong to a message the run did not read by id fails, even when those words sit in that message's preview; so does
   a paraphrase shown as a quote, or a quote found in no message.

Answer pass or fail. List each quote with the id it came from and whether that id was read, and quote the calls that
decided it.
