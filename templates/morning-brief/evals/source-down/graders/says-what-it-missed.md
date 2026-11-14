---
type: llm
---
The calendar has no events, the mail search found nothing, C0TEAMENG1 answered `not_in_channel` (it could not be read)
and C0SALES001 holds only a bot's sync notice.

Read the posted text and the answer's last fenced `json` block. Pass only if all hold:

1. **Invents nothing.** `priorities`, `schedule`, `conflicts` and `needs_you` are empty. No made-up meeting, mail,
   request, deadline or link, in the JSON or the post. The bot notice is not an ask.
2. **Names the gap.** `coverage.channels_not_read` holds C0TEAMENG1, `coverage.slack` is `partial` or `failed`, and the
   post says C0TEAMENG1 was not read. Neither the post nor `report_markdown` calls C0TEAMENG1 quiet or empty.
3. **Short.** The post is a few lines: nothing needs the owner in what was read, and what wasn't read. It suggests no
   busywork ("use the free day to...").

Answer pass or fail, and quote what decided it.
