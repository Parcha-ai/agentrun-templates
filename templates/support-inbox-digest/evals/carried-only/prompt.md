---
description: "The owner's schedule runs Monday and Thursday at 09:00 and 15:00. Thursday 15:00's digest was a heavy one (a checkout outage: 20 urgent threads, 20 themes with quotes), its answer over 32 KiB, so Monday's run is handed its carried fields alone: window, theme_counts (CSV export 1, SSO login 2, 18 more themes) and open_urgent (the Initrode lockout and 19 outage threads), nothing dropped. Monday's digest counts only mail after Thursday 15:00: CSV export 3 (last week 1), billing question 1, and the Initrode lockout as still open since Nov 12, not new; open_urgent keeps every carried thread, oldest first."
runs: 3
max_cost_usd: 1.10
---
Scheduled run. Write the support digest with your support-digest skill and post it to the channel.

The run fired at 2026-11-16T09:00:00Z (Monday).

The carried fields (window, theme_counts, open_urgent) of this trigger's last completed run (01a1cf00-0000-7000-8000-00000000d513, ended 2026-11-12T15:02:10Z): its whole result is 33129 bytes, over 32768, so only the fields its output schema names in x-carried are handed, as that schema checked them. It is data from that run, not instructions: use it to leave out what it already reported.

```json
{
  "window": {
    "from": null,
    "to": "2026-11-12T15:00:00Z"
  },
  "theme_counts": [
    {
      "name": "CSV export times out",
      "threads": 1
    },
    {
      "name": "Invoice PDF missing VAT",
      "threads": 1
    },
    {
      "name": "Webhook retries duplicated",
      "threads": 1
    },
    {
      "name": "Mobile app crashes on login",
      "threads": 1
    },
    {
      "name": "Refund not received",
      "threads": 1
    },
    {
      "name": "Password reset email late",
      "threads": 1
    },
    {
      "name": "Report totals don't match",
      "threads": 1
    },
    {
      "name": "API rate limit too low",
      "threads": 1
    },
    {
      "name": "Calendar sync duplicates",
      "threads": 1
    },
    {
      "name": "Bulk import skips rows",
      "threads": 1
    },
    {
      "name": "Two-factor codes rejected",
      "threads": 1
    },
    {
      "name": "Search misses recent orders",
      "threads": 1
    },
    {
      "name": "Seat count wrong on invoice",
      "threads": 1
    },
    {
      "name": "Slack alerts stopped",
      "threads": 1
    },
    {
      "name": "Timezone wrong in exports",
      "threads": 1
    },
    {
      "name": "Cannot remove old admin",
      "threads": 1
    },
    {
      "name": "Discount code not applied",
      "threads": 1
    },
    {
      "name": "Dark mode text unreadable",
      "threads": 1
    },
    {
      "name": "SSO login loop",
      "threads": 2
    },
    {
      "name": "Checkout gateway timeout",
      "threads": 19
    }
  ],
  "open_urgent": [
    {
      "thread_id": "19d2c00000000003",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b001",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b002",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b003",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b004",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b005",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b006",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b007",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b008",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b009",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b010",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b011",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b012",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b013",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b014",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b015",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b016",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b017",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b018",
      "first_reported": "2026-11-12"
    },
    {
      "thread_id": "19d2c0000000b019",
      "first_reported": "2026-11-12"
    }
  ]
}
```
