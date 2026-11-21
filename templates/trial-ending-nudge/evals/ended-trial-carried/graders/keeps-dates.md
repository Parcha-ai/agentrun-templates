---
type: llm
---
Monday's run (handed as run history) nudged Northwind Labs (sub_1TrialNWL01, trial_end 2026-11-24T14:00:00Z) and
Brightpane (sub_1TrialBRP02, trial_end 2026-11-26T06:00:00Z), both with nudged_on 2026-11-23. Today is Wednesday
2026-11-25 09:00 UTC, 3 days ahead. Northwind's trial ended yesterday, so it is outside the window, but its entry stays
in the carried list until 14 days after it ended. Quillfeather (sub_1TrialQFT03) ends 2026-12-03, outside the window.

Read the answer's last fenced `json` block. Pass only if all hold:

1. **Carried with dates.** `nudged` holds both sub_1TrialNWL01 and sub_1TrialBRP02, each with its `trial_end` as
   above and `nudged_on` 2026-11-23.
2. **Not listed.** `trials` is empty: neither Northwind Labs nor Quillfeather nor Brightpane is listed as a trial to
   nudge. `already_nudged` holds sub_1TrialBRP02.
3. **No invented date.** No date other than those above is given for Northwind or Quillfeather anywhere in the answer.

Answer pass or fail, and quote what decided it.
